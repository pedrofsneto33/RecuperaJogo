import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EMPRESA, waLink } from "@/lib/empresa";
import { abrirTicket } from "@/lib/server/suporte";

export const Route = createFileRoute("/esqueci-senha")({ component: Esqueci });

function Esqueci() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await abrirTicket({
        data: {
          email,
          tipo: "senha",
          mensagem: `Pedido de redefinição de senha para ${email.trim().toLowerCase()}`,
        },
      });
      setOk(r.protocolo);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Não enviou");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">Esqueci a senha</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Informe o e-mail da conta. O pedido entra no painel da Primex e no WhatsApp de suporte.
          Se você entrou com Google ou X, use o mesmo botão em Entrar — não há senha local.
        </p>
        {ok ? (
          <div className="mt-8 space-y-3 rounded-2xl border border-border bg-surface p-5 text-sm">
            <p>Pedido registrado. Protocolo {ok}.</p>
            <p>
              Fale agora:{" "}
              <a className="font-medium text-primary" href={waLink(`Esqueci a senha. Protocolo ${ok}. E-mail: ${email}`)} target="_blank" rel="noreferrer">
                WhatsApp {EMPRESA.telefone}
              </a>
              {" · "}
              <a className="font-medium text-primary" href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a>
            </p>
            <Link to="/login" className="inline-block font-medium text-primary">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-3">
            <label className="block text-sm">
              E-mail da conta
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5" />
            </label>
            {err && <p className="text-sm text-danger">{err}</p>}
            <button type="submit" disabled={busy} className="min-h-11 w-full rounded-md bg-primary font-semibold text-primary-fg disabled:opacity-50">
              {busy ? "Enviando…" : "Pedir redefinição"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
