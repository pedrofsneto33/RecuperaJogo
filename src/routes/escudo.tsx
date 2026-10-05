import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Shield, Download, Lock, HeartPulse, AlertTriangle, ExternalLink, Plus,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { dnsList, hostsFile } from "@/lib/escudo/sites";
import { getListaEscudo, type ListaEscudo } from "@/lib/server/escudo-feed";
import { getShield, logUrge, startShieldLock, type ShieldStatus } from "@/lib/server/escudo";

export const Route = createFileRoute("/escudo")({ component: Escudo });

function Escudo() {
  const { user } = useCurrentUserState();
  const [lista, setLista] = useState<ListaEscudo | null>(null);
  const [extra, setExtra] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [pin, setPin] = useState("");
  const [hours, setHours] = useState(24);
  const [shield, setShield] = useState<ShieldStatus | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const extraList = extras;
  const feedDominios = lista?.dominios ?? [];
  const hosts = useMemo(() => hostsFile([...extraList, ...feedDominios]), [extraList, feedDominios]);
  const dns = useMemo(() => dnsList([...extraList, ...feedDominios]), [extraList, feedDominios]);

  useEffect(() => {
    getListaEscudo()
      .then(setLista)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    getShield()
      .then(setShield)
      .catch(() => undefined);
  }, [user]);

  function addExtra() {
    const d = extra.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    if (!d || d.length < 3) return;
    setExtras((prev) => (prev.includes(d) ? prev : [...prev, d]));
    setExtra("");
  }

  function baixar(nome: string, conteudo: string) {
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function trancar() {
    setBusy(true);
    setErr("");
    try {
      const next = await startShieldLock({ data: { pin, hours } });
      setShield(next);
      setPin("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Não trancou");
    } finally {
      setBusy(false);
    }
  }

  async function vontade() {
    setBusy(true);
    try {
      const next = await logUrge({ data: "urge" });
      setShield(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Não registrou");
    } finally {
      setBusy(false);
    }
  }

  const locked = Boolean(shield?.locked);
  const until = shield?.lockedUntil
    ? new Date(shield.lockedUntil).toLocaleString("pt-BR")
    : null;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Incluso na compra da petição</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Escudo — trave o impulso, não só o processo</h1>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          Isto não é o Gamban. Gamban e BetBlocker instalam filtro no sistema (VPN/DNS no aparelho).
          Um site não consegue bloquear outro site no seu celular — o navegador não deixa.
          O Escudo entrega lista, hosts e DNS para qualquer um ver. O cadeado de pânico
          entra no pacote da petição. Use junto com o filtro do aparelho.
        </p>

        <div className="mt-6 flex gap-3 rounded-lg border border-warn/30 bg-warn-bg px-4 py-3 text-sm text-warn">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            Se a vontade de apostar está fora de controle: CVV 188. Recuperar dinheiro no Juizado
            não substitui parar.
          </p>
        </div>

        {locked && (
          <div className="mt-8 rounded-2xl border border-primary bg-primary px-6 py-8 text-primary-fg">
            <Lock className="mb-3" />
            <h2 className="font-display text-2xl">Cadeado ativo até {until}</h2>
            <p className="mt-2 text-sm opacity-90">
              Não há botão de desistir. Quando o tempo acabar, entre de novo com o PIN.
              Enquanto isso, baixe o hosts e faça a autoexclusão SPA.
            </p>
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl">1. Lista de bloqueio</h2>
          <p className="mt-2 text-sm text-muted">
            {feedDominios.length || "—"} domínios. Atualizada
            {lista?.atualizadoEm ? ` em ${new Date(lista.atualizadoEm).toLocaleDateString("pt-BR")}` : " nesta semana"}.
            {lista && lista.novos7d > 0 ? ` ${lista.novos7d} novos em 7 dias.` : ""}
          </p>
          {lista && lista.extras.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {lista.extras.slice(0, 8).map((e) => (
                <li key={e.dominio}>
                  <span className="font-mono text-fg">{e.dominio}</span>
                  {e.nota ? ` — ${e.nota}` : ""}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-2">
            <input
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addExtra()}
              placeholder="ex.: minhacasa.bet.br"
              className="min-h-11 flex-1 rounded-md border border-border bg-bg px-3"
            />
            <button type="button" onClick={addExtra} className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-3">
              <Plus size={16} /> Add
            </button>
          </div>
          {extraList.length > 0 && (
            <p className="mt-2 text-xs text-muted">Seus: {extraList.join(", ")}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => baixar("recupera-escudo-hosts.txt", hosts)}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg"
            >
              <Download size={16} /> Baixar hosts.txt
            </button>
            <button
              type="button"
              onClick={() => baixar("recupera-escudo-dns.txt", dns)}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium"
            >
              <Download size={16} /> Lista DNS (NextDNS / AdGuard)
            </button>
          </div>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Windows: cole o arquivo em C:\Windows\System32\drivers\etc\hosts (como administrador).</li>
            <li>iPhone: Tempo de Uso → Restrições de conteúdo → Sites → não permitir, e cole os domínios.</li>
            <li>Android: Bem-estar digital, ou AdGuard/NextDNS no DNS privado.</li>
            <li>Roteador: DNS do NextDNS na casa inteira, para o Wi-Fi não furar o bloqueio do celular.</li>
          </ol>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Lock size={18} /> 2. Cadeado de pânico
          </h2>
          <p className="mt-2 text-sm text-muted">
            PIN + prazo. Depois de trancar, não abre até o relógio. É o mesmo modelo mental do Gamban,
            sem fingir que controlamos o sistema operacional.
          </p>
          <SignedOut>
            <Link to="/login" className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg no-underline">
              Entrar para ativar o cadeado
            </Link>
          </SignedOut>
          <SignedIn>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                PIN (4 a 8 dígitos)
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Horas
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
                >
                  <option value={6}>6 horas</option>
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                </select>
              </label>
            </div>
            {err && <p className="mt-2 text-sm text-danger">{err}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || pin.length < 4 || locked}
                onClick={trancar}
                className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg disabled:opacity-40"
              >
                Trancar agora
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={vontade}
                className="min-h-11 rounded-md border border-border px-4 text-sm"
              >
                <HeartPulse size={14} className="mr-1 inline" />
                Estou com vontade — só registrar ({shield?.urgeCount ?? 0})
              </button>
            </div>
          </SignedIn>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Shield size={18} /> 3. Autoexclusão oficial e filtro de verdade
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              Autoexclusão no gov.br / SPA (operadores autorizados) — é o bloqueio que a lei reconhece.
            </li>
            <li>
              <a className="inline-flex items-center gap-1 text-primary" href="https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas" target="_blank" rel="noreferrer">
                Secretaria de Prêmios e Apostas <ExternalLink size={12} />
              </a>
            </li>
            <li>
              Gamban, BetBlocker ou filtro de DNS no aparelho — esta camada o Escudo não substitui, complementa.
            </li>
            <li>Banco: limite PIX noturno e aviso de transação. A casa não deposita sozinha.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-primary p-6 text-primary-fg">
          <h2 className="font-display text-xl">Já perdeu dinheiro com bloqueio ignorado?</h2>
          <p className="mt-2 text-sm opacity-90">
            O Escudo é de graça para parar. O gerador de rascunho (CDC, LGPD, Lei 14.790) é o produto pago —
            sem prometermos vitória.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-bg px-4 text-sm font-semibold text-fg no-underline"
          >
            Ir ao rascunho de petição
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
