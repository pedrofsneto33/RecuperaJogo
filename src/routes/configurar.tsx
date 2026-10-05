import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, QrCode } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { EMPRESA } from "@/lib/empresa";
import { getPixAdmin, salvarPix } from "@/lib/server/pix-settings";
import { OwnerGate } from "@/components/owner-gate";

export const Route = createFileRoute("/configurar")({ component: Configurar });

function Configurar() {
  const { user, isPending } = useCurrentUserState();
  const [chave, setChave] = useState("");
  const [titular, setTitular] = useState("");
  const [cidade, setCidade] = useState("Teresina");
  const [openpix, setOpenpix] = useState("");
  const [secret, setSecret] = useState("");
  const [pode, setPode] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [hook, setHook] = useState("");
  const [waToken, setWaToken] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [waTpl, setWaTpl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setHook(`${window.location.origin}/api/pix/webhook`);
    if (!user) return;
    getPixAdmin()
      .then((s) => {
        setChave(s.chave);
        setTitular(s.titular);
        setCidade(s.cidade || "Teresina");
        setOpenpix(s.openpixAppId);
        setSecret(s.webhookSecret);
        setWaToken(s.waToken);
        setWaPhone(s.waPhoneId);
        setWaTpl(s.waTemplate);
        setPode(s.podeEditar);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user]);

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="animate-spin text-primary" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setOk(false);
    try {
      const r = await salvarPix({
        data: {
          chave,
          titular,
          cidade,
          openpixAppId: openpix,
          webhookSecret: secret,
          waToken,
          waPhoneId: waPhone,
          waTemplate: waTpl,
        },
      });
      if (r.webhookSecret) setSecret(r.webhookSecret);
      setOk(true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Não salvou");
    } finally {
      setBusy(false);
    }
  }

  return (
    <OwnerGate>
    <div className="campaign min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{EMPRESA.razao}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">PIX e liberação automática</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Só {EMPRESA.email}. Cole a chave PIX (recebe o dinheiro) e o App ID da{" "}
          <a href="https://app.openpix.com.br" target="_blank" rel="noreferrer" className="font-medium text-primary">
            OpenPix / Woovi
          </a>{" "}
          (conta grátis). Sem o App ID o QR funciona, mas a conta do cliente só libera no Painel.
        </p>

        {!loaded ? (
          <Loader2 className="mt-8 animate-spin text-primary" />
        ) : !pode ? (
          <p className="mt-8 text-sm text-danger">
            Somente {EMPRESA.email} altera recebimento.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-6">
            <label className="block text-sm">
              Chave PIX
              <input required value={chave} onChange={(e) => setChave(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              Nome do recebedor
              <input required value={titular} onChange={(e) => setTitular(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              Cidade
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5" />
            </label>
            <label className="block text-sm">
              OpenPix App ID (libera sozinho)
              <input value={openpix} onChange={(e) => setOpenpix(e.target.value)} placeholder="cole o AppID da OpenPix" className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-xs" />
            </label>
            <label className="block text-sm">
              Segredo do webhook (Authorization)
              <input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="gerado ao salvar se vazio" className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-xs" />
            </label>
            {hook && (
              <p className="rounded-md border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
                Na OpenPix, webhook POST para:<br />
                <span className="font-mono text-fg break-all">{hook}</span>
                <br />
                Header Authorization = o segredo acima. Evento: cobrança paga / CHARGE_COMPLETED.
              </p>
            )}
            <p className="pt-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">WhatsApp Cloud API</p>
            <label className="block text-sm">
              Phone Number ID
              <input value={waPhone} onChange={(e) => setWaPhone(e.target.value)} placeholder="ID do número no Meta" className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-xs" />
            </label>
            <label className="block text-sm">
              Token permanente
              <input value={waToken} onChange={(e) => setWaToken(e.target.value)} type="password" autoComplete="off" placeholder="Bearer da Meta" className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-xs" />
            </label>
            <label className="block text-sm">
              Nome do template (opcional)
              <input value={waTpl} onChange={(e) => setWaTpl(e.target.value)} placeholder="ex.: pagamento_confirmado" className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-xs" />
            </label>
            <p className="text-xs leading-relaxed text-muted">
              Sem template aprovado, a Meta só entrega texto se o cliente falou nas últimas 24h.
              Aviso cai no {EMPRESA.telefone} e no WhatsApp que o cliente salvar na conta.
            </p>
            {err && <p className="text-sm text-danger">{err}</p>}
            {ok && <p className="text-sm text-ok">Salvo. Pague um PIX de teste e veja o Painel.</p>}
            <button type="submit" disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary font-semibold text-primary-fg disabled:opacity-50">
              <QrCode size={16} />
              {busy ? "Salvando…" : "Salvar PIX e webhook"}
            </button>
          </form>
        )}
        <Link to="/pagamento" search={{ produto: "pacote" }} className="mt-6 inline-block text-sm font-medium text-primary">
          Ver como o cliente paga
        </Link>
      </main>
      <SiteFooter />
    </div>
    </OwnerGate>
  );
}
