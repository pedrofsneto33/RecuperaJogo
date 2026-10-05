import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Ban, FileText, Loader2, Shield } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccess, getMyMinutas, salvarTelefone, type Access, type MinutaResumo } from "@/lib/server/access";
import { EMPRESA } from "@/lib/empresa";
import { fmtBRL, MAX_PETICOES, PRECO_REAIS } from "@/lib/legal/constantes";

export const Route = createFileRoute("/conta")({ component: Conta });

function Conta() {
  const { user, isPending } = useCurrentUserState();
  const [access, setAccess] = useState<Access | null>(null);
  const [minutas, setMinutas] = useState<MinutaResumo[]>([]);
  const [tel, setTel] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyAccess()
      .then((a) => {
        setAccess(a);
        setTel(a.telefone ?? "");
      })
      .catch(() => undefined);
    getMyMinutas()
      .then(setMinutas)
      .catch(() => undefined);
  }, [user]);

  if (isPending) {
    return (
      <main className="campaign grid min-h-screen place-items-center bg-bg">
        <Loader2 className="animate-spin text-fg" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const ativo = access?.status === "active";

  async function onTel(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const next = await salvarTelefone({ data: { telefone: tel } });
      setAccess(next);
      setMsg("WhatsApp salvo. Aviso de PIX cai neste número.");
    } catch (ex) {
      setMsg(ex instanceof Error ? ex.message : "Não salvou");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="campaign min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Área do cliente</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Sua conta</h1>
        <p className="mt-2 text-sm text-muted">
          {user.primaryEmail}. RecuperaJogo não é advocacia — você revisa e protocola.
        </p>

        {!access ? (
          <div className="mt-8 h-28 animate-pulse rounded-2xl bg-surface" />
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Kpi k="Pacote" v={ativo ? "liberado" : access.status === "pix_pending" ? "aguardando PIX" : "pendente"} />
            <Kpi k="Rascunhos" v={`${access.remaining} de ${MAX_PETICOES}`} />
            <Kpi k="Kit RH" v={access.kitRh ? "liberado" : "não"} />
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {ativo ? (
            <Link to="/gerador" className="rounded-2xl border border-fg bg-fg p-5 no-underline">
              <FileText className="text-bg" size={18} />
              <p className="mt-2 font-display text-xl font-extrabold text-bg">Abrir gerador</p>
              <p className="mt-1 text-sm text-bg/70">Petição, notificação ou Kit RH.</p>
            </Link>
          ) : (
            <Link to="/pagamento" search={{ produto: "pacote" }} className="rounded-2xl border border-fg bg-fg p-5 no-underline">
              <Shield className="text-bg" size={18} />
              <p className="mt-2 font-display text-xl font-extrabold text-bg">Pagar {fmtBRL(PRECO_REAIS)}</p>
              <p className="mt-1 text-sm text-bg/70">PIX no CNPJ da {EMPRESA.nomeFantasia}. Escudo incluso.</p>
            </Link>
          )}
          <Link to="/escudo" className="rounded-2xl border border-border bg-surface p-5 no-underline">
            <Ban className="text-fg" size={18} />
            <p className="mt-2 font-display text-xl font-extrabold">Escudo</p>
            <p className="mt-1 text-sm text-muted">Lista e hosts para bloquear as ilegais.</p>
          </Link>
        </div>

        <form onSubmit={onTel} className="mt-10 rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-extrabold">WhatsApp para aviso de pagamento</h2>
          <p className="mt-1 text-sm text-muted">Opcional. DDD + número. A Primex avisa quando o PIX cair.</p>
          <input
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="86988117925"
            inputMode="tel"
            className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-2.5"
          />
          {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-3 inline-flex min-h-11 items-center rounded-md bg-fg px-4 text-sm font-semibold text-bg disabled:opacity-50"
          >
            {busy ? "Salvando…" : "Salvar número"}
          </button>
        </form>

        <section className="mt-10">
          <h2 className="font-display text-xl font-extrabold">Minutas</h2>
          {minutas.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nenhum rascunho ainda. Pague e gere no gerador.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {minutas.map((m) => (
                <li key={m.id} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                  <Link to="/gerador" className="font-medium text-fg">
                    {m.docTipo} · {m.perfil}
                  </Link>
                  <p className="font-mono text-xs text-muted">{m.hash ?? "sem hash"}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Kpi({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{k}</p>
      <p className="mt-1 font-display text-xl font-extrabold">{v}</p>
    </div>
  );
}
