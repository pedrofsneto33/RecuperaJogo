import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export type ShieldStatus = {
  locked: boolean;
  lockedUntil: string | null;
  urgeCount: number;
};

function hashPin(pin: string, salt: Buffer) {
  return scryptSync(pin, salt, 32);
}

function packHash(salt: Buffer, hash: Buffer) {
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function unpackHash(stored: string) {
  const [s, h] = stored.split(":");
  return { salt: Buffer.from(s, "hex"), hash: Buffer.from(h, "hex") };
}

async function readStatus(userId: string): Promise<ShieldStatus> {
  const sql = await getSql();
  const locks = await sql<{ locked_until: string }>`
    select locked_until from shield_locks where user_id = ${userId} limit 1
  `;
  const until = locks[0]?.locked_until ?? null;
  const locked = until ? new Date(until).getTime() > Date.now() : false;
  const counts = await sql<{ n: number }>`
    select count(*)::int as n from urge_logs where user_id = ${userId}
  `;
  return {
    locked,
    lockedUntil: locked ? until : null,
    urgeCount: Number(counts[0]?.n ?? 0),
  };
}

export const getShield = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ShieldStatus> => {
    return readStatus(context.userId);
  });

export const startShieldLock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { pin: string; hours: number }) => input)
  .handler(async ({ context, data }): Promise<ShieldStatus> => {
    const pin = data.pin.replace(/\D/g, "");
    if (pin.length < 4 || pin.length > 8) throw new Error("PIN de 4 a 8 dígitos");
    const hours = Math.min(72, Math.max(1, Math.floor(data.hours)));
    const sql = await getSql();
    const sub = await sql<{ status: string }>`
      select status from subscriptions where user_id = ${context.userId} limit 1
    `;
    if (sub[0]?.status !== "active") {
      throw new Error("O cadeado do Escudo entra no pacote da petição. Compre para ativar.");
    }
    const salt = randomBytes(16);
    const hash = hashPin(pin, salt);
    const until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    await sql`
      insert into shield_locks (user_id, pin_hash, locked_until)
      values (${context.userId}, ${packHash(salt, hash)}, ${until})
      on conflict (user_id) do update set pin_hash = excluded.pin_hash, locked_until = excluded.locked_until
    `;
    await sql`
      insert into urge_logs (user_id, note) values (${context.userId}, ${"lock:" + hours + "h"})
    `;
    return readStatus(context.userId);
  });

export const unlockShield = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((pin: string) => pin)
  .handler(async ({ context, data: pinRaw }): Promise<ShieldStatus> => {
    const pin = pinRaw.replace(/\D/g, "");
    const sql = await getSql();
    const rows = await sql<{ pin_hash: string; locked_until: string }>`
      select pin_hash, locked_until from shield_locks where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("Nenhum cadeado ativo");
    if (new Date(row.locked_until).getTime() > Date.now()) {
      throw new Error("O cadeado só abre quando o tempo acabar. Isso é de propósito.");
    }
    const { salt, hash } = unpackHash(row.pin_hash);
    const next = hashPin(pin, salt);
    if (hash.length !== next.length || !timingSafeEqual(hash, next)) {
      throw new Error("PIN incorreto");
    }
    await sql`delete from shield_locks where user_id = ${context.userId}`;
    return readStatus(context.userId);
  });

export const logUrge = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((note?: string) => note ?? "")
  .handler(async ({ context, data: note }): Promise<ShieldStatus> => {
    const sql = await getSql();
    const texto = String(note ?? "").trim().slice(0, 280);
    await sql`insert into urge_logs (user_id, note) values (${context.userId}, ${texto})`;
    return readStatus(context.userId);
  });
