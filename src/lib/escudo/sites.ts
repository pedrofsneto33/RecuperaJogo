/** Lista de bloqueio — marcas comuns de aposta no Brasil e offshore. Não é lista oficial da SPA. */
export const SITES_BLOQUEIO: { dominio: string; grupo: "br" | "offshore" | "app" }[] = [
  { dominio: "bet365.com", grupo: "br" },
  { dominio: "bet365.bet.br", grupo: "br" },
  { dominio: "betano.com", grupo: "br" },
  { dominio: "betano.bet.br", grupo: "br" },
  { dominio: "sportingbet.com", grupo: "br" },
  { dominio: "sportingbet.bet.br", grupo: "br" },
  { dominio: "superbet.bet.br", grupo: "br" },
  { dominio: "superbet.com", grupo: "br" },
  { dominio: "betfair.com", grupo: "br" },
  { dominio: "kto.com", grupo: "br" },
  { dominio: "kto.bet.br", grupo: "br" },
  { dominio: "pixbet.bet.br", grupo: "br" },
  { dominio: "betnacional.bet.br", grupo: "br" },
  { dominio: "esportedasorte.bet.br", grupo: "br" },
  { dominio: "vaidebet.bet.br", grupo: "br" },
  { dominio: "galera.bet", grupo: "br" },
  { dominio: "betboom.bet.br", grupo: "br" },
  { dominio: "sportybet.com", grupo: "br" },
  { dominio: "stake.com", grupo: "offshore" },
  { dominio: "blaze.com", grupo: "offshore" },
  { dominio: "blaze.bet.br", grupo: "offshore" },
  { dominio: "jonbet.com", grupo: "offshore" },
  { dominio: "fortune-tiger.com", grupo: "offshore" },
  { dominio: "7games.com", grupo: "offshore" },
  { dominio: "apostaganha.bet.br", grupo: "br" },
  { dominio: "betsson.com", grupo: "br" },
  { dominio: "rivalo.com", grupo: "br" },
  { dominio: "pixbet.com", grupo: "br" },
  { dominio: "bet365.com.br", grupo: "br" },
  { dominio: "cassino.com", grupo: "offshore" },
];

export function hostsFile(extra: string[] = []) {
  const all = [...SITES_BLOQUEIO.map((s) => s.dominio), ...extra.map((d) => d.trim().toLowerCase())].filter(Boolean);
  const uniq = [...new Set(all)];
  const lines = [
    "# RecuperaJogo Escudo — arquivo hosts",
    "# Cole em: Windows \\System32\\drivers\\etc\\hosts  |  macOS/Linux /etc/hosts",
    "# Isto NÃO substitui Gamban/filtro de DNS. É a camada que você controla.",
    "",
  ];
  for (const d of uniq) {
    lines.push(`0.0.0.0 ${d}`);
    if (!d.startsWith("www.")) lines.push(`0.0.0.0 www.${d}`);
  }
  return lines.join("\n") + "\n";
}

export function dnsList(extra: string[] = []) {
  const all = [...SITES_BLOQUEIO.map((s) => s.dominio), ...extra.map((d) => d.trim().toLowerCase())].filter(Boolean);
  return [...new Set(all)].join("\n") + "\n";
}
