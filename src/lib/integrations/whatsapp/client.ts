import { z } from "zod";
import { fetchJson, IntegrationError } from "../http";
import type { Result } from "../result";
import { logEvent } from "@/lib/log";

const SendSchema = z.object({
  messages: z.array(z.object({ id: z.string().optional() })).optional(),
  error: z
    .object({
      message: z.string().optional(),
      code: z.number().optional(),
    })
    .optional(),
});

function digits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function telefoneE164(raw: string): string | null {
  const d = digits(raw);
  if (d.length < 10 || d.length > 15) return null;
  if (d.startsWith("55")) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

export async function sendWhatsAppText(input: {
  token: string;
  phoneNumberId: string;
  to: string;
  body: string;
}): Promise<Result<{ id?: string }, IntegrationError>> {
  const to = telefoneE164(input.to);
  if (!to) {
    return { ok: false, error: new IntegrationError("phone", "Telefone inválido") };
  }
  const res = await fetchJson({
    name: "whatsapp.send",
    url: `https://graph.facebook.com/v21.0/${encodeURIComponent(input.phoneNumberId)}/messages`,
    method: "POST",
    headers: { Authorization: `Bearer ${input.token}` },
    body: {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: input.body.slice(0, 1024), preview_url: false },
    },
    schema: SendSchema,
    timeoutMs: 8000,
    retries: 1,
  });
  if (!res.ok) return res;
  if (res.value.error?.message) {
    return {
      ok: false,
      error: new IntegrationError("api", res.value.error.message, res.value.error.code),
    };
  }
  logEvent("whatsapp.sent", { toSuffix: to.slice(-4) });
  return { ok: true, value: { id: res.value.messages?.[0]?.id } };
}

export async function sendWhatsAppTemplate(input: {
  token: string;
  phoneNumberId: string;
  to: string;
  template: string;
  lang?: string;
}): Promise<Result<{ id?: string }, IntegrationError>> {
  const to = telefoneE164(input.to);
  if (!to) {
    return { ok: false, error: new IntegrationError("phone", "Telefone inválido") };
  }
  const res = await fetchJson({
    name: "whatsapp.template",
    url: `https://graph.facebook.com/v21.0/${encodeURIComponent(input.phoneNumberId)}/messages`,
    method: "POST",
    headers: { Authorization: `Bearer ${input.token}` },
    body: {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: input.template,
        language: { code: input.lang ?? "pt_BR" },
      },
    },
    schema: SendSchema,
    timeoutMs: 8000,
    retries: 1,
  });
  if (!res.ok) return res;
  if (res.value.error?.message) {
    return {
      ok: false,
      error: new IntegrationError("api", res.value.error.message, res.value.error.code),
    };
  }
  logEvent("whatsapp.template", { toSuffix: to.slice(-4) });
  return { ok: true, value: { id: res.value.messages?.[0]?.id } };
}

export async function pingWhatsApp(token: string, phoneNumberId: string): Promise<"ok" | "down"> {
  const res = await fetchJson({
    name: "whatsapp.ping",
    url: `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneNumberId)}?fields=id,display_phone_number`,
    headers: { Authorization: `Bearer ${token}` },
    schema: z.object({ id: z.string().optional() }).passthrough(),
    timeoutMs: 5000,
    retries: 0,
  });
  return res.ok ? "ok" : "down";
}
