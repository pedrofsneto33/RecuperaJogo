import { z } from "zod";
import { fetchJson, IntegrationError } from "../http";
import type { Result } from "../result";

const ChargeSchema = z.object({
  charge: z
    .object({
      brCode: z.string().optional(),
      correlationID: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export async function criarCobrancaOpenPix(input: {
  appId: string;
  txid: string;
  cents: number;
  comment?: string;
}): Promise<Result<{ brCode: string; correlationID?: string }, IntegrationError>> {
  const res = await fetchJson({
    name: "openpix.charge",
    url: "https://api.openpix.com.br/api/v1/charge",
    method: "POST",
    headers: { Authorization: input.appId },
    body: {
      correlationID: input.txid,
      value: input.cents,
      comment: input.comment ?? "RecuperaJogo — Primex Sistemas",
    },
    schema: ChargeSchema,
    timeoutMs: 8000,
    retries: 2,
  });
  if (!res.ok) return res;
  const br = res.value.charge?.brCode;
  if (!br) {
    return {
      ok: false,
      error: new IntegrationError(
        "empty",
        res.value.error || res.value.message || "OpenPix sem QR",
      ),
    };
  }
  return { ok: true, value: { brCode: br, correlationID: res.value.charge?.correlationID } };
}

export async function pingOpenPix(appId: string): Promise<"ok" | "down"> {
  const res = await fetchJson({
    name: "openpix.ping",
    url: "https://api.openpix.com.br/api/v1/charge?limit=1",
    headers: { Authorization: appId },
    schema: z.object({}).passthrough(),
    timeoutMs: 5000,
    retries: 0,
  });
  return res.ok ? "ok" : "down";
}
