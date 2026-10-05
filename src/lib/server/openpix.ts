import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { PRECO_REAIS, PRECO_RH_REAIS } from "@/lib/legal/constantes";
import { criarCobrancaOpenPix } from "@/lib/integrations/openpix/client";
import { montarPayloadPix, novoTxid } from "@/lib/payments/pix";
import { confirmarPixPago } from "./pix-confirm";

export type CobrancaPix = {
  txid: string;
  brCode: string;
  autoConfirma: boolean;
  valorReais: number;
  titular: string;
  chaveMascarada: string;
};

function mask(chave: string) {
  const t = chave.trim();
  if (t.length <= 6) return t ? "••••" : "";
  return `${t.slice(0, 3)}••••${t.slice(-3)}`;
}

async function settings() {
  const sql = await getSql();
  await sql`insert into site_settings (id) values (1) on conflict (id) do nothing`;
  const rows = await sql<{
    pix_chave: string;
    pix_titular: string;
    pix_cidade: string;
    openpix_app_id: string;
    webhook_secret: string;
  }>`
    select pix_chave, pix_titular, pix_cidade,
           coalesce(openpix_app_id, '') as openpix_app_id,
           coalesce(webhook_secret, '') as webhook_secret
    from site_settings where id = 1 limit 1
  `;
  return rows[0] ?? {
    pix_chave: "",
    pix_titular: "",
    pix_cidade: "",
    openpix_app_id: "",
    webhook_secret: "",
  };
}

async function criarChargeOpenPix(appId: string, txid: string, cents: number) {
  const res = await criarCobrancaOpenPix({ appId, txid, cents });
  if (!res.ok) throw new Error(res.error.message);
  return res.value.brCode;
}

export const criarCobrancaPix = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input?: { produto?: "pacote" | "rh" }) => ({
    produto: input?.produto === "rh" ? ("rh" as const) : ("pacote" as const),
  }))
  .handler(async ({ context, data }): Promise<CobrancaPix> => {
    const s = await settings();
    const chave = s.pix_chave.trim();
    if (!chave) throw new Error("PIX da Primex ainda não foi configurado.");
    const txid = novoTxid();
    const produto = data.produto;
    const valorReais = produto === "rh" ? PRECO_RH_REAIS : PRECO_REAIS;
    const cents = Math.round(valorReais * 100);
    const appId = s.openpix_app_id.trim();
    let brCode = "";
    let provider = "static";
    if (appId) {
      try {
        brCode = await criarChargeOpenPix(appId, txid, cents);
        provider = "openpix";
      } catch {
        brCode = montarPayloadPix({
          chave,
          titular: s.pix_titular || "PRIMEX SISTEMAS",
          cidade: s.pix_cidade || "Teresina",
          valorReais,
          txid,
        });
        provider = "static";
      }
    } else {
      brCode = montarPayloadPix({
        chave,
        titular: s.pix_titular || "PRIMEX SISTEMAS",
        cidade: s.pix_cidade || "Teresina",
        valorReais,
        txid,
      });
    }
    const sql = await getSql();
    await sql`alter table pix_orders add column if not exists produto text not null default 'pacote'`;
    await sql`
      insert into subscriptions (user_id, status, peticoes_usadas)
      values (${context.userId}, 'pix_pending', 0)
      on conflict (user_id) do update set status = case
        when subscriptions.status = 'active' then subscriptions.status
        else 'pix_pending'
      end
    `;
    await sql`
      insert into pix_orders (user_id, amount_cents, txid, status, provider, produto)
      values (${context.userId}, ${cents}, ${txid}, 'pending', ${provider}, ${produto})
      on conflict (txid) do nothing
    `;
    if (produto !== "rh") {
      await sql`
        update subscriptions set pix_txid = ${txid}, payment_method = 'pix'
        where user_id = ${context.userId} and status <> 'active'
      `;
    }
    return {
      txid,
      brCode,
      autoConfirma: provider === "openpix" && Boolean(s.webhook_secret.trim()),
      valorReais,
      titular: s.pix_titular,
      chaveMascarada: mask(chave),
    };
  });

export async function processarWebhookPix(request: Request) {
  const s = await settings();
  const secret = s.webhook_secret.trim();
  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    const hdr =
      request.headers.get("x-webhook-secret") ??
      request.headers.get("x-openpix-authorization") ??
      "";
    const bearer = auth.replace(/^Bearer\s+/i, "").trim();
    if (hdr !== secret && bearer !== secret && auth !== secret) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const charge = (body.charge ?? body) as Record<string, unknown>;
  const event = String(body.event ?? body.type ?? "");
  const status = String(charge.status ?? body.status ?? "").toUpperCase();
  const paid =
    event.includes("CHARGE_COMPLETED") ||
    event.includes("PAYMENT_RECEIVED") ||
    status === "COMPLETED" ||
    status === "PAID" ||
    status === "RECEIVED" ||
    body.paid === true;
  if (!paid) return Response.json({ ok: true, ignored: true });
  const txid = String(charge.correlationID ?? charge.txid ?? body.correlationID ?? body.txid ?? "");
  const value = Number(charge.value ?? body.value ?? body.amount_cents ?? 0);
  const result = await confirmarPixPago(txid, value > 0 ? value : undefined);
  return Response.json(result, { status: result.ok ? 200 : 404 });
}
