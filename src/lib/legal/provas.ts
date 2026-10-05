import type { Perfil } from "./argumentos";
import type { VariaveisFato } from "./variaveis";

export type ProvaId =
  | "doc_identidade"
  | "print_autoexclusao"
  | "print_deposito_apos"
  | "extrato_carteira"
  | "pedido_saque"
  | "laudo"
  | "print_site_irregular"
  | "print_marketing"
  | "protocolo_suporte"
  | "comprovante_pix";

export type ProvaItem = {
  id: ProvaId;
  label: string;
  detalhe: string;
  obrigatoria: boolean;
};

export type ProvasMarcadas = Record<ProvaId, boolean>;

export const PROVAS_VAZIAS: ProvasMarcadas = {
  doc_identidade: false,
  print_autoexclusao: false,
  print_deposito_apos: false,
  extrato_carteira: false,
  pedido_saque: false,
  laudo: false,
  print_site_irregular: false,
  print_marketing: false,
  protocolo_suporte: false,
  comprovante_pix: false,
};

export function provasDoCaso(
  perfil: Perfil,
  temLaudo: boolean,
  v: VariaveisFato,
): ProvaItem[] {
  const items: ProvaItem[] = [
    {
      id: "doc_identidade",
      label: "Documento com foto + CPF",
      detalhe: "O Juizado precisa saber quem é o autor.",
      obrigatoria: true,
    },
    {
      id: "comprovante_pix",
      label: "Comprovante de depósito / PIX para a casa",
      detalhe: "Sem isso o valor da causa é chute.",
      obrigatoria: true,
    },
  ];

  if (perfil === "autoexclusao") {
    items.push(
      {
        id: "print_autoexclusao",
        label: "Print da autoexclusão (casa ou gov.br) com data",
        detalhe: "Sem data, o ‘depois ainda aceitaram’ não segura.",
        obrigatoria: true,
      },
      {
        id: "print_deposito_apos",
        label: "Print do depósito / aposta DEPOIS do bloqueio",
        detalhe: "É o fato do art. 14. Sem isso, não peça o que não prova.",
        obrigatoria: true,
      },
    );
  }

  if (perfil === "ludopatia" || temLaudo) {
    items.push({
      id: "laudo",
      label: "Laudo de profissional de saúde mental (CID de jogo patológico)",
      detalhe: "Art. 26, VI só entra com laudo. Sem laudo o software trava o pedido.",
      obrigatoria: true,
    });
  }

  if (v.recusaSaque) {
    items.push(
      {
        id: "extrato_carteira",
        label: "Extrato da carteira com o saldo retido",
        detalhe: "Saldo próprio ≠ perda de aposta.",
        obrigatoria: true,
      },
      {
        id: "pedido_saque",
        label: "Pedido de saque + recusa / silêncio da casa",
        detalhe: "Protocolo, e-mail ou print do app.",
        obrigatoria: true,
      },
    );
  }

  if (v.casaIrregular) {
    items.push({
      id: "print_site_irregular",
      label: "Print da URL / app (sem .bet.br, se for o caso)",
      detalhe: "Não chame de autorizada o que o print não mostra.",
      obrigatoria: true,
    });
  }

  if (v.marketingApos) {
    items.push({
      id: "print_marketing",
      label: "Push, e-mail ou WhatsApp DEPOIS da exclusão",
      detalhe: "Sem data posterior, não cite LGPD de marketing.",
      obrigatoria: true,
    });
  }

  items.push({
    id: "protocolo_suporte",
    label: "Protocolo de suporte (se houver)",
    detalhe: "Ajuda. Não trava a peça se a casa se calou.",
    obrigatoria: false,
  });

  return items;
}

export function statusProvas(itens: ProvaItem[], marcadas: ProvasMarcadas) {
  const obrigatorias = itens.filter((i) => i.obrigatoria);
  const faltando = obrigatorias.filter((i) => !marcadas[i.id]);
  const feitas = obrigatorias.filter((i) => marcadas[i.id]).length;
  return {
    total: obrigatorias.length,
    feitas,
    faltando,
    ok: faltando.length === 0 && obrigatorias.length > 0,
  };
}
