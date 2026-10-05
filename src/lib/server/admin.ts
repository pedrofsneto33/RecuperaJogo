import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireOwner, souDono } from "./owner";

export const getSouDono = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ({ dono: await souDono(context.userId) }));

export const getPainel = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireOwner(context.userId);
    const sql = await getSql();

    const users = await sql<{
      id: string;
      email: string;
      name: string;
      createdAt: string;
      status: string;
      peticoes_usadas: number;
      pix_txid: string | null;
      kit_rh: boolean;
    }>`
      select u.id, u.email, u.name, u."createdAt"::text as "createdAt",
             coalesce(s.status, 'nenhum') as status,
             coalesce(s.peticoes_usadas, 0)::int as peticoes_usadas,
             s.pix_txid,
             coalesce(s.kit_rh, false) as kit_rh
      from "user" u
      left join subscriptions s on s.user_id = u.id
      order by u."createdAt" desc
      limit 80
    `;

    const tickets = await sql<{
      id: number;
      email: string;
      tipo: string;
      mensagem: string;
      status: string;
      created_at: string;
    }>`
      select id, email, tipo, mensagem, status, created_at::text
      from support_tickets
      order by created_at desc
      limit 80
    `;

    const leads = await sql<{ email: string; origem: string; created_at: string }>`
      select email, origem, created_at::text from leads order by created_at desc limit 40
    `;

    const pix = await sql<{
      txid: string;
      status: string;
      amount_cents: number;
      provider: string;
      created_at: string;
      paid_at: string | null;
    }>`
      select txid, status, amount_cents,
             coalesce(provider, 'static') as provider,
             created_at::text, paid_at::text
      from pix_orders
      order by created_at desc
      limit 40
    `;

    const peticoes = await sql<{ n: number }>`select count(*)::int as n from petitions`;
    const ativos = await sql<{ n: number }>`
      select count(*)::int as n from subscriptions where status = 'active'
    `;
    await sql`
      create table if not exists audit_logs (
        id serial primary key,
        actor_id text not null,
        action text not null,
        target text,
        ip text,
        meta text,
        created_at timestamptz not null default now()
      )
    `;
    const audit = await sql<{
      id: number;
      action: string;
      target: string | null;
      ip: string | null;
      created_at: string;
    }>`
      select id, action, target, ip, created_at::text
      from audit_logs
      order by created_at desc
      limit 30
    `;

    return {
      users,
      tickets,
      leads,
      pix,
      audit,
      totais: {
        contas: users.length,
        ativos: Number(ativos[0]?.n ?? 0),
        peticoes: Number(peticoes[0]?.n ?? 0),
        ticketsAbertos: tickets.filter((t) => t.status === "aberto").length,
        pixPagos: pix.filter((p) => p.status === "paid").length,
      },
    };
  });

export const marcarTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number; status: "aberto" | "resolvido" }) => input)
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    const sql = await getSql();
    await sql`update support_tickets set status = ${data.status} where id = ${data.id}`;
    return { ok: true as const };
  });

export const liberarCliente = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { userId: string; kitRh?: boolean }) => input)
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    const sql = await getSql();
    await sql`
      insert into subscriptions (user_id, status, peticoes_usadas, activated_at, payment_method, kit_rh)
      values (${data.userId}, 'active', 0, now(), 'manual', ${Boolean(data.kitRh)})
      on conflict (user_id) do update
        set status = 'active',
            activated_at = now(),
            payment_method = 'manual',
            kit_rh = subscriptions.kit_rh or ${Boolean(data.kitRh)}
    `;
    const { clientIp } = await import("./request-ip.server");
    const { logAudit } = await import("./audit");
    await logAudit({
      actorUserId: context.userId,
      action: data.kitRh ? "client.liberar_rh" : "client.liberar",
      target: data.userId,
      ip: clientIp(),
    });
    return { ok: true as const };
  });
