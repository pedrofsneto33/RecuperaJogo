import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EMPRESA, waLink } from "@/lib/empresa";
import { abrirTicket } from "@/lib/server/suporte";

export const Route = createFileRoute("/suporte")({ component: Suporte });

function Suporte() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<number | null>(null);
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await abrirTicket({ data: { email, tipo: "suporte", mensagem } });
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
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">Suporte Primex Sistemas</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {EMPRESA.razao} · CNPJ {EMPRESA.cnpj}. Atendimento ao cliente do RecuperaJogo.
        </p>
        <div className="mt-6 space-y-2 rounded-2xl border border-border bg-surface p-5 text-sm">
          <p><a className="font-medium text-primary" href={`mailto:${EMPRESA.email}`}>{EMPRESA.email}</a></p>
          <p><a className="font-medium text-primary" href={`tel:+${EMPRESA.telefoneE164}`}>{EMPRESA.telefone}</a></p>
          <p>
            <a className="font-medium text-primary" href={waLink("Olá, preciso de suporte no RecuperaJogo.")} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </p>
        </div>
        {ok ? (
          <p className="mt-8 rounded-xl border border-border bg-surface p-4 text-sm">
            Pedido registrado. Protocolo {ok}. A Primex responde no e-mail informado ou no WhatsApp.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-3">
            <label className="block text-sm">
              Seu e-mail
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              O que aconteceu
              <textarea required minLength={8} rows={5} value={mensagem} onChange={(e) => setMensagem(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5" />
            </label>
            {err && <p className="text-sm text-danger">{err}</p>}
            <button type="submit" disabled={busy} className="min-h-11 w-full rounded-md bg-primary font-semibold text-primary-fg disabled:opacity-50">
              {busy ? "Enviando…" : "Abrir chamado"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
