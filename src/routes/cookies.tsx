import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EMPRESA } from "@/lib/empresa";

export const Route = createFileRoute("/cookies")({ component: Cookies });

function Cookies() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <article className="mx-auto max-w-2xl space-y-4 px-4 py-12 text-sm leading-relaxed text-muted">
        <h1 className="font-display text-3xl text-fg">Política de cookies</h1>
        <p>Controladora: {EMPRESA.razao}, CNPJ {EMPRESA.cnpj}.</p>
        <h2 className="pt-2 font-display text-xl text-fg">Essenciais</h2>
        <p>
          Cookies de sessão de login (Better Auth) para manter você autenticado. Sem eles a conta
          não funciona. Preferência de aceite desta política, guardada no seu navegador.
        </p>
        <h2 className="font-display text-xl text-fg">O que não usamos</h2>
        <p>
          Não instalamos cookies de publicidade, remarketing ou redes sociais de terceiros para
          rastrear navegação. Não vendemos dados de navegação.
        </p>
        <h2 className="font-display text-xl text-fg">Base legal</h2>
        <p>
          Cookies estritamente necessários: execução de contrato e interesse legítimo de segurança
          da conta (arts. 7º, V e IX, LGPD). Dúvidas: {EMPRESA.email}.
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
