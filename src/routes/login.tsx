import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Scale } from "lucide-react";
import {
  GROK_PROVIDERS,
  authEnabled,
  authClient,
  signIn,
} from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

import { isOwnerEmail } from "@/lib/empresa";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg text-fg">
        <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
      </main>
    );
  }
  if (user) {
    return <Navigate to={isOwnerEmail(user.primaryEmail) ? "/admin" : "/conta"} />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0],
        });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (res.error) throw new Error(res.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg p-4 text-fg">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">
        <Link to="/" className="mb-6 flex items-center gap-2 text-fg no-underline">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-fg">
            <Scale size={16} />
          </span>
          <span className="font-display text-lg font-semibold">RecuperaJogo</span>
        </Link>
        <h1 className="font-display text-2xl font-semibold">
          {mode === "in" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-muted">E-mail e senha da sua conta RecuperaJogo.</p>

        {!authEnabled ? (
          <p className="mt-4 text-sm text-muted">Login desativado neste ambiente.</p>
        ) : (
          <>
            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              {mode === "up" && (
                <label className="block text-sm">
                  Nome
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              )}
              <label className="block text-sm">
                E-mail
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              <label className="block text-sm">
                Senha (mín. 8)
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center rounded-md bg-primary font-semibold text-primary-fg disabled:opacity-60"
              >
                {loading ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <button
              type="button"
              className="mt-3 w-full text-sm text-muted underline"
              onClick={() => setMode(mode === "in" ? "up" : "in")}
            >
              {mode === "in" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
            </button>
            {mode === "in" && (
              <p className="mt-3 text-center text-sm">
                <Link to="/esqueci-senha" className="font-medium text-primary">
                  Esqueci a senha
                </Link>
              </p>
            )}

            <div className="my-6 h-px bg-border" />
            <p className="mb-2 text-center text-xs text-muted">ou continue com</p>
            <div className="flex flex-col gap-2">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/gerador" })}
                  className="min-h-11 w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-bg"
                >
                  Continuar com {p.label}
                </button>
              ))}
            </div>
          </>
        )}
        <p className="mt-6 text-center text-xs text-muted">
          Ao continuar você aceita os <Link to="/termos">Termos</Link>.
        </p>
      </div>
    </main>
  );
}
