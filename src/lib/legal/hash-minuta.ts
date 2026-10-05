import { EMPRESA } from "@/lib/empresa";

export type SeloMinuta = {
  hash: string;
  iso: string;
  rodape: string;
};

async function sha256hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function assinarMinuta(texto: string, email: string): Promise<SeloMinuta> {
  const iso = new Date().toISOString();
  const bruto = await sha256hex(`${texto}\n${email.trim().toLowerCase()}\n${iso}\n${EMPRESA.cnpj}`);
  const hash = bruto.slice(0, 16).toUpperCase();
  const quando = new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const rodape = `

---
SELO ${EMPRESA.produto} · ${EMPRESA.razao} · CNPJ ${EMPRESA.cnpj}
Minuta gerada em ${quando} (America/Sao_Paulo).
Hash SHA-256 (16): ${hash}
Esta minuta é deste usuário, nesta hora. Cópia sem selo não é o rascunho pago.
Não constitui peça assinada por advogado. Revise antes de protocolar ou enviar.
`;
  return { hash, iso, rodape };
}
