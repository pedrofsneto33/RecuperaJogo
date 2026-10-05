import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { MAX_PETICOES, PRECO_REAIS } from "@/lib/legal/constantes";
import { souDono } from "./owner";

export type Access = {
  status: "pending" | "active" | "pix_pending";
  peticoesUsadas: number;
  remaining: number;
  pixTxid: string | null;
  kitRh: boolean;
  telefone: string | null;
  role: "OWNER" | "CLIENT";
};

async function ensureRow(userId: string) {
  const sql = await getSql();
  await sql`alter table subscriptions add column if not exists kit_rh boolean not null default false`;
  await sql`alter table subscriptions add column if not exists telefone text`;
  await sql`alter table petitions add column if not exists hash text`;
  await sql`alter table petitions add column if not exists doc_tipo text not null default 'peticao'`;
  await sql`
    insert into subscriptions (user_id, status, peticoes_usadas)
    values (${userId}, 'pending', 0)
    on conflict (user_id) do nothing
  `;
}

async function readAccess(userId: string): Promise<Access> {
  const sql = await getSql();
  const rows = await sql<{
    status: string;
    peticoes_usadas: number;
    pix_txid: string | null;
    kit_rh: boolean | null;
    telefone: string | null;
  }>`
    select status, peticoes_usadas, pix_txid, coalesce(kit_rh, false) as kit_rh, telefone
    from subscriptions where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  const usadas = Number(row?.peticoes_usadas ?? 0);
  const raw = row?.status ?? "pending";
  const status: Access["status"] =
    raw === "active" ? "active" : raw === "pix_pending" ? "pix_pending" : "pending";
  return {
    status,
    peticoesUsadas: usadas,
    remaining: Math.max(0, MAX_PETICOES - usadas),
    pixTxid: row?.pix_txid ?? null,
    kitRh: Boolean(row?.kit_rh),
    telefone: row?.telefone ?? null,
    role: (await souDono(userId)) ? "OWNER" : "CLIENT",
  };
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Access> => {
    await ensureRow(context.userId);
    return readAccess(context.userId);
  });

async function pixEstaConfigurado() {
  const sql = await getSql();
  try {
    const rows = await sql<{ pix_chave: string | null }>`
      select pix_chave from site_settings where id = 1 limit 1
    `;
    return Boolean(rows[0]?.pix_chave?.trim());
  } catch {
    return false;
  }
}

export const activateAccess = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Access> => {
    await ensureRow(context.userId);
    const dono = await souDono(context.userId);
    if (!dono && (await pixEstaConfigurado())) {
      throw new Error("Liberação só pelo PIX confirmado ou pelo Painel da Primex.");
    }
    const sql = await getSql();
    await sql`
      update subscriptions
      set status = 'active', payment_method = 'demo', activated_at = now()
      where user_id = ${context.userId}
    `;
    return readAccess(context.userId);
  });

export const registrarPix = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { txid: string; liberar: boolean }) => input)
  .handler(async ({ context, data }): Promise<Access> => {
    await ensureRow(context.userId);
    const txid = data.txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25);
    if (!txid) throw new Error("TXID inválido");
    const sql = await getSql();
    await sql`
      insert into pix_orders (user_id, amount_cents, txid, status)
      values (
        ${context.userId},
        ${Math.round(PRECO_REAIS * 100)},
        ${txid},
        ${data.liberar ? "self_declared" : "pending"}
      )
      on conflict (txid) do nothing
    `;
    await sql`
      update subscriptions
      set
        pix_txid = ${txid},
        payment_method = 'pix',
        status = ${data.liberar ? "active" : "pix_pending"},
        activated_at = case when ${data.liberar} then now() else activated_at end
      where user_id = ${context.userId}
    `;
    return readAccess(context.userId);
  });

export const activateKitRh = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Access> => {
    await ensureRow(context.userId);
    const dono = await souDono(context.userId);
    if (!dono && (await pixEstaConfigurado())) {
      throw new Error("Kit RH só libera pelo PIX de R$ 497 ou pelo Painel da Primex.");
    }
    const sql = await getSql();
    await sql`
      update subscriptions
      set kit_rh = true, payment_method = coalesce(payment_method, 'demo')
      where user_id = ${context.userId}
    `;
    return readAccess(context.userId);
  });

export const consumePetition = createServerFn({ method: "POST" })
  .validator((input: { perfil: string; hash?: string; tipo?: string; corpo?: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }): Promise<Access> => {
    const sql = await getSql();
    await sql`alter table petitions add column if not exists corpo text`;
    const rows = await sql<{ status: string; peticoes_usadas: number; kit_rh: boolean | null }>`
      select status, peticoes_usadas, coalesce(kit_rh, false) as kit_rh
      from subscriptions where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    const tipo = data.tipo ?? "peticao";
    if (!row) throw new Error("Acesso inativo");
    if (tipo === "rh") {
      if (!row.kit_rh) throw new Error("Kit RH não liberado");
    } else if (row.status !== "active") {
      throw new Error("Acesso inativo");
    }
    if (tipo !== "rh") {
      const usadas = Number(row.peticoes_usadas);
      if (usadas >= MAX_PETICOES) {
        throw new Error("Limite de petições atingido");
      }
      await sql`
        update subscriptions
        set peticoes_usadas = peticoes_usadas + 1
        where user_id = ${context.userId} and peticoes_usadas < ${MAX_PETICOES}
      `;
    }
    const corpo = (data.corpo ?? "").slice(0, 80000);
    await sql`
      insert into petitions (user_id, perfil, hash, doc_tipo, corpo)
      values (${context.userId}, ${data.perfil}, ${data.hash ?? null}, ${tipo}, ${corpo || null})
    `;
    return readAccess(context.userId);
  });

export type MinutaResumo = {
  id: number;
  perfil: string;
  hash: string | null;
  docTipo: string;
  createdAt: string;
};

export const getMyMinutas = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<MinutaResumo[]> => {
    const sql = await getSql();
    await sql`alter table petitions add column if not exists corpo text`;
    const rows = await sql<{
      id: number;
      perfil: string;
      hash: string | null;
      doc_tipo: string | null;
      created_at: string;
    }>`
      select id, perfil, hash, coalesce(doc_tipo, 'peticao') as doc_tipo, created_at::text
      from petitions
      where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
    return rows.map((r) => ({
      id: r.id,
      perfil: r.perfil,
      hash: r.hash,
      docTipo: r.doc_tipo ?? "peticao",
      createdAt: r.created_at,
    }));
  });

export const getMinuta = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => input)
  .handler(async ({ context, data }): Promise<{ texto: string; hash: string | null }> => {
    const sql = await getSql();
    const rows = await sql<{ corpo: string | null; hash: string | null }>`
      select corpo, hash from petitions
      where id = ${data.id} and user_id = ${context.userId}
      limit 1
    `;
    const row = rows[0];
    if (!row?.corpo) throw new Error("Minuta não encontrada");
    return { texto: row.corpo, hash: row.hash };
  });

export const salvarTelefone = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { telefone: string }) => input)
  .handler(async ({ context, data }): Promise<Access> => {
    await ensureRow(context.userId);
    const tel = data.telefone.replace(/\D/g, "").slice(0, 15);
    const sql = await getSql();
    await sql`update subscriptions set telefone = ${tel || null} where user_id = ${context.userId}`;
    return readAccess(context.userId);
  });

export const saveLead = createServerFn({ method: "POST" })
  .validator((payload: { email: string; nome?: string; origem?: string }) => payload)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inválido");
    }
    const sql = await getSql();
    const nome = data.nome?.trim() || "";
    await sql`
      insert into leads (email, nome, origem)
      values (${email}, ${nome}, ${data.origem ?? "guia"})
    `;
    return { ok: true as const };
  });
