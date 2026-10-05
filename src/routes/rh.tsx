import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DisclaimerBar } from "@/components/disclaimer-bar";
import { EMPRESA } from "@/lib/empresa";
import { fmtBRL, PRECO_REAIS, PRECO_RH_REAIS } from "@/lib/legal/constantes";

export const Route = createFileRoute("/rh")({ component: Rh });

function Rh() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">B2B · {EMPRESA.nomeFantasia}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Kit RH — jogo no expediente</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Política interna, termo de ciência e encaminhamento voluntário ao CAPS/CVV 188.
          Não é parecer trabalhista, não é laudo, não substitui PCMSO. A Lei 14.790 regula a casa
          de apostas — não o contrato de emprego.
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          <li className="rounded-xl border border-border bg-surface p-4">
            <p className="font-medium">1. Política</p>
            <p className="mt-1 text-muted">Dispositivo corporativo, DNS/Escudo no Wi-Fi, canal confidencial.</p>
          </li>
          <li className="rounded-xl border border-border bg-surface p-4">
            <p className="font-medium">2. Termo de ciência</p>
            <p className="mt-1 text-muted">O colaborador assina ciência. Não é confissão de doença.</p>
          </li>
          <li className="rounded-xl border border-border bg-surface p-4">
            <p className="font-medium">3. Encaminhamento</p>
            <p className="mt-1 text-muted">Modelo para CAPS ou convênio. Sem prontuário anexado.</p>
          </li>
        </ul>
        <p className="mt-8 font-display text-3xl font-semibold">{fmtBRL(PRECO_RH_REAIS)}</p>
        <p className="mt-1 text-sm text-muted">PIX no CNPJ da Primex. Produto separado do pacote de {fmtBRL(PRECO_REAIS)}.</p>
        <Link
          to="/pagamento"
          search={{ produto: "rh" }}
          className="mt-6 inline-flex min-h-12 items-center rounded-md bg-primary px-5 font-semibold text-primary-fg no-underline"
        >
          Liberar Kit RH
        </Link>
        <div className="mt-10">
          <DisclaimerBar />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
