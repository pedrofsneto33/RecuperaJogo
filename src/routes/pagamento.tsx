import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Shield } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { EMPRESA, isOwnerEmail, waLink } from "@/lib/empresa";
import { activateAccess, activateKitRh, getMyAccess, type Access } from "@/lib/server/access";
import { criarCobrancaPix, type CobrancaPix } from "@/lib/server/openpix";
import { getPixPublico } from "@/lib/server/pix-settings";
import { fmtBRL, MAX_PETICOES, PRECO_REAIS, PRECO_RH_REAIS } from "@/lib/legal/constantes";
import { MP_SAQUE_ATE } from "@/lib/legal/mp1394";
import { PixQr } from "@/components/pix-qr";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/pagamento")({
  validateSearch: (s: Record<string, unknown>) => ({
    produto: s.produto === "rh" ? ("rh" as const) : ("pacote" as const),
  }),
  component: Pagamento,
});

function Pagamento() {
  const { produto } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [access, setAccess] = useState<Access | null>(null);
  const [cob, setCob] = useState<CobrancaPix | null>(null);
  const [semChave, setSemChave] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    getMyAccess()
      .then(setAccess)
      .catch(() => setErr("Não foi possível ler seu acesso."));
    getPixPublico()
      .then((p) => {
        if (!p.configurado) setSemChave(true);
        else {
          criarCobrancaPix({ data: { produto } })
            .then(setCob)
            .catch((e) => setErr(e instanceof Error ? e.message : "Falha ao gerar PIX"));
        }
      })
      .catch(() => setSemChave(true));
  }, [user, produto]);

  useEffect(() => {
    if (!user) return;
    const pronto = produto === "rh" ? access?.kitRh : access?.status === "active";
    if (pronto) return;
    const id = window.setInterval(() => {
      getMyAccess()
        .then((a) => {
          setAccess(a);
          if (produto === "rh" ? a.kitRh : a.status === "active") navigate({ to: "/gerador" });
        })
        .catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(id);
  }, [user, access?.status, access?.kitRh, produto, navigate]);

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="animate-spin text-primary" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const jaLiberado = produto === "rh" ? Boolean(access?.kitRh) : access?.status === "active";

  if (jaLiberado) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-4">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
          <CheckCircle2 className="mx-auto text-ok" size={40} />
          <h1 className="mt-4 font-display text-2xl">{produto === "rh" ? "Kit RH ativo" : "Pacote ativo"}</h1>
          <p className="mt-2 text-sm text-muted">
            {produto === "rh"
              ? "Política, termo e encaminhamento no gerador."
              : `${access?.remaining} de ${MAX_PETICOES} rascunhos + Escudo incluso.`}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/gerador"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 font-semibold text-primary-fg no-underline"
            >
              Ir ao gerador
            </Link>
            <Link to="/escudo" className="text-sm font-medium text-primary">
              Abrir Escudo (incluso)
            </Link>
          </div>
        </div>
      </main>
    );
  }

  async function unlockDemo() {
    setBusy(true);
    setErr("");
    try {
      const next = produto === "rh" ? await activateKitRh() : await activateAccess();
      setAccess(next);
      navigate({ to: "/gerador" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha ao ativar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <Shield className="text-primary" />
          <h1 className="mt-4 font-display text-2xl font-semibold">
            {produto === "rh" ? "Kit RH para a empresa" : "Comprar a petição. Levar o Escudo."}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {produto === "rh" ? (
              <>
                <strong>{fmtBRL(PRECO_RH_REAIS)}</strong> · política + termo + encaminhamento. Não é parecer trabalhista.
              </>
            ) : (
              <>
                <strong>{fmtBRL(PRECO_REAIS)}</strong> único · {MAX_PETICOES} rascunhos + Escudo incluso.
                Saque nas casas que foram autorizadas: até {MP_SAQUE_ATE}. A petição é o que elas já devem.
              </>
            )}
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted">
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-ok" /> MP 1.394/2026 não apaga o CDC</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-ok" /> Ilegal: a peça não promete o decreto como restituição</li>
            <li className="flex gap-2"><CheckCircle2 size={16} className="text-ok" /> Pagou o PIX → a conta libera sozinha</li>
          </ul>

          {semChave ? (
            <div className="mt-6 space-y-3">
              <p className="rounded-lg border border-warn/30 bg-warn-bg p-3 text-sm text-warn">
                PIX da Primex ainda não está nesta instância. Nesta prévia o gerador libera para testar.
                No ar, cole a chave e o App ID OpenPix em Configurar.
              </p>
              {err && <p className="text-sm text-danger">{err}</p>}
              <button
                type="button"
                disabled={busy}
                onClick={unlockDemo}
                className="min-h-11 w-full rounded-md bg-primary font-semibold text-primary-fg disabled:opacity-60"
              >
                {busy ? "Ativando…" : "Ativar nesta prévia"}
              </button>
              <Link to="/configurar" className="block text-center text-sm font-medium text-primary">
                Colar chave PIX / OpenPix
              </Link>
            </div>
          ) : !cob ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium">Pague {fmtBRL(cob.valorReais)} via PIX</p>
              <p className="text-xs text-muted">
                Recebedor: {EMPRESA.pixTitular} · CNPJ {EMPRESA.cnpj}. Chave {cob.chaveMascarada}.
                {cob.autoConfirma
                  ? " Pagou → a conta abre sozinha. Não feche esta tela."
                  : " Depois do PIX, o Painel da Primex libera — ou avise no WhatsApp."}
              </p>
              <PixQr payload={cob.brCode} />
              {cob.autoConfirma && (
                <p className="flex items-center justify-center gap-2 text-sm text-muted">
                  <Loader2 size={14} className="animate-spin" /> Esperando o banco confirmar…
                </p>
              )}
              {!cob.autoConfirma && (
                <a
                  href={waLink(`Paguei o PIX RecuperaJogo. TXID ${cob.txid}. Valor ${fmtBRL(cob.valorReais)}.`)}
                  className="block text-center text-sm font-medium text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Avisar no WhatsApp que paguei
                </a>
              )}
              {isOwnerEmail(user.primaryEmail) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={unlockDemo}
                  className="min-h-11 w-full rounded-md border border-border font-medium disabled:opacity-60"
                >
                  {busy ? "Ativando…" : "Sou a Primex — testar o gerador"}
                </button>
              )}
              {err && <p className="text-sm text-danger">{err}</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
