import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "rj_cookies";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(!window.localStorage.getItem(KEY));
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  function aceitar() {
    try {
      window.localStorage.setItem(KEY, "essenciais");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-fg p-4 text-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-bg/80">
          Usamos cookies essenciais de login e de preferência. Sem cookies de marketing ou rastreio.
          Detalhes em <Link to="/cookies">Cookies</Link> e <Link to="/privacidade">Privacidade</Link>.
        </p>
        <button
          type="button"
          onClick={aceitar}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-bg px-4 font-semibold text-fg"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
