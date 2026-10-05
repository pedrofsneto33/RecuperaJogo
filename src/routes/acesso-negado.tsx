import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/acesso-negado")({ component: AcessoNegado });

function AcessoNegado() {
  return (
    <div className="campaign min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="relative mx-auto max-w-lg px-4 py-16">
        <ShieldOff className="text-danger" aria-hidden />
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">Essa área é da Primex</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          O painel, a chave PIX e o WhatsApp oficial só abrem no e-mail da empresa.
          Sua conta de cliente continua no fluxo de petição e Escudo.
        </p>
        <Link
          to="/conta"
          className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-fg px-5 font-semibold text-bg no-underline"
        >
          Ir para a minha conta
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
