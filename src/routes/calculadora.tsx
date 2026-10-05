import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DisclaimerBar } from "@/components/disclaimer-bar";
import { LIMITE_JUS_POSTULANDI, LIMITE_COMPETENCIA_JEC, faixaValorCausa, fmtBRL } from "@/lib/legal/constantes";

export const Route = createFileRoute("/calculadora")({ component: Calculadora });

function Calculadora() {
  const [valor, setValor] = useState("2000");
  const [dobro, setDobro] = useState(false);

  const r = useMemo(() => {
    const base = Number(valor) || 0;
    const mat = dobro ? base * 2 : base;
    return { base, mat, faixa: faixaValorCausa(mat) };
  }, [valor, dobro]);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">Onde seu pedido cabe</h1>
        <p className="mt-2 text-sm text-muted">
          Não calcula juros oficiais. A peça não pede 1% ao mês — a Lei 14.905/2024 mudou o art. 406 do CC.
          Aqui só se vê o teto do Juizado.
        </p>
        <div className="mt-6">
          <DisclaimerBar compact />
        </div>
        <div className="mt-6 space-y-4 rounded-xl border border-border bg-surface p-5">
          <label className="block text-sm">
            Valor que você pretende pedir de volta (R$)
            <input
              type="number"
              min={0}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={dobro} onChange={(e) => setDobro(e.target.checked)} className="mt-1" />
            Incluir dobro (somente se houve cobrança indevida — art. 42 CDC)
          </label>
        </div>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Pedido material</dt><dd>{fmtBRL(r.mat)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Jus postulandi (20 SM)</dt><dd>{fmtBRL(LIMITE_JUS_POSTULANDI)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Competência JEC (40 SM)</dt><dd>{fmtBRL(LIMITE_COMPETENCIA_JEC)}</dd></div>
        </dl>
        {r.faixa === "ok" && (
          <p className="mt-4 text-sm text-ok">Cabe atuar sozinho no JEC (art. 9º), se os fatos e a prova existirem.</p>
        )}
        {r.faixa === "advogado_jec" && (
          <p className="mt-4 text-sm text-danger">
            Acima de 20 SM: ainda pode ser Juizado até 40 SM, mas você precisa de advogado ou Defensoria.
          </p>
        )}
        {r.faixa === "justica_comum" && (
          <p className="mt-4 text-sm text-danger">
            Acima de 40 SM: não é Juizado. Justiça Comum, com advogado.
          </p>
        )}
        <Link to="/login" className="mt-8 inline-block font-medium text-primary">
          Gerar rascunho
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
