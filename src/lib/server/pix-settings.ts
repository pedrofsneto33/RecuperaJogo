import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireOwner, souDono } from "./owner";
import { EMPRESA } from "@/lib/empresa";

export type PixPublico = {
  configurado: boolean;
  titular: string;
  cidade: string;
  chaveMascarada: string;
  chave: string;
  autoConfirma: boolean;
};

function mask(chave: string) {
  const t = chave.trim();
  if (t.length <= 6) return t ? "••••" : "";
  return `${t.slice(0, 3)}••••${t.slice(-3)}`;
}

function novoSecret() {
  const n = Date.now().toString(36) + Math.random().toString(36).slice(2, 18);
  return n.replace(/[^A-Za-z0-9]/g, "").slice(0, 32);
}

async function ensure() {
  const sql = await getSql();
  await sql`insert into site_settings (id) values (1) on conflict (id) do nothing`;
  await sql`alter table site_settings add column if not exists wa_token text not null default ''`;
  await sql`alter table site_settings add column if not exists wa_phone_id text not null default ''`;
  await sql`alter table site_settings add column if not exists wa_template text not null default ''`;
  await sql`
    update site_settings
    set pix_chave = ${EMPRESA.pixChave},
        pix_titular = ${EMPRESA.pixTitular},
        pix_cidade = ${EMPRESA.pixCidade},
        updated_at = now()
    where id = 1 and (pix_chave is null or btrim(pix_chave) = '')
  `;
}

export const getPixPublico = createServerFn({ method: "GET" }).handler(async (): Promise<PixPublico> => {
  await ensure();
  const sql = await getSql();
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
  const row = rows[0];
  const chave = row?.pix_chave?.trim() ?? "";
  return {
    configurado: chave.length > 0,
    titular: row?.pix_titular ?? "",
    cidade: row?.pix_cidade ?? "",
    chaveMascarada: mask(chave),
    chave,
    autoConfirma: Boolean(row?.openpix_app_id?.trim() && row?.webhook_secret?.trim()),
  };
});

export const getPixAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensure();
    const dono = await souDono(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      pix_chave: string;
      pix_titular: string;
      pix_cidade: string;
      openpix_app_id: string;
      webhook_secret: string;
      wa_token: string;
      wa_phone_id: string;
      wa_template: string;
    }>`
      select pix_chave, pix_titular, pix_cidade,
             coalesce(openpix_app_id, '') as openpix_app_id,
             coalesce(webhook_secret, '') as webhook_secret,
             coalesce(wa_token, '') as wa_token,
             coalesce(wa_phone_id, '') as wa_phone_id,
             coalesce(wa_template, '') as wa_template
      from site_settings where id = 1 limit 1
    `;
    const row = rows[0];
    return {
      podeEditar: dono,
      chave: dono ? (row?.pix_chave ?? "") : "",
      titular: row?.pix_titular ?? "",
      cidade: row?.pix_cidade ?? "",
      openpixAppId: dono ? (row?.openpix_app_id ?? "") : "",
      webhookSecret: dono ? (row?.webhook_secret ?? "") : "",
      waToken: dono ? (row?.wa_token ?? "") : "",
      waPhoneId: dono ? (row?.wa_phone_id ?? "") : "",
      waTemplate: dono ? (row?.wa_template ?? "") : "",
      waPronto: Boolean(row?.wa_token?.trim() && row?.wa_phone_id?.trim()),
    };
  });

export const salvarPix = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    chave: string;
    titular: string;
    cidade: string;
    openpixAppId?: string;
    webhookSecret?: string;
    waToken?: string;
    waPhoneId?: string;
    waTemplate?: string;
  }) => input)
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    await ensure();
    const chave = data.chave.trim();
    const titular = data.titular.trim().slice(0, 80);
    const cidade = data.cidade.trim().slice(0, 40);
    if (!chave) throw new Error("Cole a chave PIX");
    if (!titular) throw new Error("Informe o nome do recebedor");
    const openpix = (data.openpixAppId ?? "").trim();
    let secret = (data.webhookSecret ?? "").trim();
    if (openpix && !secret) secret = novoSecret();
    const { clientIp } = await import("./request-ip.server");
    const { logAudit } = await import("./audit");
    const waToken = (data.waToken ?? "").trim();
    const waPhoneId = (data.waPhoneId ?? "").trim();
    const waTemplate = (data.waTemplate ?? "").trim();
    const sql = await getSql();
    await sql`
      update site_settings
      set pix_chave = ${chave},
          pix_titular = ${titular},
          pix_cidade = ${cidade || "Teresina"},
          openpix_app_id = ${openpix},
          webhook_secret = ${secret},
          wa_token = ${waToken},
          wa_phone_id = ${waPhoneId},
          wa_template = ${waTemplate},
          owner_user_id = ${context.userId},
          updated_at = now()
      where id = 1
    `;
    await logAudit({
      actorUserId: context.userId,
      action: "settings.update",
      ip: clientIp(),
      meta: { openpix: Boolean(openpix), whatsapp: Boolean((data.waToken ?? "").trim()) },
    });
    return { ok: true as const, webhookSecret: secret };
  });
