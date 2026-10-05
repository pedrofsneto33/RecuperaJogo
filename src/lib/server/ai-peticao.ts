import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { ARGUMENTOS, type Perfil } from "@/lib/legal/argumentos";
import { CORPO_NORMATIVO } from "@/lib/legal/corpus";
import { type VariaveisFato, VARIAVEIS_VAZIAS } from "@/lib/legal/variaveis";

export type AiResultado = {
  ok: true;
  relato: string;
  provasMinimas: string[];
  argumentosRecomendados: string[];
  argumentosEvitar: { id: string; motivo: string }[];
  alertas: string[];
};

export type AiFalha = { ok: false; error: string };

const IDS = ARGUMENTOS.map((a) => a.id);

export const organizarRelato = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    relato: string;
    perfil: Perfil;
    temLaudo: boolean;
    variaveis?: VariaveisFato;
  }) => input)
  .handler(async ({ data }): Promise<AiResultado | AiFalha> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "IA indisponível neste ambiente." };

    const relato = data.relato.trim().slice(0, 4000);
    if (relato.length < 40) {
      return { ok: false, error: "Escreva pelo menos algumas linhas do que aconteceu, com datas se tiver." };
    }

    const v = data.variaveis ?? VARIAVEIS_VAZIAS;
    const ids = IDS.join(", ");

    const system = `Você é revisor de FATOS para um software brasileiro de rascunho de petição (jus postulandi). Você NÃO é advogado e NÃO escreve a peça.

${CORPO_NORMATIVO}

REGRAS:
- Nunca invente data, valor, nome, CNPJ, protocolo, laudo ou conversa que o usuário não escreveu.
- Se faltar um dado, coloque [PREENCHER] no relato, não chute.
- Organize o relato em parágrafos cronológicos, linguagem sóbria, 1ª pessoa.
- Não cite jurisprudência.
- Não recomende nulidade_art26 se temLaudo=false.
- Não recomende cobranca_indevida_art42 se o usuário só perdeu aposta.
- IDs de argumento válidos: ${ids}
- Responda APENAS JSON válido, sem markdown.

Formato:
{
  "relato": "string",
  "provasMinimas": ["string"],
  "argumentosRecomendados": ["id"],
  "argumentosEvitar": [{"id":"string","motivo":"string"}],
  "alertas": ["string"]
}`;

    const user = JSON.stringify({
      perfil: data.perfil,
      temLaudo: data.temLaudo,
      variaveis: v,
      relato_do_usuario: relato,
    });

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.2,
          max_tokens: 1400,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return { ok: false, error: "IA indisponível neste momento. O rascunho continua com os artigos do software." };
        }
        return { ok: false, error: `IA retornou ${res.status}. Tente de novo em instantes.` };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = body.choices?.[0]?.message?.content ?? "";
      const jsonText = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(jsonText) as {
        relato?: string;
        provasMinimas?: unknown;
        argumentosRecomendados?: unknown;
        argumentosEvitar?: unknown;
        alertas?: unknown;
      };

      const rec = Array.isArray(parsed.argumentosRecomendados)
        ? parsed.argumentosRecomendados.filter((x): x is string => typeof x === "string" && IDS.includes(x))
        : [];
      const evitar = Array.isArray(parsed.argumentosEvitar)
        ? parsed.argumentosEvitar.flatMap((x) => {
            if (!x || typeof x !== "object") return [];
            const row = x as { id?: unknown; motivo?: unknown };
            if (typeof row.id !== "string" || !IDS.includes(row.id)) return [];
            return [{ id: row.id, motivo: String(row.motivo ?? "") }];
          })
        : [];

      return {
        ok: true,
        relato: String(parsed.relato ?? relato).slice(0, 8000),
        provasMinimas: Array.isArray(parsed.provasMinimas)
          ? parsed.provasMinimas.filter((x): x is string => typeof x === "string").slice(0, 12)
          : [],
        argumentosRecomendados: rec,
        argumentosEvitar: evitar,
        alertas: Array.isArray(parsed.alertas)
          ? parsed.alertas.filter((x): x is string => typeof x === "string").slice(0, 10)
          : [],
      };
    } catch {
      return { ok: false, error: "A IA não devolveu um JSON utilizável. Seu texto original foi mantido." };
    }
  });
