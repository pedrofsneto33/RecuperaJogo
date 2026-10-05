import { getSql } from "@/lib/db";
import { EMPRESA } from "@/lib/empresa";
import { logEvent } from "@/lib/log";
import { sendWhatsAppTemplate, sendWhatsAppText } from "@/lib/integrations/whatsapp/client";

export async function notificarPagamento(input: {
  userId: string;
  produto: "pacote" | "rh";
  txid: string;
}) {
  const sql = await getSql();
  await sql`alter table site_settings add column if not exists wa_token text not null default ''`;
  await sql`alter table site_settings add column if not exists wa_phone_id text not null default ''`;
  await sql`alter table site_settings add column if not exists wa_template text not null default ''`;
  const rows = await sql<{
    wa_token: string;
    wa_phone_id: string;
    wa_template: string;
  }>`
    select coalesce(wa_token, '') as wa_token,
           coalesce(wa_phone_id, '') as wa_phone_id,
           coalesce(wa_template, '') as wa_template
    from site_settings where id = 1 limit 1
  `;
  const cfg = rows[0];
  const token = cfg?.wa_token.trim() ?? "";
  const phoneId = cfg?.wa_phone_id.trim() ?? "";
  if (!token || !phoneId) {
    logEvent("whatsapp.skip", { reason: "not_configured" });
    return;
  }

  const users = await sql<{ email: string; telefone: string | null }>`
    select u.email, s.telefone
    from "user" u
    left join subscriptions s on s.user_id = u.id
    where u.id = ${input.userId}
    limit 1
  `;
  const email = users[0]?.email ?? "cliente";
  const clienteTel = users[0]?.telefone?.trim() || "";
  const item = input.produto === "rh" ? "Kit RH" : "pacote RecuperaJogo";
  const bodyDono = `PIX confirmado — ${item}. Cliente ${email}. TX ${input.txid}.`;

  const template = cfg?.wa_template.trim() ?? "";
  const send = async (to: string, text: string) => {
    if (template) {
      const t = await sendWhatsAppTemplate({
        token,
        phoneNumberId: phoneId,
        to,
        template,
      });
      if (t.ok) return;
    }
    await sendWhatsAppText({ token, phoneNumberId: phoneId, to, body: text });
  };

  await send(EMPRESA.telefoneE164, bodyDono);
  if (clienteTel) {
    await send(
      clienteTel,
      `Pagamento confirmado na ${EMPRESA.nomeFantasia}. Sua conta do ${item} já está liberada. Entre em RecuperaJogo.`,
    );
  }
}
