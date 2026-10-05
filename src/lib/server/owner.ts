import { getSql } from "@/lib/db";
import { isOwnerEmail } from "@/lib/empresa";

export async function emailDoUsuario(userId: string): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`
    select email from "user" where id = ${userId} limit 1
  `;
  return rows[0]?.email ?? null;
}

export async function requireOwner(userId: string) {
  const email = await emailDoUsuario(userId);
  if (!isOwnerEmail(email)) {
    throw new Error("Acesso restrito ao e-mail da Primex Sistemas.");
  }
  return email as string;
}

export async function souDono(userId: string) {
  return isOwnerEmail(await emailDoUsuario(userId));
}
