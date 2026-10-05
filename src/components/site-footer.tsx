import { Link } from "@tanstack/react-router";
import { COPYRIGHT, EMPRESA } from "@/lib/empresa";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 py-10 text-xs text-muted">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/termos">Termos</Link>
          <Link to="/privacidade">Privacidade (LGPD)</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/exemplo">Exemplo de petição</Link>
          <Link to="/rh">Kit RH</Link>
          <Link to="/suporte">Suporte</Link>
          <Link to="/guia">Guia</Link>
          <Link to="/escudo">Escudo</Link>
        </div>
        <p className="mt-5 text-center leading-relaxed">
          {EMPRESA.razao} · CNPJ {EMPRESA.cnpj} · {EMPRESA.email} · {EMPRESA.telefone}
        </p>
        <p className="mt-2 text-center leading-relaxed">{COPYRIGHT}</p>
      </div>
    </footer>
  );
}
