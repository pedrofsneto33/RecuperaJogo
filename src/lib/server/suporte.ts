import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { EMPRESA } from "@/lib/empresa";

export const abrirTicket = createServerFn({ method: "POST" })
  .validator((input: { email: string; tipo: string; mensagem: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inválido");
    }
    const tipo = ["suporte", "senha", "lgpd"].includes(data.tipo) ? data.tipo : "suporte";
    const mensagem = data.mensagem.trim().slice(0, 2000);
    if (mensagem.length < 8) throw new Error("Descreva o pedido com pelo menos 8 caracteres");
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into support_tickets (email, tipo, mensagem)
      values (${email}, ${tipo}, ${mensagem})
      returning id
    `;
    return {
      ok: true as const,
      protocolo: rows[0]?.id ?? 0,
      contato: EMPRESA.email,
      telefone: EMPRESA.telefone,
    };
  });
