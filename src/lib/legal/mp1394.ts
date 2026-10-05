/**
 * Medida Provisória publicada em 25/09/2026 (MP nº 1.394/2026, conforme notícia
 * oficial da Agência Brasil / DOU). Sem citar inciso que não conferimos no PDF.
 *
 * O produto NÃO afirma que a MP “acaba com o direito do consumidor” nem que o
 * Decreto 13.033/2026 devolve dinheiro de ilegal ao apostador (vai a fundo público).
 */

export const MP_NUMERO = "1.394/2026";
export const MP_PUBLICACAO = "25 de setembro de 2026";
export const MP_SAQUE_ATE = "5 de outubro de 2026, 23h59";
export const MP_SITES_FORA = "6 de outubro de 2026";
export const MP_DEVOLUCAO = "9 a 14 de outubro de 2026";

export const FONTE_MP =
  "https://agenciabrasil.ebc.com.br/economia/noticia/2026-09/entenda-medida-provisoria-e-projeto-que-proibem-bets-no-brasil";

export const DECRETO_ILEGAIS = "Decreto nº 13.033/2026";

export const MARCO_MP = `
Em 25 de setembro de 2026 foi publicada medida provisória (MP nº ${MP_NUMERO}) que determina o encerramento da exploração, oferta, intermediação e publicidade de apostas de quota fixa e jogos on-line no País, com transição: proibição de novos aportes na publicação; retirada voluntária de saldos até ${MP_SAQUE_ATE}; plataformas fora do ar a partir de ${MP_SITES_FORA}; informação de saldos aos bancos em 7 e 8 de outubro; devolução bancária entre ${MP_DEVOLUCAO}. A MP depende de apreciação do Congresso no prazo constitucional.

Esse regime de encerramento NÃO extingue, por si, pretensões consumeristas por fatos anteriores (autoexclusão ignorada, saque recusado antes do prazo, cadastro de menor, omissão de aviso de risco). O art. 27 da Lei nº 14.790/2023 e o CDC continuam a ser o fundamento da relação de consumo já travada.

Saldo ainda na carteira de operador que foi autorizado: a Autora deve esgotar o canal oficial de retirada/devolução do cronograma da MP. Esta ação trata do que a Ré já devia — não substitui o saque voluntário de 5 de outubro.
`.trim();

export const MARCO_ILEGAL_POS_MP = `
Operação sem autorização da SPA/MF não se beneficia do cronograma de devolução das plataformas que foram autorizadas. O ${DECRETO_ILEGAIS} trata de bloqueio administrativo de recursos de bets clandestinas, com destinação, após o processo, ao Fundo Nacional de Segurança Pública — não é mecanismo de restituição ao apostador. A pretensão civil contra irregular/offshore é de consumo e de ilicitude da oferta, com risco concreto de execução inócua. Não se afirma que o decreto “devolva” o prejuízo.
`.trim();
