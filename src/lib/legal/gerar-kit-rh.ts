import { EMPRESA } from "@/lib/empresa";

export type DadosRh = {
  empresa: string;
  cnpj: string;
  cidade: string;
  uf: string;
  responsavel: string;
  pecas: Array<"politica" | "termo" | "encaminhamento">;
};

export function montarKitRh(d: DadosRh): string {
  const emp = d.empresa || "[RAZÃO SOCIAL]";
  const cnpj = d.cnpj || "[CNPJ]";
  const cidade = d.cidade || "[CIDADE]";
  const uf = d.uf || "[UF]";
  const resp = d.responsavel || "[RESPONSÁVEL DE RH]";
  const data = new Date().toLocaleDateString("pt-BR");
  const pecas = d.pecas.length ? d.pecas : (["politica", "termo", "encaminhamento"] as const);

  const blocos: string[] = [];

  if (pecas.includes("politica")) {
    blocos.push(`POLÍTICA INTERNA — PREVENÇÃO AO JOGO PROBLEMÁTICO NO TRABALHO
${emp} · CNPJ ${cnpj}
Vigência a partir de ${data}. Revisão anual.

1. Objetivo
Reduzir risco de prejuízo por apostas on-line no expediente e fora dele, quando o canal da empresa for usado. Isto NÃO é diagnóstico médico, NÃO substitui PCMSO/eSocial e NÃO é parecer trabalhista.

2. O que a lei de apostas cobre — e o que não cobre
A Lei nº 14.790/2023 e as Portarias da SPA/MF regulam o operador de apostas, não o contrato de emprego. O dever geral de ambiente de trabalho saudável (CLT e normas de segurança) continua com o empregador. Este kit não interpreta justa causa, atestado ou estabilidade.

3. Regras mínimas sugeridas
- Apostas e cassino on-line em dispositivo corporativo: vedados.
- Lista de bloqueio (Escudo RecuperaJogo / DNS) no Wi-Fi da empresa, revista semanalmente.
- Canal interno confidencial para pedir ajuda, sem punição automática pelo pedido.
- Encaminhamento voluntário a CAPS, CVV 188 ou serviço de saúde conveniado.

4. O que o RH não deve fazer
Não “acusar” o colaborador de ludopatia sem laudo. Não vazar o pedido de ajuda. Não usar este texto como prova em processo — é modelo interno.

Responsável: ${resp}
${cidade}/${uf}, ${data}.`);
  }

  if (pecas.includes("termo")) {
    blocos.push(`TERMO DE CIÊNCIA — JOGO ON-LINE E DISPOSITIVO DA EMPRESA

Eu, [NOME DO COLABORADOR], CPF [CPF], declaro que:

1. Fui informado(a) de que apostas e jogos de azar on-line em equipamento, e-mail ou rede da ${emp} não são permitidos;
2. Recebi indicação do CVV 188 e do CAPS da minha cidade, de forma voluntária;
3. Este termo NÃO é confissão de doença, NÃO é sanção e NÃO substitui avaliação clínica;
4. Posso recusar o encaminhamento de saúde. A recusa não autoriza exposição da minha intimidade.

${cidade}/${uf}, ${data}.

_______________________________
Colaborador(a)

_______________________________
${resp} · ${emp}`);
  }

  if (pecas.includes("encaminhamento")) {
    blocos.push(`ENCAMINHAMENTO VOLUNTÁRIO (MODELO)

À equipe de saúde / CAPS / serviço conveniado.

A ${emp} (CNPJ ${cnpj}) encaminha, a pedido da própria pessoa, [NOME], para avaliação de saúde mental relacionada a jogo problemático, se o profissional entender cabível.

Não enviamos prontuário. Não pedimos laudo para fins de punição. CVV 188 permanece disponível 24h.

${cidade}/${uf}, ${data}.
${resp}`);
  }

  return `${blocos.join("\n\n==========\n\n")}

---
KIT RH gerado por ${EMPRESA.produto} · ${EMPRESA.razao}. Software, não consultoria jurídica nem médica.
Não use como peça contra o colaborador. Lei 14.790 regula a casa de apostas, não o contrato de trabalho.
`;
}
