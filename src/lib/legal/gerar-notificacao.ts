import { fmtBRL } from "./constantes";
import { ALERTA_JUROS } from "./corpus";
import type { DadosPeticao } from "./gerar-peticao";

/** Notificação extrajudicial — CDC. Não é petição. Não cita acórdão. */
export function montarNotificacao(d: DadosPeticao): string {
  const autor = d.autor.nome || "[NOME]";
  const cpf = d.autor.cpf || "[CPF]";
  const end = d.autor.endereco || "[ENDEREÇO]";
  const reu = d.reu.nome || "[RAZÃO SOCIAL]";
  const cnpj = d.reu.cnpj || "[CNPJ]";
  const valor = d.valorBase > 0 ? fmtBRL(d.valorBase) : "[valor conforme extrato]";
  const data = new Date().toLocaleDateString("pt-BR");

  const fato = d.relato.trim() || "[Descreva, com datas, o que a Notificada fez e o que você pede. Só o que prova.]";

  let pedido = `restituição / liberação de ${valor}, com ${ALERTA_JUROS}`;
  if (d.variaveis.recusaSaque) {
    pedido = `liberação do saldo próprio retido, no valor de ${valor}, na conta cadastrada, com ${ALERTA_JUROS}`;
  }

  return `NOTIFICAÇÃO EXTRAJUDICIAL

De: ${autor}, CPF ${cpf}, ${end}

Para: ${reu}, CNPJ ${cnpj}

Data: ${data}

Senhores,

Na qualidade de consumidor (arts. 2º e 3º da Lei nº 8.078/1990 — CDC), NOTIFICO a empresa acima para, no prazo de 10 (dez) dias úteis, contados do recebimento desta:

1) ${pedido};
2) apresentar extrato completo da conta, logs de autoexclusão (se houver) e comprovantes de depósito/saque;
3) cessar ofertas de aposta a este notificante, se houve pedido de bloqueio (CDC e, no que couber, LGPD, arts. 7º e 18).

FATOS (somente o que o notificante prova)

${fato}

FUNDAMENTO (sem jurisprudência nomeada)

A relação é de consumo. O art. 14 do CDC trata de defeito do serviço. O art. 6º, III e VIII, assegura informação e inversão do ônus quando a alegação for verossímil e o consumidor for hipossuficiente. O art. 27 da Lei nº 14.790/2023 confirma o CDC no mercado de apostas. A MP 1.394/2026 não apaga pretensão por fato anterior. Cobrança indevida, se houver, observa o art. 42, parágrafo único, do CDC — e só se o notificante tiver prova de débito após bloqueio, não de mera perda de aposta.

Esta via NÃO é processo. É oportunidade de resolver sem Juizado. O silêncio autoriza o notificante a protocolar rascunho de petição no Juizado Especial Cível, por direito próprio (art. 9º da Lei nº 9.099/95), se o valor couber.

Envio por e-mail com confirmação de leitura e/ou pelos canais oficiais da Notificada. Guarde o comprovante de envio.

Nestes termos,

${autor}
CPF ${cpf}
`;
}
