/** Peça-demonstração. Dados, valores e trechos operacionais vêm tarjados.
 *  Artigo de lei público pode aparecer — o fato concreto, não. */

export type DemoCaso = "autoexclusao" | "saque" | "ilegal";

export type DemoBloco = {
  k: string;
  titulo: string;
  linhas: DemoLinha[];
};

export type DemoLinha =
  | { t: "txt"; v: string }
  | { t: "hide"; w: "sm" | "md" | "lg"; hint: string };

export const DEMO_CASOS: { id: DemoCaso; label: string; resumo: string }[] = [
  {
    id: "autoexclusao",
    label: "Autoexclusão ignorada",
    resumo: "Pediu para parar. A casa ainda aceitou depósito.",
  },
  {
    id: "saque",
    label: "Saque travado",
    resumo: "Saldo próprio retido depois da MP.",
  },
  {
    id: "ilegal",
    label: "Casa sem .bet.br",
    resumo: "Operação irregular. Sem milagre de decreto.",
  },
];

export function blocosDemo(caso: DemoCaso): DemoBloco[] {
  const endereco: DemoBloco = {
    k: "caput",
    titulo: "Endereçamento",
    linhas: [
      { t: "txt", v: "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE" },
      { t: "hide", w: "md", hint: "Comarca e UF — só no rascunho pago" },
    ],
  };

  const partes: DemoBloco = {
    k: "partes",
    titulo: "Qualificação",
    linhas: [
      { t: "hide", w: "lg", hint: "Nome completo do autor" },
      { t: "txt", v: ", brasileiro(a), portador(a) do CPF nº" },
      { t: "hide", w: "md", hint: "CPF" },
      { t: "txt", v: ", residente em" },
      { t: "hide", w: "lg", hint: "Endereço" },
      { t: "txt", v: ", vem, por direito próprio (art. 9º da Lei 9.099/95 — jus postulandi), propor" },
      { t: "txt", v: "AÇÃO DE RESTITUIÇÃO DE VALORES C/C OBRIGAÇÃO DE FAZER em face de" },
      { t: "hide", w: "lg", hint: "Razão social e CNPJ da casa" },
      { t: "txt", v: "." },
    ],
  };

  const fatos: DemoBloco =
    caso === "saque"
      ? {
          k: "fatos",
          titulo: "I — Dos fatos",
          linhas: [
            { t: "txt", v: "A Autora manteve conta na plataforma e, em" },
            { t: "hide", w: "sm", hint: "Data do pedido de saque" },
            { t: "txt", v: ", solicitou a retirada de saldo próprio. A Ré reteve o valor, sob 'análise', sem devolver no prazo da MP 1.394/2026. Extrato e protocolo seguem tarjados nesta demonstração." },
            { t: "hide", w: "lg", hint: "Valor, protocolo e prints — não vão nesta vitrine" },
          ],
        }
      : caso === "ilegal"
        ? {
            k: "fatos",
            titulo: "I — Dos fatos",
            linhas: [
              { t: "txt", v: "A Autora relata oferta de apostas em canal sem domínio .bet.br (Portaria SPA/MF 2.104/2024, art. 8º). Datas, URLs e valores desta conta não saem nesta vitrine." },
              { t: "hide", w: "lg", hint: "URL, app, datas e depósitos" },
            ],
          }
        : {
            k: "fatos",
            titulo: "I — Dos fatos",
            linhas: [
              { t: "txt", v: "A Autora formalizou autoexclusão (casa e/ou gov.br). Ainda assim a Ré aceitou novo aporte em" },
              { t: "hide", w: "sm", hint: "Data do depósito posterior" },
              { t: "txt", v: ". Prints da exclusão e do depósito posterior só entram no rascunho pago." },
              { t: "hide", w: "lg", hint: "Prints, e-mail da casa, valores" },
            ],
          };

  const marco: DemoBloco =
    caso === "ilegal"
      ? {
          k: "marco",
          titulo: "II — Do marco normativo",
          linhas: [
            { t: "txt", v: "CDC, arts. 2º e 3º. Lei 14.790/2023, art. 27. Decreto 13.033/2026 não é restituição ao apostador — destina bloqueio a fundo público. O desenvolvimento do caso concreto está tarjado." },
            { t: "hide", w: "lg", hint: "Enquadramento operacional desta Ré" },
          ],
        }
      : {
          k: "marco",
          titulo: "II — Do marco normativo",
          linhas: [
            { t: "txt", v: "CDC; Lei 14.790/2023, art. 27; Portarias SPA/MF 1.231/2024, 2.579/2025 e 615/2024. A MP 1.394/2026 não apaga pretensão por fato anterior. O texto completo, com o recorte desta Ré, não é publicado." },
            { t: "hide", w: "lg", hint: "Parágrafos aplicados a esta casa" },
          ],
        };

  const direito: DemoBloco =
    caso === "saque"
      ? {
          k: "dir",
          titulo: "III — Da retenção de saldo",
          linhas: [
            { t: "txt", v: "Saldo próprio não se confunde com risco de jogo. Art. 14 e art. 39, V, do CDC; Portaria SPA/MF 615/2024, art. 3º. O pedido líquido desta Autora está tarjado." },
            { t: "hide", w: "md", hint: "Valor do saldo e juros" },
          ],
        }
      : caso === "ilegal"
        ? {
            k: "dir",
            titulo: "III — Da oferta irregular",
            linhas: [
              { t: "txt", v: "Sem tratar a Ré como operadora autorizada. Execução contra offshore pode ser inócua — a peça paga deixa isso escrito, para não furar no contraditório." },
              { t: "hide", w: "md", hint: "Identificação da Ré e pedidos" },
            ],
          }
        : {
            k: "dir",
            titulo: "III — Do depósito após o bloqueio",
            linhas: [
              { t: "txt", v: "Honrar autoexclusão é dever de jogo responsável (Portaria SPA/MF 1.231/2024). Aceitar depósito depois é defeito do serviço (art. 14 do CDC). A narrativa com datas desta Autora não se publica." },
              { t: "hide", w: "md", hint: "Cronologia e valores posteriores" },
            ],
          };

  const pedidos: DemoBloco = {
    k: "pedidos",
    titulo: "Dos pedidos",
    linhas: [
      { t: "txt", v: "a) restituição / liberação do que a Ré deve, no valor de" },
      { t: "hide", w: "sm", hint: "Valor da causa" },
      { t: "txt", v: "; b) inversão do ônus da prova (art. 6º, VIII, CDC); c) citação da Ré." },
      { t: "txt", v: "Dá-se à causa o valor de" },
      { t: "hide", w: "sm", hint: "Valor da causa" },
      { t: "txt", v: "." },
    ],
  };

  return [endereco, partes, fatos, marco, direito, pedidos];
}
