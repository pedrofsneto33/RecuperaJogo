import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getPainel, liberarCliente, marcarTicket } from "@/lib/server/admin";
import { addDominioEscudo, getListaEscudo, removerDominioEscudo, type ListaEscudo } from "@/lib/server/escudo-feed";
import { OwnerGate } from "@/components/owner-gate";
import { EMPRESA } from "@/lib/empresa";

export const Route = createFileRoute("/admin")({ component: Admin });

type Painel = Awaited<ReturnType<typeof getPainel>>;

function Admin() {
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Painel | null>(null);
  const [feed, setFeed] = useState<ListaEscudo | null>(null);
  const [dom, setDom] = useState("");
  const [nota, setNota] = useState("");
  const [filtro, setFiltro] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      setData(await getPainel());
      setFeed(await getListaEscudo());
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sem acesso");
    }
  }

  useEffect(() => {
    if (user) void load();
  }, [user]);

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="animate-spin text-primary" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <OwnerGate>
    <div className="campaign min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Interno · {EMPRESA.razao}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Painel</h1>
        <p className="mt-2 text-sm text-muted">
          Conta dono: {EMPRESA.email}. Acompanhe clientes, PIX, petições e chamados.
        </p>
        {err && <p className="mt-4 text-sm text-danger">{err}</p>}
        {data && (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-5">
              <Kpi k="Contas" v={String(data.totais.contas)} />
              <Kpi k="Acessos ativos" v={String(data.totais.ativos)} />
              <Kpi k="Rascunhos" v={String(data.totais.peticoes)} />
              <Kpi k="Chamados abertos" v={String(data.totais.ticketsAbertos)} />
              <Kpi k="PIX pagos" v={String(data.totais.pixPagos)} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link to="/configurar" className="rounded-md border border-border bg-surface px-3 py-2 font-medium">
                Chave PIX
              </Link>
              <Link to="/suporte" className="rounded-md border border-border bg-surface px-3 py-2 font-medium">
                Página de suporte
              </Link>
            </div>

            <h2 className="mt-10 font-display text-xl">Clientes</h2>
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="filtrar e-mail ou status"
              className="mt-3 min-h-11 w-full max-w-sm rounded-md border border-border bg-bg px-3 text-sm"
            />
            <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-surface">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">E-mail</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Rascunhos</th>
                    <th className="px-3 py-2 font-medium">PIX</th>
                    <th className="px-3 py-2 font-medium">Kit RH</th>
                    <th className="px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {data.users
                    .filter((u) => {
                      const q = filtro.trim().toLowerCase();
                      if (!q) return true;
                      return `${u.email} ${u.status} ${u.name}`.toLowerCase().includes(q);
                    })
                    .map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">{u.email}<div className="text-xs text-muted">{u.name}</div></td>
                      <td className="px-3 py-2">{u.status}</td>
                      <td className="px-3 py-2 tabular-nums">{u.peticoes_usadas}</td>
                      <td className="px-3 py-2 font-mono text-xs">{u.pix_txid ?? "—"}</td>
                      <td className="px-3 py-2">{u.kit_rh ? "sim" : "—"}</td>
                      <td className="px-3 py-2">
                        {u.status !== "active" && (
                          <button
                            type="button"
                            disabled={busy === u.id}
                            className="text-sm font-medium text-primary disabled:opacity-50"
                            onClick={async () => {
                              setBusy(u.id);
                              try {
                                await liberarCliente({ data: { userId: u.id } });
                                await load();
                              } finally {
                                setBusy(null);
                              }
                            }}
                          >
                            Liberar
                          </button>
                        )}
                        {!u.kit_rh && (
                          <button
                            type="button"
                            disabled={busy === u.id}
                            className="ml-2 text-sm font-medium text-primary disabled:opacity-50"
                            onClick={async () => {
                              setBusy(u.id);
                              try {
                                await liberarCliente({ data: { userId: u.id, kitRh: true } });
                                await load();
                              } finally {
                                setBusy(null);
                              }
                            }}
                          >
                            + RH
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-10 font-display text-xl">Feed do Escudo</h2>
            <p className="mt-1 text-sm text-muted">
              {feed
                ? `${feed.dominios.length} hosts · ${feed.novos7d} novos em 7 dias`
                : "Carregando…"}
            </p>
            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!dom.trim()) return;
                setFeed(await addDominioEscudo({ data: { dominio: dom, nota } }));
                setDom("");
                setNota("");
              }}
            >
              <input
                value={dom}
                onChange={(e) => setDom(e.target.value)}
                placeholder="dominio.com"
                className="min-h-11 rounded-md border border-border bg-bg px-3 text-sm"
              />
              <input
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="nota (opcional)"
                className="min-h-11 min-w-40 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
              />
              <button type="submit" className="rounded-md bg-primary px-4 text-sm font-medium text-primary-fg">
                Incluir na semana
              </button>
            </form>
            <ul className="mt-3 space-y-1 text-sm">
              {feed?.extras.map((e) => (
                <li key={e.dominio} className="flex justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <span>
                    <span className="font-mono">{e.dominio}</span>
                    {e.nota ? ` — ${e.nota}` : ""}
                  </span>
                  <button
                    type="button"
                    className="text-danger"
                    onClick={async () => setFeed(await removerDominioEscudo({ data: { dominio: e.dominio } }))}
                  >
                    tirar
                  </button>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-xl">PIX</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {data.pix.length === 0 && <p className="text-muted">Nenhum QR gerado ainda.</p>}
              {data.pix.map((p) => (
                <li key={p.txid} className="flex flex-wrap justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3">
                  <span className="font-mono text-xs">{p.txid}</span>
                  <span>{p.status} · {p.provider} · R$ {(p.amount_cents / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-xl">Chamados e senhas</h2>
            <ul className="mt-3 space-y-3">
              {data.tickets.length === 0 && <p className="text-sm text-muted">Nenhum chamado ainda.</p>}
              {data.tickets.map((t) => (
                <li key={t.id} className="rounded-xl border border-border bg-surface p-4 text-sm">
                  <p className="font-medium">{t.tipo} · {t.email} · #{t.id}</p>
                  <p className="mt-1 text-muted">{t.mensagem}</p>
                  <p className="mt-2 text-xs text-muted">{t.status} · {t.created_at}</p>
                  {t.status === "aberto" && (
                    <button
                      type="button"
                      className="mt-2 font-medium text-primary"
                      onClick={async () => {
                        await marcarTicket({ data: { id: t.id, status: "resolvido" } });
                        await load();
                      }}
                    >
                      Marcar resolvido
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-xl">Auditoria</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {(data.audit ?? []).length === 0 && <p className="text-muted">Nenhuma ação sensível ainda.</p>}
              {(data.audit ?? []).map((a) => (
                <li key={a.id} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <span className="font-medium">{a.action}</span>
                  {a.target ? <span className="text-muted"> · {a.target.slice(0, 8)}</span> : null}
                  <p className="text-xs text-muted">{a.created_at}{a.ip ? ` · ${a.ip}` : ""}</p>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-xl">Leads do guia</h2>
            <ul className="mt-3 text-sm text-muted">
              {data.leads.map((l) => (
                <li key={`${l.email}-${l.created_at}`}>{l.email} · {l.origem}</li>
              ))}
            </ul>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
    </OwnerGate>
  );
}

function Kpi({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{k}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{v}</p>
    </div>
  );
}
