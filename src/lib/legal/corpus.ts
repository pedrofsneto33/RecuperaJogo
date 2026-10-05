/**
 * Único conjunto de normas que o produto (e a IA) pode citar.
 * Sem jurisprudência nominada. Sem artigo inventado.
 */
export const CORPO_NORMATIVO = `
NORMAS AUTORIZADAS (cite só estas; se não couber, não cite):

1) Constituição, art. 5º, XXXII — Estado promoverá a defesa do consumidor.

2) CDC (Lei 8.078/1990)
- art. 2º consumidor; art. 3º fornecedor
- art. 4º, I — vulnerabilidade; art. 6º, I, III, IV, VI, VIII (segurança, informação, publicidade, prevenção de danos, inversão do ônus da prova)
- art. 14 e §1º — responsabilidade objetiva por defeito do serviço
- art. 37 — publicidade enganosa ou abusiva
- art. 39, IV e V — práticas abusivas (prevalecer-se da fraqueza/idade; vantagem excessiva)
- art. 42, parágrafo único — repetição de indébito em dobro SÓ para cobrança de dívida indevida, NÃO para perda de aposta
- art. 47 — interpretação mais favorável ao consumidor
- art. 51, I, IV e XV — cláusulas abusivas / boa-fé / inversão do ônus

3) Lei 14.790/2023 (apostas de quota fixa)
- art. 26, I — vedada a participação de menor de 18 anos
- art. 26, VI — vedada a participação de pessoa diagnosticada com ludopatia POR LAUDO de profissional de saúde mental habilitado
- art. 26, §1º — nulas de pleno direito as apostas em desacordo com o artigo
- art. 26, §2º — operador deve adotar medidas de identificação e controle
NÃO use o inciso VI sem laudo. NÃO invente outros incisos.

4) Lei 14.790/2023 — art. 27
- assegura aos apostadores os direitos do CDC. Use sempre.

5) Secretaria de Prêmios e Apostas / Ministério da Fazenda
- Portaria SPA/MF 1.231/2024: art. 2º (jogo responsável; autoexclusão específica XXII e centralizada XXIII, redação da 2.579/2025); art. 3º (diligência, política fidedigna); art. 4º, I (aviso de risco no cadastro e a cada acesso). Só para operador AUTORIZADO.
- Portaria SPA/MF 2.579/2025 — autoexclusão específica vs centralizada (gov.br).
- Portaria SPA/MF 615/2024, art. 3º — aportes/saques só entre conta cadastrada do apostador e conta transacional do operador.
- Portaria SPA/MF 2.104/2024, art. 8º — domínio .bet.br.
- Se a casa NÃO for autorizada, NÃO atribua dever de operador. Diga isso.

6) LGPD (Lei 13.709/2018)
- art. 5º — dado pessoal, tratamento, titular
- art. 7º — bases legais do tratamento
- art. 11 — dado pessoal sensível (dado de saúde, inclusive diagnóstico)
- art. 18 — direitos do titular (acesso, eliminação, oposição)
- art. 42 — responsabilidade civil por dano decorrente de tratamento irregular
Uso típico: marketing/perfilamento após autoexclusão; uso de dado de saúde sem base legal.

7) Código Civil
- art. 166, VII — nulidade quando o objeto é ilícito (complementa art. 26 da Lei 14.790; só com laudo)
- art. 186 e 927 — ato ilícito e dever de indenizar
- art. 187 — abuso de direito
- art. 421 e 422 — função social e boa-fé objetiva
- art. 884 — enriquecimento sem causa
- art. 406 (redação da Lei 14.905/2024) — juros de mora na forma da lei civil vigente (NÃO escrever "1% ao mês" como pedido legal)

8) Lei 9.099/1995
- art. 3º, I — competência do JEC até 40 salários mínimos
- art. 9º — jus postulandi (sem advogado) até 20 salários mínimos
São tetos DIFERENTES. Confundi-los é erro.

9) Estatuto do Idoso (Lei 10.741/2003) — só se a parte tinha 60+ nos fatos.
10) ECA (Lei 8.069/1990) — só se havia menor de 18 anos apostando.

Tigrinho / caça-níquel: jogo on-line da plataforma. Citar aviso de perda (art. 4º, I, Portaria 1.231) e RTP (art. 2º, XX). NÃO chamar de crime na peça cível. NÃO inventar acórdão.

PROIBIDO:
- citar acórdão, súmula, "TJSP já decidiu", "STJ pacificou", processo número, nome de relator
- garantir êxito, acordo ou restituição
- usar art. 42 CDC para "perdi a aposta"
- usar art. 26, VI sem laudo
- inventar artigo, parágrafo, portaria ou valor de jurisprudência
`.trim();

export const ALERTA_JUROS =
  "juros de mora e correção monetária na forma da lei civil vigente (art. 406 do Código Civil, com a redação da Lei nº 14.905/2024)";
