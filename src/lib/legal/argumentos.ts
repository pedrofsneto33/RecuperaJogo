import { type VariaveisFato, VARIAVEIS_VAZIAS } from "./variaveis";
import { ALERTA_JUROS } from "./corpus";
import { MARCO_MP, MARCO_ILEGAL_POS_MP, MP_SAQUE_ATE } from "./mp1394";

export type Perfil = "autoexclusao" | "ludopatia";

export type ArgCtx = {
  dataFato?: string;
  temLaudo: boolean;
  variaveis: VariaveisFato;
};

export type Argumento = {
  id: string;
  perfis: Perfil[];
  label: string;
  /** Quando o argumento NÃO deve ser usado */
  risco: string;
  quando?: (ctx: ArgCtx) => boolean;
  texto: (ctx: ArgCtx) => string;
};

/**
 * Textos conservadores. Só citam lei/regulamento. Sem jurisprudência nominada
 * (citações inventadas são o maior risco contra o produto).
 *
 * Art. 26, VI da Lei 14.790/2023 exige LAUDO de profissional de saúde mental.
 * Sem laudo, o argumento de nulidade de pleno direito NÃO entra.
 *
 * Art. 42, parágrafo único, CDC trata de cobrança indevida — não de "perda de aposta".
 * Só entra se o usuário marcar cobrança após bloqueio.
 *
 * Juros: NÃO pedir 1% a.m. como regra legal — Lei 14.905/2024 alterou o art. 406 do CC.
 */
export const ARGUMENTOS: Argumento[] = [
  {
    id: "enquadramento",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Deixar claro que não se trata de mero arrependimento por perda",
    risco: "Use sempre. É o enquadramento da causa.",
    texto: () =>
      `Esclarece-se, desde logo, que a presente demanda não se funda em mero arrependimento por resultado desfavorável de apostas regularmente realizadas. O objeto da pretensão é a falha na prestação do serviço e/ou o descumprimento de deveres legais e regulatórios do agente operador, com fundamento no Código de Defesa do Consumidor e, quando aplicável, na Lei nº 14.790/2023, na regulamentação da Secretaria de Prêmios e Apostas (SPA/MF) e na Lei nº 13.709/2018 (LGPD).`,
  },
  {
    id: "mp_encerramento",
    perfis: ["autoexclusao", "ludopatia"],
    label: "MP 1.394/2026 não apaga o CDC — fatos anteriores continuam",
    risco: "Use sempre. Não diga que a MP 'garante' restituição. Saldo na carteira: primeiro o prazo oficial de 5/10.",
    quando: (ctx) => !ctx.variaveis.casaIrregular,
    texto: () => MARCO_MP,
  },
  {
    id: "decreto_ilegal_nao_restituicao",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Decreto 13.033/2026 não devolve ao apostador (ilegal)",
    risco: "Só casa irregular. Não prometa que o bloqueio da União vira dinheiro na conta do autor.",
    quando: (ctx) => ctx.variaveis.casaIrregular,
    texto: () => MARCO_ILEGAL_POS_MP,
  },
  {
    id: "relacao_consumo",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Relação de consumo e hipossuficiência (CDC)",
    risco: "Use sempre. Apostador é consumidor; operador é fornecedor.",
    texto: () =>
      `Aplica-se o Código de Defesa do Consumidor. A parte Autora é consumidora (art. 2º) e a parte Ré é fornecedora de serviços de apostas de quota fixa (art. 3º). A relação é de adesão, com assimetria informacional e técnica. A vulnerabilidade é princípio da Política Nacional das Relações de Consumo (art. 4º, I). Requer-se a inversão do ônus da prova, nos termos do art. 6º, VIII, do CDC, e a interpretação mais favorável ao consumidor (art. 47).`,
  },
  {
    id: "responsabilidade_objetiva",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Responsabilidade objetiva por defeito do serviço (art. 14 CDC)",
    risco: "Use quando houver falha concreta (aceitar depósito após bloqueio, não monitorar, não honrar autoexclusão).",
    texto: () =>
      `O art. 14 do CDC estabelece responsabilidade objetiva do fornecedor por danos decorrentes de defeitos na prestação do serviço, independentemente de culpa. O serviço é defeituoso quando não oferece a segurança que o consumidor dele pode esperar (art. 14, §1º). A falha no cumprimento de mecanismos de jogo responsável — em especial o dever de honrar autoexclusão e de impedir apostas vedadas — configura defeito do serviço.`,
  },
  {
    id: "deposito_pos_bloqueio",
    perfis: ["autoexclusao"],
    label: "Aceitação de depósito/aposta após autoexclusão ou bloqueio",
    risco: "Só use com print/e-mail da autoexclusão E comprovante do depósito posterior, com datas.",
    texto: ({ dataFato }) =>
      `A parte Autora formalizou pedido de autoexclusão e/ou teve a conta bloqueada. Ainda assim, a parte Ré aceitou novo(s) depósito(s) e/ou aposta(s) posteriormente${dataFato ? ` (fato indicado em ${dataFato})` : ""}. A Portaria SPA/MF nº 1.231/2024 impõe ao agente operador autorizado deveres concretos de jogo responsável, inclusive mecanismos de autoexclusão eficazes. Aceitar transação após o bloqueio evidencia falha operacional e defeito do serviço (art. 14 do CDC).`,
  },
  {
    id: "dever_jogo_responsavel",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Dever legal de jogo responsável (Lei 14.790 e Portaria 1.231/2024)",
    risco: "Use quando a casa AUTORIZADA ignorou limites, autoexclusão ou sinais de risco. Casas não autorizadas: desmarque — o dever da SPA não se aplica da mesma forma.",
    quando: (ctx) => !ctx.variaveis.casaIrregular,
    texto: () =>
      `A Lei nº 14.790/2023 e a Portaria SPA/MF nº 1.231/2024 atribuem ao agente operador autorizado o dever de implementar política de jogo responsável: autoexclusão, limites, monitoramento de padrões de risco e vedação de incentivos a apostadores vulneráveis. O descumprimento desses deveres não é mera infração administrativa: repercute na responsabilidade civil perante o consumidor.`,
  },
  {
    id: "casa_irregular",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Oferta por quem não demonstra autorização da SPA",
    risco: "Só se a casa realmente não for autorizada. Não prometa execução fácil contra offshore.",
    quando: (ctx) => ctx.variaveis.casaIrregular,
    texto: () =>
      `A Autora relata que a Ré explorava apostas sem demonstrar autorização da SPA/MF para atuar no Brasil. Nesse recorte, a pretensão NÃO se funda nos deveres específicos do agente operador autorizado (Portaria SPA/MF nº 1.231/2024), que não se transferem automaticamente a quem opera à margem da autorização. Funda-se, isto sim, na relação de consumo efetivamente travada (arts. 2º e 3º do CDC), na boa-fé objetiva (art. 422 do Código Civil) e na ilicitude da oferta, sem prejuízo da competência da Administração e do Ministério Público. A Autora está ciente de que a efetividade da execução contra operador irregular ou sediado no exterior pode ser reduzida e não pede milagre patrimonial.`,
  },
  {
    id: "nulidade_art26",
    perfis: ["ludopatia"],
    label: "Nulidade das apostas — art. 26, VI e §1º (somente com laudo)",
    risco: "PROIBIDO sem laudo de profissional de saúde mental habilitado. Sem laudo, este bloco não deve ser gerado.",
    texto: ({ temLaudo }) =>
      temLaudo
        ? `O art. 26, inciso VI, da Lei nº 14.790/2023 veda a participação, na condição de apostador, de pessoa diagnosticada com ludopatia, por laudo de profissional de saúde mental habilitado. O §1º do mesmo artigo dispõe que são nulas de pleno direito as apostas realizadas em desacordo com o previsto neste artigo. A Autora junta laudo nesse sentido. A nulidade implica o retorno das partes ao estado anterior, com a restituição dos valores apostados no período correspondente, deduzidos eventuais prêmios efetivamente recebidos, sob pena de enriquecimento sem causa (art. 884 do Código Civil).`
        : `[ARGUMENTO NÃO INCLUÍDO: ausente laudo de ludopatia.]`,
  },
  {
    id: "monitoramento_padrao",
    perfis: ["ludopatia"],
    label: "Falha no monitoramento de padrão de risco (sem substituir o laudo)",
    risco: "Complementar. Sozinho, sem laudo e sem autoexclusão, a chance de êxito é menor. Não afirme 'vício óbvio' sem fatos.",
    texto: () =>
      `Ainda quando se discuta o alcance da nulidade do art. 26, a Ré tinha o dever de monitorar indicadores de risco (frequência de depósitos, valores crescentes, tempo de sessão, recusa de limites) e de oferecer ferramentas efetivas de contenção. A omissão, se demonstrada pelos extratos e pela ausência de intervenção, reforça o defeito do serviço (art. 14 do CDC). Este argumento não dispensa prova dos fatos e não substitui o laudo para os efeitos do art. 26, VI.`,
  },
  {
    id: "menor_idade",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Aposta de menor de 18 anos (art. 26, I + ECA)",
    risco: "Só com prova de idade e de que a conta/aposta era da pessoa menor.",
    quando: (ctx) => ctx.variaveis.menorIdade,
    texto: () =>
      `O art. 26, inciso I, da Lei nº 14.790/2023 veda a participação de menor de 18 anos na condição de apostador. O §1º comina nulidade de pleno direito. Soma-se a proteção integral da criança e do adolescente (Lei nº 8.069/1990). Aceitar cadastro ou depósito de menor, ou deixar de adotar as medidas de identificação do art. 26, §2º, é falha grave do serviço (art. 14 do CDC).`,
  },
  {
    id: "recusa_saque",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Recusa ou travamento de saque de saldo próprio",
    risco: "Separe saldo (seu dinheiro na carteira) de perda de aposta. Junte protocolo e print do saldo.",
    quando: (ctx) => ctx.variaveis.recusaSaque,
    texto: () =>
      `A Autora tinha saldo próprio na carteira da plataforma e solicitou saque, que foi recusado, retido ou indefinidamente 'em análise'. Valores depositados e não apostados, ou prêmios já creditados e não pagos, não se confundem com risco de jogo. A retenção caracteriza defeito do serviço (art. 14 do CDC), prática abusiva (art. 39, V) e, conforme o caso, enriquecimento sem causa (art. 884 do Código Civil). Se o saldo ainda estiver na carteira após a MP nº 1.394/2026, a Autora deve também esgotar a retirada voluntária até ${MP_SAQUE_ATE} e a devolução bancária do cronograma oficial. Requer-se a liberação/restituição do que a Ré já retinha, com ${ALERTA_JUROS}`,
  },
  {
    id: "bonus_pos_bloqueio",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Bônus/freebet após autoexclusão",
    risco: "Precisa do print do bônus com data posterior ao bloqueio.",
    quando: (ctx) => ctx.variaveis.bonusApos,
    texto: () =>
      `Após o pedido de autoexclusão ou bloqueio, a Ré enviou bônus, freebet, cashback ou crédito promocional. Incentivar quem pediu para parar é incompatível com jogo responsável e com a boa-fé objetiva (art. 422 do Código Civil). Configura prática abusiva (art. 39, IV, do CDC) e reforça o defeito do serviço.`,
  },
  {
    id: "publicidade_enganosa",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Publicidade enganosa ou abusiva (art. 37 CDC)",
    risco: "Junte o anúncio. Sem peça publicitária, desmarque.",
    quando: (ctx) => ctx.variaveis.publicidadeEnganosa,
    texto: () =>
      `A Autora foi exposta a comunicação que omitia o risco essencial da aposta ou sugeria ganho fácil, dinheiro rápido ou 'estratégia infalível'. O art. 37 do CDC veda publicidade enganosa e abusiva. A informação adequada e clara é direito básico (art. 6º, III). A peça publicitária junta-se aos autos; sem ela, este tópico não substitui prova.`,
  },
  {
    id: "lgpd_marketing",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Tratamento de dados e marketing após exclusão (LGPD)",
    risco: "Print da mensagem/anúncio com data. Não chute que 'venderam seu dado' sem indício.",
    quando: (ctx) => ctx.variaveis.marketingApos || ctx.variaveis.lgpdPerfil,
    texto: ({ variaveis }) =>
      `A Ré tratou dados pessoais da Autora (cadastro, histórico de depósitos, identificadores de dispositivo e, eventualmente, perfil de risco) para continuar a estimular apostas${variaveis.marketingApos ? " inclusive após o pedido de autoexclusão/oposição" : ""}. A Lei nº 13.709/2018 (LGPD) assegura oposição, eliminação e informação (art. 18) e responsabiliza por dano decorrente de tratamento irregular (art. 42). ${variaveis.lgpdPerfil ? "O perfilamento para empurrar novo depósito, quando desacompanhado de base legal adequada (art. 7º), agrava a ilicitude." : ""} Esse tratamento irregular soma-se ao CDC (arts. 6º e 14) e não depende de 'prova de venda a terceiros' — basta o uso do dado contra a expectativa legítima de quem pediu para parar.`,
  },
  {
    id: "lgpd_dado_saude",
    perfis: ["ludopatia"],
    label: "Dado de saúde (diagnóstico) é dado sensível — art. 11 LGPD",
    risco: "Só com laudo. O laudo vai ao juízo, não para o site.",
    quando: (ctx) => ctx.temLaudo,
    texto: () =>
      `O diagnóstico de ludopatia é dado pessoal sensível (dado de saúde), nos termos do art. 11 da LGPD. A Ré, ciente ou em posição de dever de se cientificar do impedimento legal (art. 26, VI, da Lei nº 14.790/2023), não pode tratar esse contexto como mais um perfil de marketing. O uso de dado de saúde para manter a pessoa no jogo, sem base legal específica, é tratamento irregular (arts. 11 e 42 da LGPD) e defeito do serviço (art. 14 do CDC).`,
  },
  {
    id: "estatuto_idoso",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Vulnerabilidade agravada — Estatuto do Idoso",
    risco: "Só se tinha 60 anos ou mais nos fatos.",
    quando: (ctx) => ctx.variaveis.idoso,
    texto: () =>
      `A Autora era pessoa idosa à época dos fatos (Lei nº 10.741/2003). O CDC já reconhece a vulnerabilidade (art. 4º, I) e veda prevalecer-se da fraqueza ou idade (art. 39, IV). O Estatuto do Idoso reforça o dever de proteção e torna ainda menos aceitável o descumprimento de autoexclusão, o estímulo agressivo a depósito e a omissão de informação clara sobre risco.`,
  },
  {
    id: "boa_fe_cc",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Boa-fé objetiva e abuso de direito (Código Civil)",
    risco: "Complementar. Não substitui fato + CDC.",
    texto: () =>
      `Os arts. 421 e 422 do Código Civil impõem função social do contrato e boa-fé objetiva. Honrar o mecanismo de proteção que a própria Ré oferece (autoexclusão, limites, 'jogo responsável') é conteúdo mínimo da lealdade. O art. 187 veda o abuso de direito. Manter a pessoa no ciclo de depósito depois do pedido de parar, ou recusar saque de saldo próprio, desborda o exercício regular de um serviço de apostas.`,
  },
  {
    id: "cobranca_indevida_art42",
    perfis: ["autoexclusao"],
    label: "Restituição em dobro — art. 42 CDC (só se houve cobrança após bloqueio)",
    risco: "NÃO use para 'perdi a aposta'. O art. 42, parágrafo único, CDC refere-se a cobrança de dívida indevida. Sem débito cobrado após o bloqueio, o pedido em dobro costuma ser rejeitado.",
    texto: () =>
      `Na hipótese de ter a Ré efetuado cobrança, débito em cartão ou retenção de valores após o bloqueio/autoexclusão — isto é, cobrança de quantia que não era devida —, requer-se a repetição do indébito em dobro, nos termos do art. 42, parágrafo único, do CDC, salvo engano justificável. Este pedido não se confunde com a mera restituição de apostas perdidas em ambiente regular.`,
  },
  {
    id: "dano_moral_cauteloso",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Dano moral (pedido subsidiário e moderado)",
    risco: "JEC costuma ser restritivo. Não prometa valor. Peça arbitramento judicial.",
    texto: () =>
      `Além do dano material, a Autora experimentou abalo decorrente da frustração da expectativa legítima de que o mecanismo de proteção (autoexclusão/bloqueio) seria honrado, e/ou da exposição continuada a serviço que a lei veda a pessoa diagnosticada. Requer-se indenização por danos morais em valor a ser arbitrado por este Juízo, com razoabilidade e proporcionalidade, sem caráter especulativo.`,
  },
  {
    id: "inversao_onus",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Inversão do ônus da prova e dever de exibir logs",
    risco: "Use sempre. Peça que a casa traga os logs.",
    texto: () =>
      `Requer-se que a Ré apresente os registros de cadastro, autoexclusão, depósitos, apostas, comunicações, tratamento de dados e logs de acesso da conta da Autora. Tais documentos estão sob seu exclusivo controle. A recusa ou omissão deve ser valorada em desfavor da fornecedora, nos termos do art. 6º, VIII, do CDC, do art. 51, XV, e do dever de cooperação processual. Também se requer, com base no art. 18 da LGPD, a exibição do que foi tratado e com que base legal.`,
  },
  {
    id: "lei_14790_art27",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Art. 27 da Lei 14.790/2023 — apostador tem CDC de pleno direito",
    risco: "Use sempre. É o elo entre a lei das bets e o CDC.",
    texto: () =>
      `O art. 27 da Lei nº 14.790/2023 assegura expressamente aos apostadores os direitos previstos no Código de Defesa do Consumidor. A incidência do CDC não é construção doutrinária: é comando legal setorial. A Ré, portanto, responde como fornecedora (art. 3º do CDC) perante consumidor (art. 2º), com inversão do ônus da prova (art. 6º, VIII) e responsabilidade objetiva por defeito do serviço (art. 14).`,
  },
  {
    id: "spa_1231_art3",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Deveres gerais da Portaria SPA/MF 1.231/2024, art. 3º",
    risco: "Só contra operador autorizado. Casa irregular: desmarque.",
    quando: (ctx) => !ctx.variaveis.casaIrregular,
    texto: () =>
      `A Secretaria de Prêmios e Apostas do Ministério da Fazenda, regulador do setor, editou a Portaria SPA/MF nº 1.231/2024. O art. 3º obriga o agente operador a atuar com diligência na estruturação do sistema, da publicidade e dos canais, a fim de respeitar o jogo responsável, prevenir a dependência e o jogo patológico, e garantir a proibição de apostas por crianças e adolescentes; a promover conscientização; a manter comunicação sistemática sobre riscos; e a ter política de jogo responsável fidedigna ao funcionamento real do sistema. Política de papel que o sistema desmente é descumprimento do art. 3º, IV.`,
  },
  {
    id: "spa_1231_art4",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Deveres no sistema — Portaria 1.231/2024, art. 4º, I (aviso a cada acesso)",
    risco: "Operador autorizado. Prova: print da tela de entrada, ou a ausência do aviso.",
    quando: (ctx) => !ctx.variaveis.casaIrregular,
    texto: () =>
      `O art. 4º, inciso I, da Portaria SPA/MF nº 1.231/2024 determina que o operador informe ao apostador, no momento do cadastro e a cada acesso ao sistema, os riscos de dependência, de transtornos do jogo patológico e de perda dos valores das apostas. O mesmo art. 4º concentra os deveres operacionais de jogo responsável no sistema (limites, autoexclusão, contenção). A omissão do aviso ou a manutenção do fluxo de depósito após pedido de parar evidencia descumprimento regulatório com repercussão civil (art. 14 do CDC e art. 27 da Lei 14.790/2023).`,
  },
  {
    id: "spa_2579",
    perfis: ["autoexclusao"],
    label: "Autoexclusão específica e centralizada — Portaria SPA/MF 2.579/2025",
    risco: "Use se houve pedido de bloqueio na casa e/ou no gov.br.",
    quando: (ctx) => !ctx.variaveis.casaIrregular,
    texto: () =>
      `A Portaria SPA/MF nº 2.579/2025 alterou a Portaria 1.231/2024 para distinguir autoexclusão específica (inciso XXII do art. 2º — na casa) e autoexclusão centralizada (inciso XXIII — plataforma da SPA/MF, gov.br). O parágrafo único do art. 2º admite prazo determinado ou indeterminado. O operador deve disponibilizar, com destaque, o link da autoexclusão centralizada. Aceitar depósito após qualquer das duas modalidades é falha do mecanismo que a própria regulação tornou obrigatório.`,
  },
  {
    id: "spa_615_saque",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Saque só pode ir para a conta cadastrada — Portaria SPA/MF 615/2024, art. 3º",
    risco: "Marque recusa de saque. Junte protocolo.",
    quando: (ctx) => ctx.variaveis.recusaSaque && !ctx.variaveis.casaIrregular,
    texto: () =>
      `A Portaria SPA/MF nº 615/2024, art. 3º, exige que aportes, retiradas e pagamento de prêmios ocorram exclusivamente por transferência eletrônica entre a conta cadastrada do apostador e a conta transacional do operador, ambas em instituição autorizada pelo Banco Central. Travar, recusar ou “analisar indefinidamente” saque de saldo próprio contraria esse dever operacional e o art. 14 do CDC.`,
  },
  {
    id: "cc_166_vii",
    perfis: ["ludopatia"],
    label: "Nulidade civil — art. 166, VII, do Código Civil (além do art. 26 da Lei 14.790)",
    risco: "Só com laudo. Complementa a nulidade de pleno direito da lei setorial.",
    quando: (ctx) => ctx.temLaudo,
    texto: () =>
      `Além do art. 26, VI e §1º, da Lei nº 14.790/2023, o art. 166, VII, do Código Civil considera nulo o negócio jurídico quando o objeto for ilícito, impossível ou indeterminável. Aposta realizada por pessoa legalmente impedida (diagnóstico de ludopatia por laudo) tem objeto contrário à lei. A nulidade opera o retorno ao estado anterior, com restituição dos valores apostados no período, abatidos prêmios efetivamente resgatados, sob pena de enriquecimento sem causa (art. 884 do CC).`,
  },
  {
    id: "tigrinho_online",
    perfis: ["autoexclusao", "ludopatia"],
    label: "Jogos on-line / Tigrinho — sessão rápida, aviso de perda e RTP",
    risco: "Precisa de print do jogo. Não copie marca se não estiver no print. Não chame de ‘crime’ na peça cível.",
    quando: (ctx) => ctx.variaveis.tigrinho,
    texto: () =>
      `Os fatos ocorreram em jogos on-line de sessão rápida (caça-níquel / cassino no aplicativo), ambiente de alta frequência de aposta e reforço imediato. A Portaria SPA/MF nº 1.231/2024 define plataforma e jogos on-line no art. 2º e exige informação sobre risco de perda (art. 4º, I) e sobre o retorno teórico ao jogador — RTP (art. 2º, XX, redação da Portaria 2.579/2025), que não se confunde com expectativa individual de ganho. Design que empurra novo giro sem o aviso legal, ou após pedido de autoexclusão, é defeito do serviço (art. 14 do CDC), não “azar do jogador”.`,
  },
];

export function filtrarPorPerfil(
  perfil: Perfil,
  temLaudo: boolean,
  variaveis: VariaveisFato = VARIAVEIS_VAZIAS,
): Argumento[] {
  const ctx: ArgCtx = { temLaudo, variaveis };
  return ARGUMENTOS.filter((a) => {
    if (!a.perfis.includes(perfil)) return false;
    if (a.id === "nulidade_art26" && !temLaudo) return false;
    if (a.quando && !a.quando(ctx)) return false;
    return true;
  });
}
