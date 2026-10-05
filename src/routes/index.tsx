import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Ban, FileText, Shield } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PeticaoDemo } from "@/components/peticao-demo";
import { fmtBRL, PRECO_REAIS } from "@/lib/legal/constantes";
import { EMPRESA } from "@/lib/empresa";
import { MP_SAQUE_ATE, MP_SITES_FORA, MP_DEVOLUCAO, MP_PUBLICACAO } from "@/lib/legal/mp1394";

export const Route = createFileRoute("/")({ component: Home });

const CASOS = [
  {
    id: "autoexclusao",
    k: "01",
    titulo: "Pedi para parar. A casa ignorou.",
    texto: "Autoexclusão na casa ou no gov.br. Depois ainda aceitaram depósito.",
  },
  {
    id: "saque",
    k: "02",
    titulo: "Saque travado.",
    texto: "Saldo meu. Recusaram. A Portaria 615 manda ir para a conta cadastrada.",
  },
  {
    id: "tigrinho",
    k: "03",
    titulo: "Jogo on-line no app.",
    texto: "Caça-níquel, sessão rápida. A peça cita aviso de perda e RTP — sem tigre, sem crime.",
  },
  {
    id: "ludopatia",
    k: "04",
    titulo: "Tenho laudo.",
    texto: "Só com laudo o art. 26 entra. Sem laudo o software trava esse pedido.",
  },
  {
    id: "ilegal",
    k: "05",
    titulo: "A casa era ilegal / sem .bet.br.",
    texto: "A luta continua. A peça não diz que o decreto da União devolve o dinheiro — porque não devolve.",
  },
  {
    id: "mp_saldo",
    k: "06",
    titulo: "Ainda tenho saldo na casa autorizada.",
    texto: `Primeiro saque até ${MP_SAQUE_ATE}. A petição é o que eles já recusaram antes.`,
  },
] as const;

function Home() {
  const navigate = useNavigate();
  const [lado, setLado] = useState<"casa" | "voce" | null>(null);
  const [caso, setCaso] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const casosRef = useRef<HTMLElement | null>(null);

  function irComCaso(id: string) {
    setCaso(id);
    if (typeof window !== "undefined") window.localStorage.setItem("rj_caso", id);
    navigate({ to: "/login" });
  }

  function escolher(v: "casa" | "voce") {
    setLado(v);
    if (v === "voce") {
      window.setTimeout(() => casosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }

  return (
    <div className="campaign min-h-screen bg-bg text-fg">
      <SiteHeader />
      <main>
        <section className="relative min-h-[88vh] overflow-hidden">
          <video
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/campaign/hero.jpg"
            aria-hidden
          >
            <source src="/campaign/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/25" />
          <div className="relative mx-auto flex min-h-[88vh] max-w-5xl flex-col justify-end px-4 pb-12 pt-24">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-warn">
              MP 1.394 · {MP_PUBLICACAO} · Primex Sistemas
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
              A MP parou a aposta nova. O prejuízo de ontem não.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Toque no lado. O site monta o rascunho. PIX no CNPJ da Primex libera petição + Escudo.
            </p>
            <Prazo />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#lado" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-fg px-5 font-semibold text-bg no-underline">
                De que lado você está <ArrowRight size={16} />
              </a>
              <Link to="/exemplo" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-border px-5 font-medium no-underline">
                Ver petição (tarjada)
              </Link>
            </div>
          </div>
        </section>

        <section id="lado" className="mx-auto max-w-5xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Um toque. O resto segue.</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">De que lado você está?</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => escolher("casa")}
            className={`min-h-40 rounded-2xl border p-6 text-left transition-colors ${
              lado === "casa" ? "border-danger bg-surface" : "border-border bg-surface/60 hover:border-fg/40"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Lado A</p>
            <p className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">A casa — ou o site ilegal — continua no bolso.</p>
            <p className="mt-2 text-sm text-muted">A MP não apaga o que já foi. Ilegal não some porque o governo anunciou.</p>
          </button>
          <button
            type="button"
            onClick={() => escolher("voce")}
            className={`min-h-40 rounded-2xl border p-6 text-left transition-colors ${
              lado === "voce" ? "border-fg bg-fg text-bg" : "border-border bg-surface hover:border-fg/40"
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${lado === "voce" ? "text-bg/60" : "text-muted"}`}>
              Lado B
            </p>
            <p className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">Eu bloqueio e protocolo.</p>
            <p className={`mt-2 text-sm ${lado === "voce" ? "text-bg/70" : "text-muted"}`}>
              Escudo no aparelho. Minuta no Juizado. Sem advogado no meio, se o valor couber.
            </p>
          </button>
          </div>
        </section>

        {lado === "casa" && (
          <p className="mx-auto mt-6 max-w-5xl px-4 text-sm text-muted">
            Então o ciclo segue. Se mudar de ideia, toque no lado B — ou abra o{" "}
            <Link to="/escudo" className="font-medium text-fg">Escudo</Link> agora.
          </p>
        )}

        <section className="mx-auto max-w-5xl px-4 pb-6">
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Toque no que aconteceu", "O texto da peça muda. Não é PDF genérico."],
              ["2", `PIX ${fmtBRL(PRECO_REAIS)} no CNPJ Primex`, "Petição + notificação + Escudo. Um pacote."],
              ["3", "Checklist, selo e protocolo", "Sem prova obrigatória, o pedido não sai. Hash no rodapé."],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-2xl border border-border bg-surface p-5">
                <p className="font-mono text-xs text-muted">{n}</p>
                <p className="mt-2 font-display text-xl font-extrabold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Vitrine</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">A petição de verdade. O ouro, tarjado.</h2>
          <p className="mt-3 max-w-xl text-muted">
            Toque nas barras pretas. Troque o tipo de caso. Copiar daqui não cola peça — cola aviso da Primex.
          </p>
          <div className="paper-island mt-8 rounded-2xl border border-border p-4 sm:p-6">
            <PeticaoDemo compact />
          </div>
        </section>

        <section className="mx-auto mt-4 max-w-5xl px-4">
          <img
            src="/campaign/split.jpg"
            alt="Esquerda: casa que foi autorizada e ainda devolve saldo. Direita: site ilegal bloqueado."
            className="w-full rounded-2xl border border-border object-cover"
            crossOrigin="anonymous"
          />
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-muted">Cronograma oficial</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">Não confunda saque da MP com processo.</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["25/09", "MP publicada. Novos depósitos vedados."],
              ["Até 5/10 23h59", "Retirada voluntária do saldo nas casas que foram autorizadas."],
              ["6/10", `Sites e apps autorizados saem do ar (${MP_SITES_FORA}).`],
              ["9 a 14/10", `Bancos devolvem saldo residual (${MP_DEVOLUCAO}).`],
            ].map(([k, v]) => (
              <li key={k} className="rounded-2xl border border-border bg-surface p-5">
                <p className="font-mono text-xs text-muted">{k}</p>
                <p className="mt-2 font-medium">{v}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Autorizada (.bet.br)</p>
              <p className="mt-2 font-display text-xl font-extrabold">Ainda dá para recuperar o que ela deve.</p>
              <p className="mt-2 text-sm text-muted">CDC + SPA. Saque pelo prazo. Petição para autoexclusão ignorada, saque recusado antes, laudo.</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Ilegal</p>
              <p className="mt-2 font-display text-xl font-extrabold">A luta continua. Sem milagre.</p>
              <p className="mt-2 text-sm text-muted">O Decreto 13.033/2026 bloqueia caixa da clandestina para fundo público — não é PIX de volta para você. Escudo + peça honesta.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-5xl items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Dê o block</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Não precisa de um tigre. Precisa de um carimbo.
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Toque no app. O giro para. Isso é o Escudo. Depois, se a casa ignorou o seu “para”,
              a petição é o segundo golpe — com artigo da SPA, não com grito.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/escudo"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-fg px-5 font-semibold text-bg no-underline"
              >
                Abrir Escudo <Ban size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-border px-5 font-medium no-underline"
              >
                Protocolar {fmtBRL(PRECO_REAIS)}
              </Link>
            </div>
          </div>
          <PhoneBlock blocked={blocked} onBlock={() => setBlocked(true)} />
        </section>

        <section className="mt-20 border-y border-border bg-surface">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-3">
            <Stat n={625} sufixo=" bi" label="saíram das famílias para as bets em 2025 (Estadão)." prefix="R$ " />
            <Stat n={86} sufixo="%" label="veem as bets como nocivas — a sociedade já escolheu o lado." />
            <Stat n={20} sufixo=" SM" label="teto para protocolar sozinho no Juizado. Acima disso, advogado." />
          </div>
        </section>

        <section ref={casosRef} className="mx-auto max-w-5xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Toque no que aconteceu</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            O texto da peça muda com o fato.
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {CASOS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => irComCaso(c.id)}
                className={`rounded-2xl border p-6 text-left transition-colors ${
                  caso === c.id ? "border-fg bg-fg text-bg" : "border-border bg-surface hover:border-fg/40"
                }`}
              >
                <p className={`font-mono text-xs ${caso === c.id ? "text-bg/50" : "text-muted"}`}>{c.k}</p>
                <p className="mt-2 font-display text-2xl font-extrabold">{c.titulo}</p>
                <p className={`mt-2 text-sm leading-relaxed ${caso === c.id ? "text-bg/70" : "text-muted"}`}>{c.texto}</p>
                <p className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${caso === c.id ? "text-bg" : "text-fg"}`}>
                  Usar este caso <ArrowRight size={14} />
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 lg:grid-cols-2">
            <img
              src="/campaign/kit.jpg"
              alt="Petição em papel e celular com cadeado Escudo — o pacote de R$ 137."
              className="w-full rounded-2xl border border-border object-cover"
              crossOrigin="anonymous"
            />
            <div>
            <h2 className="font-display text-3xl font-extrabold">Um PIX. Os dois.</h2>
            <p className="mt-3 text-muted">
              {fmtBRL(PRECO_REAIS)} no CNPJ da {EMPRESA.nomeFantasia}. Três rascunhos (petição ou notificação) + Escudo.
              Kit RH é outro PIX.
            </p>
            <div className="mt-6 grid gap-3">
              <Link to="/login" className="rounded-2xl border border-fg bg-fg p-5 no-underline">
                <FileText className="text-bg" size={18} />
                <p className="mt-2 font-display text-xl font-extrabold text-bg">Petição no Juizado</p>
                <p className="mt-1 text-sm text-bg/70">Artigo que cabe. Notificação antes, se quiser. Hash no rodapé.</p>
              </Link>
              <Link to="/rh" className="rounded-2xl border border-border bg-surface p-5 no-underline">
                <Shield className="text-fg" size={18} />
                <p className="mt-2 font-display text-xl font-extrabold">Kit RH · empresas</p>
                <p className="mt-1 text-sm text-muted">Política + termo + CAPS. Ticket separado.</p>
              </Link>
            </div>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">
              RecuperaJogo é software da {EMPRESA.razao} (CNPJ {EMPRESA.cnpj}). Não é sociedade de
              advogados. Você é o autor da peça. {EMPRESA.email} · {EMPRESA.telefone}.
            </p>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Antes de pagar</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold">Perguntas diretas</h2>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Isso é advocacia?", "Não. É software da Primex Sistemas. Você revisa, assina e protocola em nome próprio no Juizado (jus postulandi, até 20 salários mínimos)."],
                ["O que entra nos R$ 137?", "Três rascunhos (petição ou notificação) + Escudo (lista/hosts). Kit RH é outro PIX, R$ 497."],
                ["E se a casa era ilegal?", "A peça não promete que o decreto da União devolve o dinheiro. A luta continua com CDC e fatos que você prova."],
                ["Como libero a conta?", "PIX no CNPJ da Primex. Com OpenPix, abre sozinha. Sem isso, o Painel libera ou o WhatsApp avisa."],
              ].map(([q, a]) => (
                <div key={q} className="rounded-2xl border border-border bg-surface p-5">
                  <dt className="font-display text-lg font-extrabold">{q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Prazo() {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    const alvo = Date.parse("2026-10-05T23:59:00-03:00");
    const tick = () => {
      const d = alvo - Date.now();
      if (d <= 0) {
        setTxt("Prazo voluntário encerrado — siga a devolução bancária.");
        return;
      }
      const dias = Math.floor(d / 86400000);
      const h = Math.floor((d % 86400000) / 3600000);
      setTxt(`${dias}d ${h}h para sacar o saldo na casa autorizada`);
    };
    tick();
    const id = window.setInterval(tick, 60000);
    return () => window.clearInterval(id);
  }, []);
  if (!txt) return null;
  return <p className="mt-6 font-mono text-sm text-warn">{txt}</p>;
}

function PhoneBlock({ blocked, onBlock }: { blocked: boolean; onBlock: () => void }) {
  return (
    <button
      type="button"
      onClick={onBlock}
      className="relative mx-auto w-full max-w-xs overflow-hidden rounded-[2rem] border border-border bg-surface p-3 text-left"
      aria-label={blocked ? "App bloqueado" : "Toque para dar o block"}
    >
      <div className="rounded-[1.4rem] border border-border bg-bg p-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted">
          <span>app de aposta</span>
          <span>rec</span>
        </div>
        <div className="mt-6 h-28 overflow-hidden rounded-lg border border-border">
          <div className={`flex flex-col gap-2 p-3 ${blocked ? "" : "reel-spin"}`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex justify-between text-sm font-semibold tabular-nums text-muted">
                <span>giro {i + 1}</span>
                <span>— — —</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 h-11 rounded-lg bg-fg/10 text-center text-sm font-semibold leading-[44px] text-muted">
          {blocked ? "bloqueado" : "girar de novo"}
        </div>
      </div>
      {blocked && (
        <div className="stamp-slam pointer-events-none absolute inset-0 grid place-items-center">
          <span className="rotate-[-8deg] rounded-md border-4 border-danger px-5 py-2 font-display text-4xl font-extrabold tracking-tight text-danger">
            BLOCK
          </span>
        </div>
      )}
      {!blocked && (
        <p className="mt-3 text-center text-xs text-muted">Toque para carimbar o block</p>
      )}
    </button>
  );
}

function Stat({ n, label, prefix = "", sufixo = "" }: { n: number; label: string; prefix?: string; sufixo?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done.current) return;
        done.current = true;
        const t0 = performance.now();
        const dur = 900;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          setV(Math.round(n * (1 - (1 - p) ** 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  return (
    <div ref={ref}>
      <p className="font-display text-3xl font-extrabold tabular-nums tracking-tight">
        {prefix}{v}{sufixo}
      </p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}
