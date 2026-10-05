import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Printer, Sparkles } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { consumePetition, getMinuta, getMyAccess, getMyMinutas, type Access, type MinutaResumo } from "@/lib/server/access";
import { organizarRelato, type AiResultado } from "@/lib/server/ai-peticao";
import { filtrarPorPerfil, type Perfil } from "@/lib/legal/argumentos";
import { montarPeticao } from "@/lib/legal/gerar-peticao";
import { montarNotificacao } from "@/lib/legal/gerar-notificacao";
import { montarKitRh } from "@/lib/legal/gerar-kit-rh";
import { assinarMinuta } from "@/lib/legal/hash-minuta";
import { provasDoCaso, PROVAS_VAZIAS, statusProvas, type ProvasMarcadas } from "@/lib/legal/provas";
import { LIMITE_JUS_POSTULANDI, LIMITE_COMPETENCIA_JEC, UFS, faixaValorCausa, fmtBRL, PRECO_RH_REAIS } from "@/lib/legal/constantes";
import { VARIAVEIS_UI, VARIAVEIS_VAZIAS, type VariaveisFato } from "@/lib/legal/variaveis";
import { OPERADORAS_COMUNS } from "@/lib/legal/operadoras";
import { comarcasDaUf } from "@/lib/legal/comarcas";
import { SiteHeader } from "@/components/site-header";
import { DisclaimerBar } from "@/components/disclaimer-bar";

export const Route = createFileRoute("/gerador")({ component: Gerador });

type DocTipo = "peticao" | "notificacao" | "rh";
type Tab = "tipo" | "perfil" | "provas" | "fatos" | "valores" | "partes" | "rh" | "rascunho";

function Gerador() {
  const { user, isPending } = useCurrentUserState();
  const [access, setAccess] = useState<Access | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [tab, setTab] = useState<Tab>("tipo");
  const [docTipo, setDocTipo] = useState<DocTipo>("peticao");
  const [perfil, setPerfil] = useState<Perfil>("autoexclusao");
  const [temLaudo, setTemLaudo] = useState(false);
  const [variaveis, setVariaveis] = useState<VariaveisFato>(VARIAVEIS_VAZIAS);
  const [relato, setRelato] = useState("");
  const [dataFato, setDataFato] = useState("");
  const [valor, setValor] = useState("");
  const [dobro, setDobro] = useState(false);
  const [danoMoral, setDanoMoral] = useState(false);
  const [ack, setAck] = useState(false);
  const [ids, setIds] = useState<string[]>([]);
  const [autor, setAutor] = useState({ nome: "", cpf: "", endereco: "", comarca: "São Paulo", uf: "SP" });
  const [reu, setReu] = useState({ nome: "", cnpj: "" });
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [ai, setAi] = useState<AiResultado | null>(null);
  const [comarcaLivre, setComarcaLivre] = useState(false);
  const [provas, setProvas] = useState<ProvasMarcadas>(PROVAS_VAZIAS);
  const [rh, setRh] = useState({ empresa: "", cnpj: "", cidade: "Teresina", uf: "PI", responsavel: "" });
  const [selo, setSelo] = useState("");
  const [minutas, setMinutas] = useState<MinutaResumo[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = window.localStorage.getItem("rj_caso");
    if (c === "tigrinho") {
      setVariaveis((v) => ({ ...v, tigrinho: true }));
      setPerfil("autoexclusao");
    } else if (c === "saque" || c === "mp_saldo") {
      setVariaveis((v) => ({ ...v, recusaSaque: true }));
    } else if (c === "ilegal") {
      setVariaveis((v) => ({ ...v, casaIrregular: true }));
    } else if (c === "ludopatia") {
      setPerfil("ludopatia");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    getMyAccess()
      .then(setAccess)
      .catch((e) => setLoadErr(e instanceof Error ? e.message : "Erro de acesso"));
    getMyMinutas()
      .then(setMinutas)
      .catch(() => undefined);
  }, [user]);

  const disponiveis = useMemo(
    () => filtrarPorPerfil(perfil, temLaudo, variaveis).filter((a) => {
      if (a.id === "cobranca_indevida_art42" && !dobro) return false;
      if (a.id === "dano_moral_cauteloso" && !danoMoral) return false;
      return true;
    }),
    [perfil, temLaudo, variaveis, dobro, danoMoral],
  );

  useEffect(() => {
    setIds(disponiveis.map((a) => a.id));
  }, [disponiveis]);

  const valorN = Number(valor) || 0;
  const faixa = faixaValorCausa(valorN);
  const itensProva = useMemo(() => provasDoCaso(perfil, temLaudo, variaveis), [perfil, temLaudo, variaveis]);
  const provaStatus = useMemo(() => statusProvas(itensProva, provas), [itensProva, provas]);

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="animate-spin text-primary" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!access && !loadErr) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg">
        <Loader2 className="animate-spin text-primary" />
      </main>
    );
  }
  if (access && access.status !== "active" && !access.kitRh) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="font-display text-2xl">Libere o gerador para continuar</h1>
          <p className="mt-2 text-sm text-muted">
            {access.status === "pix_pending"
              ? "PIX informado. O acesso ainda não está ativo."
              : "Sua conta está pendente de ativação."}
          </p>
          <Link
            to="/pagamento"
            search={{ produto: "pacote" }}
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-fg no-underline"
          >
            Ir ao pagamento
          </Link>
        </main>
      </div>
    );
  }

  async function gerar() {
    if (docTipo !== "rh" && access && access.status !== "active") return;
    if (docTipo === "rh" && !access?.kitRh) return;
    if (docTipo !== "rh" && !ack) return;
    if (docTipo !== "rh" && access && access.remaining <= 0) return;
    if (docTipo !== "rh" && !provaStatus.ok) {
      setLoadErr(`Faltam ${provaStatus.faltando.length} prova(s) obrigatória(s). Marque só o que você tem.`);
      setTab("provas");
      return;
    }
    setBusy(true);
    setLoadErr("");
    try {
      const dados = {
        perfil,
        temLaudo,
        autor,
        reu,
        relato,
        dataFato,
        argumentosIds: ids,
        dobro,
        danoMoral,
        valorBase: valorN,
        jurosMeses: 0,
        variaveis,
      };
      let t =
        docTipo === "notificacao"
          ? montarNotificacao(dados)
          : docTipo === "rh"
            ? montarKitRh({
                empresa: rh.empresa,
                cnpj: rh.cnpj,
                cidade: rh.cidade,
                uf: rh.uf,
                responsavel: rh.responsavel,
                pecas: ["politica", "termo", "encaminhamento"],
              })
            : montarPeticao(dados);
      const firma = await assinarMinuta(t, user?.primaryEmail ?? "");
      t += firma.rodape;
      setTexto(t);
      setSelo(firma.hash);
      const next = await consumePetition({
        data: { perfil: docTipo === "rh" ? "rh" : perfil, hash: firma.hash, tipo: docTipo, corpo: t },
      });
      setAccess(next);
      setTab("rascunho");
      getMyMinutas().then(setMinutas).catch(() => undefined);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "Falha ao gerar");
    } finally {
      setBusy(false);
    }
  }

  async function pedirIa() {
    setAiBusy(true);
    setLoadErr("");
    try {
      const res = await organizarRelato({
        data: { relato, perfil, temLaudo, variaveis },
      });
      if (!res.ok) {
        setLoadErr(res.error);
        return;
      }
      setAi(res);
      setRelato(res.relato);
      if (res.argumentosRecomendados.length) {
        setIds(res.argumentosRecomendados.filter((id) => disponiveis.some((a) => a.id === id)));
      }
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "IA falhou");
    } finally {
      setAiBusy(false);
    }
  }

  const tabs: { id: Tab; label: string }[] =
    docTipo === "rh"
      ? [
          { id: "tipo", label: "1. Tipo" },
          { id: "rh", label: "2. Empresa" },
          { id: "rascunho", label: "3. Kit" },
        ]
      : [
          { id: "tipo", label: "1. Tipo" },
          { id: "perfil", label: "2. Caso" },
          { id: "provas", label: "3. Provas" },
          { id: "fatos", label: "4. Fatos" },
          { id: "valores", label: "5. Valores" },
          { id: "partes", label: "6. Partes" },
          { id: "rascunho", label: "7. Rascunho" },
        ];

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between text-xs text-muted">
          <span>Rascunhos restantes: {access?.remaining ?? "—"}{access?.kitRh ? " · Kit RH liberado" : ""}</span>
        </div>
        <DisclaimerBar />
        {loadErr && <p className="mt-3 text-sm text-danger">{loadErr}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${tab === t.id ? "bg-primary text-primary-fg" : "border border-border bg-surface"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          {tab === "tipo" && (
            <div className="space-y-3">
              <h2 className="font-display text-xl">O que você vai gerar?</h2>
              {(
                [
                  ["peticao", "Petição no Juizado", "Peça completa. Consome 1 dos 3 rascunhos."],
                  ["notificacao", "Notificação extrajudicial", "Carta CDC antes da ação. Também consome 1 rascunho."],
                  ["rh", "Kit RH (empresas)", `Política + termo + encaminhamento. PIX ${fmtBRL(PRECO_RH_REAIS)}.`],
                ] as const
              ).map(([id, t, d]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setDocTipo(id);
                    if (id === "rh") {
                      if (!access?.kitRh) return;
                      setTab("rh");
                    } else {
                      if (access?.status !== "active") return;
                      setTab("perfil");
                    }
                  }}
                  className={`block w-full rounded-xl border p-4 text-left ${
                    docTipo === id ? "border-primary" : "border-border"
                  }`}
                >
                  <p className="font-medium">{t}</p>
                  <p className="mt-1 text-xs text-muted">{d}</p>
                  {id === "rh" && !access?.kitRh && (
                    <Link to="/rh" className="mt-2 inline-block text-sm font-medium text-primary">
                      Liberar Kit RH
                    </Link>
                  )}
                  {id !== "rh" && access?.status !== "active" && (
                    <Link to="/pagamento" search={{ produto: "pacote" }} className="mt-2 inline-block text-sm font-medium text-primary">
                      Liberar pacote
                    </Link>
                  )}
                </button>
              ))}
            </div>
          )}

          {tab === "provas" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Checklist de provas</h2>
              <p className="text-sm text-muted">
                {provaStatus.feitas} de {provaStatus.total} obrigatórias.
                {provaStatus.faltando.length
                  ? ` Faltam ${provaStatus.faltando.length}. Sem elas o pedido correspondente não sai.`
                  : " Pode seguir."}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${provaStatus.total ? (100 * provaStatus.feitas) / provaStatus.total : 0}%` }}
                />
              </div>
              {itensProva.map((p) => (
                <label key={p.id} className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={provas[p.id]}
                    onChange={(e) => setProvas((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                  />
                  <span>
                    <span className="font-medium">{p.label}</span>
                    {p.obrigatoria ? <span className="text-danger"> · obrigatória</span> : <span className="text-muted"> · opcional</span>}
                    <span className="mt-0.5 block text-xs text-muted">{p.detalhe}</span>
                  </span>
                </label>
              ))}
              <button
                type="button"
                disabled={!provaStatus.ok}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg disabled:opacity-40"
                onClick={() => setTab("fatos")}
              >
                Continuar
              </button>
            </div>
          )}

          {tab === "rh" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Dados da empresa</h2>
              {!access?.kitRh ? (
                <p className="text-sm">
                  Kit RH não está neste acesso.{" "}
                  <Link to="/rh" className="font-medium text-primary">Comprar {fmtBRL(PRECO_RH_REAIS)}</Link>
                </p>
              ) : (
                <>
                  <Field label="Razão social" value={rh.empresa} onChange={(v) => setRh({ ...rh, empresa: v })} />
                  <Field label="CNPJ" value={rh.cnpj} onChange={(v) => setRh({ ...rh, cnpj: v })} />
                  <Field label="Cidade" value={rh.cidade} onChange={(v) => setRh({ ...rh, cidade: v })} />
                  <Field label="UF" value={rh.uf} onChange={(v) => setRh({ ...rh, uf: v })} />
                  <Field label="Responsável de RH" value={rh.responsavel} onChange={(v) => setRh({ ...rh, responsavel: v })} />
                  <p className="text-xs text-muted">
                    Modelo interno. Não é parecer trabalhista nem laudo. Lei 14.790 regula a casa de apostas, não o contrato de emprego.
                  </p>
                  <button
                    type="button"
                    disabled={busy || rh.empresa.trim().length < 3}
                    onClick={gerar}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg disabled:opacity-40"
                  >
                    {busy ? "Gerando…" : "Gerar Kit RH"}
                  </button>
                </>
              )}
            </div>
          )}

          {tab === "perfil" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Qual é o seu caso?</h2>
              <label className={`block rounded-xl border p-4 ${perfil === "autoexclusao" ? "border-primary" : "border-border"}`}>
                <input type="radio" className="mr-2" checked={perfil === "autoexclusao"} onChange={() => setPerfil("autoexclusao")} />
                Autoexclusão / bloqueio ignorado
                <p className="mt-1 text-xs text-muted">Precisa de print com data do bloqueio e do depósito posterior.</p>
              </label>
              <label className={`block rounded-xl border p-4 ${perfil === "ludopatia" ? "border-primary" : "border-border"}`}>
                <input type="radio" className="mr-2" checked={perfil === "ludopatia"} onChange={() => setPerfil("ludopatia")} />
                Ludopatia (só com laudo)
                <p className="mt-1 text-xs text-muted">Art. 26, VI exige laudo. Sem laudo o pedido de nulidade não entra.</p>
              </label>
              {perfil === "ludopatia" && (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" checked={temLaudo} onChange={(e) => setTemLaudo(e.target.checked)} className="mt-1" />
                  Tenho laudo de profissional de saúde mental habilitado (CID de jogo patológico). Sem isso, não marque.
                </label>
              )}
              <h3 className="pt-2 font-display text-lg">Variáveis do caso (CDC, LGPD e outras)</h3>
              <p className="text-xs text-muted">Marque só o que você prova. Cada marca liga um bloco de lei diferente — e desliga o que não cabe.</p>
              <div className="space-y-2">
                {VARIAVEIS_UI.map((item) => (
                  <label key={item.id} className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={variaveis[item.id]}
                      onChange={(e) => setVariaveis((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                    />
                    <span>
                      <span className="font-medium">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted">{item.risco}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg" onClick={() => setTab("provas")}>
                Continuar
              </button>
            </div>
          )}

          {tab === "fatos" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Fatos (só o que você prova)</h2>
              <label className="block text-sm">
                Data do depósito/aposta indevida
                <input type="date" value={dataFato} onChange={(e) => setDataFato(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2" />
              </label>
              <label className="block text-sm">
                Relato cronológico
                <textarea
                  rows={8}
                  value={relato}
                  onChange={(e) => setRelato(e.target.value)}
                  placeholder="Em [data] pedi autoexclusão. Em [data] a casa aceitou depósito de R$…"
                  className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
                />
              </label>
              <button
                type="button"
                disabled={aiBusy || relato.trim().length < 40}
                onClick={pedirIa}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-40"
              >
                {aiBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Organizar relato com IA (não inventa fato nem acórdão)
              </button>
              <p className="text-xs text-muted">
                A IA só vê o relato e as marcas — sem CPF, nome ou endereço. Ela reorganiza e avisa prova faltando. Os artigos da peça continuam sendo os do software, não texto solto do modelo.
              </p>
              {ai && (
                <div className="space-y-2 rounded-lg border border-border bg-bg p-4 text-sm">
                  {ai.alertas.length > 0 && (
                    <div>
                      <p className="font-medium">Alertas</p>
                      <ul className="list-disc pl-5 text-muted">
                        {ai.alertas.map((a) => <li key={a}>{a}</li>)}
                      </ul>
                    </div>
                  )}
                  {ai.provasMinimas.length > 0 && (
                    <div>
                      <p className="font-medium">Provas mínimas</p>
                      <ul className="list-disc pl-5 text-muted">
                        {ai.provasMinimas.map((a) => <li key={a}>{a}</li>)}
                      </ul>
                    </div>
                  )}
                  {ai.argumentosEvitar.length > 0 && (
                    <div>
                      <p className="font-medium">Não use</p>
                      <ul className="list-disc pl-5 text-danger">
                        {ai.argumentosEvitar.map((a) => <li key={a.id}>{a.id}: {a.motivo}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="mb-2 text-sm font-medium">Argumentos (desmarque o que não tem prova)</p>
                {disponiveis.map((a) => (
                  <label key={a.id} className="mb-2 flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={ids.includes(a.id)}
                      onChange={() =>
                        setIds((prev) => (prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id]))
                      }
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{a.label}</span>
                      <span className="block text-xs text-muted">{a.risco}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg" onClick={() => setTab("valores")}>
                Continuar
              </button>
            </div>
          )}

          {tab === "valores" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Valores</h2>
              <label className="block text-sm">
                Valor a restituir (R$)
                <input type="number" min={0} value={valor} onChange={(e) => setValor(e.target.value)} className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2" />
              </label>
              <p className="text-xs text-muted">
                A peça NÃO pede juros de 1% ao mês — isso mudou com a Lei 14.905/2024. O pedido é “juros e correção na forma da lei civil vigente”.
              </p>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={dobro} onChange={(e) => setDobro(e.target.checked)} className="mt-1" />
                Houve cobrança/débito após o bloqueio (art. 42 CDC). Não marque só porque perdeu a aposta.
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={danoMoral} onChange={(e) => setDanoMoral(e.target.checked)} className="mt-1" />
                Pedir dano moral a arbitrar (sem valor inflado)
              </label>
              <p className="text-sm">Valor da causa (material): {fmtBRL(valorN)}</p>
              {faixa === "advogado_jec" && (
                <p className="text-sm text-danger">
                  Acima de {fmtBRL(LIMITE_JUS_POSTULANDI)} (20 SM). Ainda é JEC até {fmtBRL(LIMITE_COMPETENCIA_JEC)} (40 SM), mas você precisa de advogado — art. 9º ≠ art. 3º da Lei 9.099/95.
                </p>
              )}
              {faixa === "justica_comum" && (
                <p className="text-sm text-danger">
                  Acima de {fmtBRL(LIMITE_COMPETENCIA_JEC)} (40 SM). Isso não é Juizado. Não protocolar este rascunho como JEC.
                </p>
              )}
              <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg" onClick={() => setTab("partes")}>
                Continuar
              </button>
            </div>
          )}

          {tab === "partes" && (
            <div className="space-y-4">
              <h2 className="font-display text-xl">Quem propõe e contra quem</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Seu nome completo" value={autor.nome} onChange={(v) => setAutor({ ...autor, nome: v })} />
                <Field label="CPF" value={autor.cpf} onChange={(v) => setAutor({ ...autor, cpf: v })} />
                <Field label="Endereço" value={autor.endereco} onChange={(v) => setAutor({ ...autor, endereco: v })} full />
                <label className="text-sm">
                  UF
                  <select
                    value={autor.uf}
                    onChange={(e) => {
                      const uf = e.target.value;
                      const lista = comarcasDaUf(uf);
                      setComarcaLivre(false);
                      setAutor({ ...autor, uf, comarca: lista[0] ?? "" });
                    }}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
                  >
                    {UFS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Comarca (Juizado Especial Cível)
                  <select
                    value={comarcaLivre ? "outra" : autor.comarca}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "outra") {
                        setComarcaLivre(true);
                        setAutor({ ...autor, comarca: "" });
                      } else {
                        setComarcaLivre(false);
                        setAutor({ ...autor, comarca: v });
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
                  >
                    {comarcasDaUf(autor.uf).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="outra">Outra comarca (escrever)</option>
                  </select>
                </label>
                {comarcaLivre && (
                  <Field label="Nome da comarca" value={autor.comarca} onChange={(v) => setAutor({ ...autor, comarca: v })} />
                )}
                <label className="text-sm">
                  Operadora (Ré)
                  <select
                    value={OPERADORAS_COMUNS.includes(reu.nome as (typeof OPERADORAS_COMUNS)[number]) ? reu.nome : reu.nome ? "Outra (escrever)" : ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "Outra (escrever)") setReu({ ...reu, nome: "" });
                      else setReu({ ...reu, nome: v });
                    }}
                    className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
                  >
                    <option value="">Selecionar</option>
                    {OPERADORAS_COMUNS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
                {(!OPERADORAS_COMUNS.includes(reu.nome as (typeof OPERADORAS_COMUNS)[number]) || reu.nome === "") && (
                  <Field label="Razão social / nome da casa" value={reu.nome} onChange={(v) => setReu({ ...reu, nome: v })} />
                )}
                <Field label="CNPJ da Ré (confira no contrato/app)" value={reu.cnpj} onChange={(v) => setReu({ ...reu, cnpj: v })} />
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-1" />
                Li os Termos. Sei que isto é rascunho, não advocacia, e que sou responsável pelos fatos e pelo protocolo.
              </label>
              <button
                type="button"
                disabled={!ack || busy || (access?.remaining ?? 0) <= 0}
                onClick={gerar}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg disabled:opacity-40"
              >
                {busy ? "Gerando…" : "Gerar rascunho"}
              </button>
            </div>
          )}

          {tab === "rascunho" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl">Rascunho</h2>
                {selo && <p className="font-mono text-xs text-muted">Hash {selo}</p>}
                <div className="flex gap-2">
                  {texto && (
                    <button
                      type="button"
                      className="no-print inline-flex min-h-11 items-center rounded-md border border-border px-3 text-sm"
                      onClick={async () => {
                        await navigator.clipboard.writeText(texto);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="no-print inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm"
                    onClick={() => window.print()}
                  >
                    <Printer size={16} /> Salvar PDF
                  </button>
                </div>
              </div>
              {minutas.length > 0 && (
                <div className="no-print mb-4 space-y-1">
                  <p className="text-xs text-muted">Minutas desta conta</p>
                  {minutas.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="block w-full rounded-md border border-border px-3 py-2 text-left text-xs"
                      onClick={async () => {
                        try {
                          const r = await getMinuta({ data: { id: m.id } });
                          setTexto(r.texto);
                          setSelo(r.hash ?? "");
                        } catch (e) {
                          setLoadErr(e instanceof Error ? e.message : "Não abriu");
                        }
                      }}
                    >
                      {m.docTipo} · {m.perfil} · {m.hash ?? "sem hash"}
                    </button>
                  ))}
                </div>
              )}
              {texto ? (
                <pre className="print-sheet whitespace-pre-wrap font-serif text-[15px] leading-relaxed">{texto}</pre>
              ) : (
                <p className="text-sm text-muted">Gere o rascunho na etapa Partes.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`text-sm ${full ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2"
      />
    </label>
  );
}
