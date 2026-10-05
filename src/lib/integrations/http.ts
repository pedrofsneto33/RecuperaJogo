import { z } from "zod";
import { err, ok, type Result } from "./result";
import { logEvent } from "@/lib/log";

export class IntegrationError extends Error {
  readonly code: string;
  readonly status?: number;
  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = "IntegrationError";
    this.code = code;
    this.status = status;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchJson<T>(opts: {
  name: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  schema: z.ZodType<T>;
}): Promise<Result<T, IntegrationError>> {
  const timeoutMs = opts.timeoutMs ?? 8000;
  const retries = opts.retries ?? 2;
  let last: IntegrationError = new IntegrationError("unknown", `${opts.name} falhou`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(opts.url, {
        method: opts.method ?? "GET",
        headers: {
          Accept: "application/json",
          ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...opts.headers,
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: ctrl.signal,
      });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof raw === "object" && raw && "error" in raw
            ? String((raw as { error: unknown }).error)
            : `${opts.name} ${res.status}`;
        last = new IntegrationError("http", msg, res.status);
        logEvent("integration.http_error", { name: opts.name, status: res.status, attempt });
        if (res.status < 500 || attempt === retries) return err(last);
      } else {
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success) {
          last = new IntegrationError("schema", `${opts.name}: resposta inesperada`, res.status);
          return err(last);
        }
        return ok(parsed.data);
      }
    } catch (e) {
      const aborted = e instanceof Error && e.name === "AbortError";
      last = new IntegrationError(
        aborted ? "timeout" : "network",
        aborted ? `${opts.name}: tempo esgotado` : `${opts.name}: rede`,
      );
      logEvent("integration.network", { name: opts.name, attempt, timeout: aborted });
    } finally {
      clearTimeout(timer);
    }
    if (attempt < retries) await sleep(300 * 3 ** attempt);
  }
  return err(last);
}
