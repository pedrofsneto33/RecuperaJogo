import { useState, type ClipboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { EMPRESA } from "@/lib/empresa";
import { blocosDemo, DEMO_CASOS, type DemoCaso } from "@/lib/legal/exemplo-peticao";
import { fmtBRL, PRECO_REAIS } from "@/lib/legal/constantes";

function Tarja({ w, hint }: { w: "sm" | "md" | "lg"; hint: string }) {
  const width = w === "sm" ? "w-24" : w === "md" ? "w-40" : "w-full max-w-xs";
  return (
    <span className="relative mx-0.5 inline-flex align-middle">
      <span
        title={hint}
        className={`redact inline-block ${width} h-3.5 rounded-sm bg-fg align-middle`}
        aria-label={hint}
      />
    </span>
  );
}

export function PeticaoDemo({ compact = false }: { compact?: boolean }) {
  const [caso, setCaso] = useState<DemoCaso>("autoexclusao");
  const [hint, setHint] = useState("Toque numa tarja preta para ver o que está escondido.");
  const blocos = blocosDemo(caso);

  function onCopy(e: ClipboardEvent) {
    e.preventDefault();
    const msg = `Rascunho demonstrativo ${EMPRESA.produto} / ${EMPRESA.razao}. Não protocolar. O texto útil só sai no pacote pago.`;
    e.clipboardData.setData("text/plain", msg);
  }

  return (
    <div className="paper-demo overflow-x-hidden" onCopy={onCopy}>
      <article className="print-sheet relative overflow-hidden rounded-2xl border border-border bg-surface px-5 py-8 shadow-sm sm:px-10">
        <div className="relative mb-5 flex flex-wrap gap-2">
          {DEMO_CASOS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCaso(c.id);
                setHint(c.resumo);
              }}
              className={`min-h-11 rounded-md px-3 text-sm font-medium ${
                caso === c.id ? "bg-primary text-primary-fg" : "border border-border bg-bg"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="relative mb-4 text-sm text-muted">{hint}</p>
        <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-[0.08]">
          <p className="rotate-[-22deg] text-center font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            DEMONSTRATIVO
            <br />
            NÃO PROTOCOLAR
            <br />
            {EMPRESA.nomeFantasia}
          </p>
        </div>
        <p className="relative text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
          Juizado Especial Cível · rascunho {EMPRESA.produto}
        </p>
        <div className="relative mt-6 space-y-6 text-[15px] leading-relaxed [overflow-wrap:anywhere]">
          {(compact ? blocos.slice(0, 3) : blocos).map((b) => (
            <section key={b.k}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide">{b.titulo}</h3>
              <p className="mt-2">
                {b.linhas.map((l, i) =>
                  l.t === "txt" ? (
                    <span key={i}>{l.v} </span>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      className="inline bg-transparent p-0"
                      onClick={() => setHint(l.hint)}
                    >
                      <Tarja w={l.w} hint={l.hint} />
                    </button>
                  ),
                )}
              </p>
            </section>
          ))}
        </div>
        <p className="relative mt-8 border-t border-border pt-4 text-xs text-muted">
          Tarjas = nome, CPF, endereço, casa, valores, prints. Artigo de lei é público.
          Copiar daqui não gera peça protocolável.
        </p>
        <Link
          to="/login"
          className="relative mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-fg no-underline"
        >
          Gerar a minha · {fmtBRL(PRECO_REAIS)}
        </Link>
      </article>
    </div>
  );
}
