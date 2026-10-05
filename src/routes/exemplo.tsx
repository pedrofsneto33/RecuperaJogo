import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PeticaoDemo } from "@/components/peticao-demo";
import { DisclaimerBar } from "@/components/disclaimer-bar";
import { EMPRESA, waLink } from "@/lib/empresa";

export const Route = createFileRoute("/exemplo")({ component: Exemplo });

function Exemplo() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Vitrine · não é a peça do cliente</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Assim fica a petição. O que protocola, não.
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          Toque nas tarjas pretas. Elas escondem nome, CPF, casa, valor e prova.
          Troque o tipo de caso em cima — a estrutura muda, o ouro continua tapado.
          Copiar esta página cola um aviso da Primex, não um texto de Juizado.
        </p>
        <div className="mt-8">
          <PeticaoDemo />
        </div>
        <p className="mt-6 text-sm">
          <a
            className="font-medium text-primary"
            href={waLink("Olha a cara da petição RecuperaJogo (tarjada): peça + Escudo.")}
            target="_blank"
            rel="noreferrer"
          >
            Mandar no WhatsApp
          </a>
          {" · "}
          {EMPRESA.telefone}
        </p>
        <div className="mt-8">
          <DisclaimerBar />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
