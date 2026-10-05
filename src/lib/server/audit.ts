import { getSql } from "@/lib/db";
import { logEvent } from "@/lib/log";

export async function logAudit(input: {
  actorUserId: string;
  action: string;
  target?: string;
  ip?: string | null;
  meta?: Record<string, unknown>;
}) {
  const sql = await getSql();
  await sql`
    create table if not exists audit_logs (
      id         serial primary key,
      actor_id   text not null,
      action     text not null,
      target     text,
      ip         text,
      meta       text,
      created_at timestamptz not null default now()
    )
  `;
  const meta = JSON.stringify(input.meta ?? {});
  await sql`
    insert into audit_logs (actor_id, action, target, ip, meta)
    values (${input.actorUserId}, ${input.action}, ${input.target ?? null}, ${input.ip ?? null}, ${meta})
  `;
  logEvent("audit", { action: input.action, target: input.target ?? null });
}
