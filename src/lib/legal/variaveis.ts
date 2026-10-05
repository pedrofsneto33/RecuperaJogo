export type VariaveisFato = {
  idoso: boolean;
  casaIrregular: boolean;
  recusaSaque: boolean;
  marketingApos: boolean;
  lgpdPerfil: boolean;
  menorIdade: boolean;
  publicidadeEnganosa: boolean;
  bonusApos: boolean;
  tigrinho: boolean;
};

export const VARIAVEIS_VAZIAS: VariaveisFato = {
  idoso: false,
  casaIrregular: false,
  recusaSaque: false,
  marketingApos: false,
  lgpdPerfil: false,
  menorIdade: false,
  publicidadeEnganosa: false,
  bonusApos: false,
  tigrinho: false,
};

export const VARIAVEIS_UI: {
  id: keyof VariaveisFato;
  label: string;
  risco: string;
}[] = [
  {
    id: "tigrinho",
    label: "O prejuízo foi no Tigrinho / Fortune Tiger / caça-níquel / cassino do app",
    risco: "Jogo on-line na plataforma. Não cite marca se você não tiver print. Separe cassino de aposta esportiva.",
  },
  {
    id: "casaIrregular",
    label: "A casa não é (ou eu não sei se é) autorizada pela SPA/MF",
    risco: "Muda o fundamento: não dê à irregular o dever de operador autorizado. Cobrança contra offshore costuma ser difícil de executar.",
  },
  {
    id: "recusaSaque",
    label: "Recusaram ou travaram meu saque de saldo próprio",
    risco: "Saldo não sacado é o pedido mais limpo. Separe saldo de 'perda de aposta'.",
  },
  {
    id: "marketingApos",
    label: "Depois do bloqueio continuaram me chamando (push, e-mail, WhatsApp, SMS)",
    risco: "CDC + LGPD. Precisa de print da mensagem com data posterior à exclusão.",
  },
  {
    id: "bonusApos",
    label: "Mandaram bônus, freebet ou cashback depois da autoexclusão",
    risco: "Incentivo a pessoa que pediu para parar. Bom fato se o print existir.",
  },
  {
    id: "lgpdPerfil",
    label: "Usaram meu perfil/histórico para me estimular a depositar de novo",
    risco: "LGPD (tratamento e perfilamento). Não invente: descreva o que você viu (remarketing, 'voltou a perder', etc.).",
  },
  {
    id: "publicidadeEnganosa",
    label: "A publicidade prometia ganho fácil / omitia o risco",
    risco: "Art. 37 CDC. Junte anúncio, print ou e-mail. Sem peça publicitária, desmarque.",
  },
  {
    id: "idoso",
    label: "Eu tinha 60 anos ou mais na época dos fatos",
    risco: "Estatuto do Idoso reforça vulnerabilidade. Só marque se for verdade.",
  },
  {
    id: "menorIdade",
    label: "Eu era menor de 18 anos quando a casa aceitou a aposta",
    risco: "Art. 26, I, da Lei 14.790/2023 + ECA. Precisa de prova de idade e de que a conta era sua.",
  },
];
