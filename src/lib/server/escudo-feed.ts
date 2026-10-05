import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireOwner } from "./owner";
import { SITES_BLOQUEIO } from "@/lib/escudo/sites";

export type FeedItem = { dominio: string; grupo: string; nota: string; created_at: string };

export type ListaEscudo = {
  base: typeof SITES_BLOQUEIO;
  extras: FeedItem[];
  atualizadoEm: string | null;
  novos7d: number;
  dominios: string[];
};

async function ensure() {
  const sql = await getSql();
  await sql`insert into escudo_meta (id) values (1) on conflict (id) do nothing`;
}

export const getListaEscudo = createServerFn({ method: "GET" }).handler(async (): Promise<ListaEscudo> => {
  const fallback: ListaEscudo = {
    base: SITES_BLOQUEIO,
    extras: [],
    atualizadoEm: null,
    novos7d: 0,
    dominios: SITES_BLOQUEIO.map((s) => s.dominio),
  };
  try {
    await ensure();
    const sql = await getSql();
    const extras = await sql<FeedItem>`
      select dominio, grupo, coalesce(nota, '') as nota, created_at::text
      from escudo_feed
      order by created_at desc
    `;
    const meta = await sql<{ atualizado_em: string }>`
      select atualizado_em::text from escudo_meta where id = 1 limit 1
    `;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const novos7d = extras.filter((e) => Date.parse(e.created_at) >= weekAgo).length;
    const dominios = [
      ...SITES_BLOQUEIO.map((s) => s.dominio),
      ...extras.map((e) => e.dominio),
    ];
    return {
      base: SITES_BLOQUEIO,
      extras,
      atualizadoEm: meta[0]?.atualizado_em ?? null,
      novos7d,
      dominios: [...new Set(dominios)],
    };
  } catch {
    return fallback;
  }
});

export const addDominioEscudo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { dominio: string; grupo?: string; nota?: string }) => input)
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    const dominio = data.dominio
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "");
    if (dominio.length < 3 || !dominio.includes(".")) throw new Error("Domínio inválido");
    const sql = await getSql();
    await sql`
      insert into escudo_feed (dominio, grupo, nota)
      values (${dominio}, ${data.grupo === "br" ? "br" : "offshore"}, ${data.nota?.trim() ?? ""})
      on conflict (dominio) do update set nota = excluded.nota, grupo = excluded.grupo
    `;
    await sql`update escudo_meta set atualizado_em = now() where id = 1`;
    return getListaEscudo();
  });

export const removerDominioEscudo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { dominio: string }) => input)
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    const sql = await getSql();
    await sql`delete from escudo_feed where dominio = ${data.dominio}`;
    await sql`update escudo_meta set atualizado_em = now() where id = 1`;
    return getListaEscudo();
  });
