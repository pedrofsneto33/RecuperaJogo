/** Salário mínimo nacional 2026 — Decreto 12.797/2025 */
export const SALARIO_MINIMO_2026 = 1621;

/** Art. 9º da Lei 9.099/95 — teto para atuar sem advogado (jus postulandi) */
export const LIMITE_JUS_POSTULANDI = SALARIO_MINIMO_2026 * 20;

/**
 * Art. 3º, I, da Lei 9.099/95 — teto de competência do JEC.
 * Entre 20 e 40 SM ainda é JEC, mas exige advogado.
 */
export const LIMITE_COMPETENCIA_JEC = SALARIO_MINIMO_2026 * 40;

/** Alias legado: o que o produto realmente bloqueia é o jus postulandi. */
export const LIMITE_JEC = LIMITE_JUS_POSTULANDI;

export const MAX_PETICOES = 3;
export const PRECO_REAIS = 137;
/** Kit RH (B2B) — mesmo PIX da Primex, outro produto. */
export const PRECO_RH_REAIS = 497;

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function faixaValorCausa(valor: number): "ok" | "advogado_jec" | "justica_comum" {
  if (valor > LIMITE_COMPETENCIA_JEC) return "justica_comum";
  if (valor > LIMITE_JUS_POSTULANDI) return "advogado_jec";
  return "ok";
}
