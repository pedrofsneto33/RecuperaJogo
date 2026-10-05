/** Comarcas com Juizado Especial Cível mais usadas — foro do domicílio do autor. Sempre conferir no tribunal. */
export const COMARCAS: Record<string, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul"],
  AL: ["Maceió", "Arapiraca"],
  AP: ["Macapá"],
  AM: ["Manaus", "Parintins"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Lauro de Freitas", "Ilhéus"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Sobral"],
  DF: ["Brasília"],
  ES: ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde"],
  MA: ["São Luís", "Imperatriz"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop"],
  MS: ["Campo Grande", "Dourados"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba"],
  PA: ["Belém", "Ananindeua", "Marabá", "Santarém"],
  PB: ["João Pessoa", "Campina Grande"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "Foz do Iguaçu"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
  PI: ["Teresina", "Parnaíba"],
  RJ: ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos dos Goytacazes", "São João de Meriti"],
  RN: ["Natal", "Mossoró"],
  RS: ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria", "Gravataí"],
  RO: ["Porto Velho", "Ji-Paraná"],
  RR: ["Boa Vista"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó", "Itajaí"],
  SP: ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco", "Ribeirão Preto", "Sorocaba", "São José dos Campos", "Santos", "Mauá", "Diadema", "Jundiaí", "Piracicaba"],
  SE: ["Aracaju"],
  TO: ["Palmas", "Araguaína"],
};

export function comarcasDaUf(uf: string): string[] {
  return COMARCAS[uf] ?? [];
}
