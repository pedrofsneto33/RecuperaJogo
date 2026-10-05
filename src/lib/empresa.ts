/** Dados da controladora — Primex Sistemas LTDA. */
export const EMPRESA = {
  razao: "PRIMEX SISTEMAS LTDA",
  nomeFantasia: "Primex Sistemas",
  cnpj: "55.536.885/0001-30",
  email: "pedrofsneto33@gmail.com",
  telefone: "(86) 98811-7925",
  telefoneE164: "5586988117925",
  cidade: "Teresina",
  uf: "PI",
  produto: "RecuperaJogo",
  pixChave: "55536885000130",
  pixTitular: "PRIMEX SISTEMAS",
  pixCidade: "Teresina",
} as const;

export const OWNER_EMAIL = EMPRESA.email.toLowerCase();

export function isOwnerEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase() === OWNER_EMAIL;
}

export function waLink(text?: string) {
  const base = `https://wa.me/${EMPRESA.telefoneE164}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const COPYRIGHT = `© ${new Date().getFullYear()} ${EMPRESA.razao}. Todos os direitos reservados. ${EMPRESA.produto} é software da ${EMPRESA.nomeFantasia} — não é sociedade de advogados.`;
