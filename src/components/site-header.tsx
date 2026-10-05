import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { isOwnerEmail } from "@/lib/empresa";
import { getSouDono } from "@/lib/server/admin";

export function SiteHeader() {
  const { user, isPending } = useCurrentUserState();
  const [dono, setDono] = useState(false);

  useEffect(() => {
    if (!user) {
      setDono(false);
      return;
    }
    if (isOwnerEmail(user.primaryEmail)) {
      setDono(true);
      return;
    }
    getSouDono()
      .then((r) => setDono(r.dono))
      .catch(() => setDono(false));
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2 text-fg no-underline">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-fg font-sans text-[10px] font-extrabold tracking-wider">
            RJ
          </span>
          <span className="font-sans text-base font-extrabold tracking-tight">RecuperaJogo</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-3 text-sm">
          <Link to="/exemplo" className="hidden text-muted hover:text-fg sm:inline">
            Exemplo
          </Link>
          <Link to="/escudo" className="text-muted hover:text-fg">
            Escudo
          </Link>
          <Link to="/rh" className="hidden text-muted hover:text-fg xl:inline">
            Kit RH
          </Link>
          <Link to="/guia" className="hidden text-muted hover:text-fg lg:inline">
            Guia
          </Link>
          <Link to="/suporte" className="hidden text-muted hover:text-fg lg:inline">
            Suporte
          </Link>
          {isPending ? (
            <div className="h-9 w-16 animate-pulse rounded-md bg-border" aria-hidden />
          ) : (
            <>
              <SignedOut>
                <Link
                  to="/login"
                  className="rounded-md bg-primary px-3 py-2 font-semibold text-primary-fg no-underline"
                >
                  Entrar
                </Link>
              </SignedOut>
              <SignedIn>
                {dono && (
                  <Link to="/admin" className="font-medium text-primary">
                    Painel
                  </Link>
                )}
                <Link to="/conta" className="text-muted hover:text-fg">
                  Conta
                </Link>
                <UserButton />
              </SignedIn>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
