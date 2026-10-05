import { ARGUMENTOS, type Perfil } from "./argumentos";
import { fmtBRL, LIMITE_JUS_POSTULANDI, LIMITE_COMPETENCIA_JEC, faixaValorCausa } from "./constantes";
import { ALERTA_JUROS } from "./corpus";
import { MARCO_SPA } from "./spa";
import { MARCO_MP, MARCO_ILEGAL_POS_MP } from "./mp1394";
import { type VariaveisFato, VARIAVEIS_VAZIAS } from "./variaveis";

export type DadosPeticao = {
  perfil: Perfil;
  temLaudo: boolean;
  autor: { nome: string; cpf: string; endereco: string; comarca: string; uf: string };
  reu: { nome: string; cnpj: string };
  relato: string;
  dataFato?: string;
  argumentosIds: string[];
  dobro: boolean;
  danoMoral: boolean;
  valorBase: number;
  jurosMeses: number;
  variaveis: VariaveisFato;
};

function roman(n: number) {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let r = "";
  for (const [v, s] of map) {
    while (n >= v) {
      r += s;
      n -= v;
    }
  }
  return r;
}

export function montarPeticao(d: DadosPeticao): string {
  const v = d.variaveis ?? VARIAVEIS_VAZIAS;
  const autorNome = d.autor.nome || "[NOME COMPLETO]";
  const cpf = d.autor.cpf || "[CPF]";
  const end = d.autor.endereco || "[ENDEREÇO]";
  const comarca = d.autor.comarca || "[COMARCA]";
  const uf = d.autor.uf || "[UF]";
  const reuNome = d.reu.nome || "[RAZÃO SOCIAL DA OPERADORA]";
  const cnpj = d.reu.cnpj || "[CNPJ]";

  const valorBase = d.valorBase > 0 ? d.valorBase : 0;
  const valorCausa = valorBase;

  const args = ARGUMENTOS.filter((a) => d.argumentosIds.includes(a.id)).filter((a) => {
    if (a.id === "nulidade_art26" && !d.temLaudo) return false;
    if (a.id === "cobranca_indevida_art42" && !d.dobro) return false;
    if (a.id === "dano_moral_cauteloso" && !d.danoMoral) return false;
    if (a.quando && !a.quando({ temLaudo: d.temLaudo, variaveis: v, dataFato: d.dataFato })) return false;
    return true;
  });

  let n = 3;
  const blocos = args
    .map((a) => {
      const titulo = `${roman(n++)} — ${a.label.toUpperCase()}`;
      const texto = a.texto({ dataFato: d.dataFato, temLaudo: d.temLaudo, variaveis: v });
      return `${titulo}\n\n${texto}`;
    })
    .join("\n\n");

  const pedidos: string[] = [];
  if (v.recusaSaque) {
    pedidos.push(
      `a condenação da Ré a liberar e/ou restituir o saldo próprio retido, no valor de ${valorBase > 0 ? fmtBRL(valorBase) : "[preencher conforme extrato de carteira]"}, com ${ALERTA_JUROS}`,
    );
  } else if (valorBase > 0) {
    pedidos.push(
      `a condenação da Ré a restituir o valor de ${fmtBRL(valorBase)}, com ${ALERTA_JUROS}, bem como a compensação com eventuais prêmios efetivamente creditados`,
    );
  } else {
    pedidos.push(
      `a condenação da Ré a restituir os valores pertinentes, a serem liquidados com base nos extratos que a Ré deverá apresentar, com ${ALERTA_JUROS}`,
    );
  }
  if (d.temLaudo && d.argumentosIds.includes("nulidade_art26")) {
    pedidos.push(
      `o reconhecimento da nulidade de pleno direito das apostas realizadas em desacordo com o art. 26, VI e §1º, da Lei nº 14.790/2023, no período correspondente ao diagnóstico`,
    );
  }
  if (v.menorIdade) {
    pedidos.push(
      `o reconhecimento da nulidade das apostas realizadas em desacordo com o art. 26, I e §1º, da Lei nº 14.790/2023, por ser a Autora menor de 18 anos à época`,
    );
  }
  if (d.dobro) {
    pedidos.push(
      `na hipótese de cobrança indevida após bloqueio/autoexclusão, a repetição do indébito em dobro (art. 42, parágrafo único, CDC), se não houver engano justificável`,
    );
  }
  if (d.danoMoral) {
    pedidos.push(
      `a condenação ao pagamento de indenização por danos morais, em valor a ser arbitrado por este Juízo`,
    );
  }
  if (v.marketingApos || v.lgpdPerfil) {
    pedidos.push(
      `a cessação do tratamento de dados para marketing de apostas e a confirmação, nos termos do art. 18 da LGPD, do que foi tratado e com qual base legal`,
    );
  }
  pedidos.push(`a inversão do ônus da prova (art. 6º, VIII, CDC) e a exibição dos logs, extratos e registros de tratamento de dados da conta pela Ré`);
  pedidos.push(`a citação da Ré para, querendo, contestar, sob pena de revelia`);

  const pedidosFmt = pedidos.map((p, i) => `${String.fromCharCode(97 + i)}) ${p};`).join("\n");

  const faixa = faixaValorCausa(valorCausa);
  let avisoValor = "";
  if (faixa === "advogado_jec") {
    avisoValor = `\n\nATENÇÃO AO AUTOR (não protocolar este trecho): o valor estimado (${fmtBRL(valorCausa)}) ultrapassa 20 salários mínimos (${fmtBRL(LIMITE_JUS_POSTULANDI)}), teto do art. 9º da Lei 9.099/95 para atuar SEM advogado. Ainda cabe Juizado até 40 SM (${fmtBRL(LIMITE_COMPETENCIA_JEC)}), mas com advogado ou Defensoria. Não force jus postulandi acima de 20 SM.`;
  } else if (faixa === "justica_comum") {
    avisoValor = `\n\nATENÇÃO AO AUTOR (não protocolar este trecho): o valor estimado (${fmtBRL(valorCausa)}) ultrapassa 40 salários mínimos (${fmtBRL(LIMITE_COMPETENCIA_JEC)}), teto do art. 3º, I, da Lei 9.099/95. Foro provavelmente é a Justiça Comum, com advogado. Este rascunho de JEC não deve ser protocolado como está.`;
  }

  const marco = v.casaIrregular
    ? `${MARCO_ILEGAL_POS_MP}

A Autora relata que a Ré explorava apostas sem demonstrar autorização da Secretaria de Prêmios e Apostas do Ministério da Fazenda (SPA/MF). Por isso, esta peça NÃO trata a Ré como agente operador autorizado para fins da Portaria SPA/MF nº 1.231/2024. A relação, contudo, é de consumo: o art. 27 da Lei nº 14.790/2023 assegura o CDC ao apostador, e os arts. 2º e 3º do CDC se aplicam a quem oferece o serviço no Brasil. O Código Civil (arts. 166, 422 e 884) complementa. Canal sem domínio “.bet.br” (Portaria SPA/MF nº 2.104/2024, art. 8º) é indício de operação irregular. A Autora está ciente de que a execução contra offshore pode ser reduzida e não afirma hipótese que não corresponda à prova.`
    : `${MARCO_SPA}

${MARCO_MP}`;

  return `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE ${comarca.toUpperCase()} – ${uf}

${autorNome}, brasileiro(a), portador(a) do CPF nº ${cpf}, residente e domiciliado(a) em ${end}, vem, por direito próprio (art. 9º da Lei nº 9.099/95 — jus postulandi), com fundamento no Código de Defesa do Consumidor, na Lei nº 13.709/2018 (LGPD) e, no que couber, na Lei nº 14.790/2023 e no Código Civil, propor a presente

AÇÃO DE RESTITUIÇÃO DE VALORES C/C OBRIGAÇÃO DE FAZER${d.danoMoral ? " E INDENIZAÇÃO POR DANOS MORAIS" : ""}

em face de ${reuNome}, inscrita no CNPJ nº ${cnpj}, pelos fatos e fundamentos a seguir.

I — DOS FATOS

${d.relato.trim() || "[Descreva, em ordem cronológica, com datas: cadastro, autoexclusão ou diagnóstico, depósitos posteriores, protocolos de suporte. Não invente fatos.]"}

II — DO MARCO NORMATIVO

${marco}

${blocos}

${roman(n)} — DOS PEDIDOS

Diante do exposto, requer-se:

${pedidosFmt}

Dá-se à causa o valor de ${valorCausa > 0 ? fmtBRL(valorCausa) : "[preencher conforme extratos]"}.

Nestes termos, pede deferimento.

${comarca}, ${new Date().toLocaleDateString("pt-BR")}.


________________________________
${autorNome}
CPF ${cpf}

---
DOCUMENTO-RASCUNHO GERADO POR SOFTWARE DE AUTOMAÇÃO. NÃO CONSTITUI PEÇA ADVOCATÍCIA ASSINADA POR ADVOGADO. NÃO ESTABELECE RELAÇÃO ADVOGADO-CLIENTE. REVISE CADA FATO E CADA CITAÇÃO LEGAL ANTES DE PROTOCOLAR. CONFIRME A VIGÊNCIA DAS NORMAS. ANEXE SOMENTE PROVAS QUE VOCÊ POSSUI. NÃO HÁ JURISPRUDÊNCIA NOMEADA NESTA PEÇA — ISSO É DE PROPÓSITO.${avisoValor}
`;
}
