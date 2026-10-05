/** Logs estruturados. Nunca passe token, senha ou App ID. */
export function logEvent(event: string, fields?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    event,
    ...sanitize(fields),
  };
  console.info(JSON.stringify(payload));
}

function sanitize(fields?: Record<string, unknown>) {
  if (!fields) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    const key = k.toLowerCase();
    if (/(secret|token|password|authorization|appid|app_id|chave)/.test(key)) {
      out[k] = v ? "[redacted]" : "";
      continue;
    }
    out[k] = v;
  }
  return out;
}
