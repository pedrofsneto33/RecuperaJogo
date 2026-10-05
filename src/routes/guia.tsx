import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DisclaimerBar } from "@/components/disclaimer-bar";
import { saveLead } from "@/lib/server/access";
import { LIMITE_JUS_POSTULANDI, LIMITE_COMPETENCIA_JEC, fmtBRL } from "@/lib/legal/constantes";

export const Route = createFileRoute("/guia")({ component: Guia });

function Guia() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveLead({ data: { email, origem: "guia" } });
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">Guia honesto — o que a lei realmente diz</h1>
        <div className="mt-6">
          <DisclaimerBar />
        </div>

        <section className="mt-10 space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-xl text-fg">1. Art. 26 da Lei 14.790/2023</h2>
          <p>
            O inciso VI impede apostas de pessoa diagnosticada com ludopatia <strong>por laudo</strong> de
            profissional de saúde mental habilitado. O inciso I impede menor de 18 anos. O §1º diz que
            apostas em desacordo são nulas de pleno direito. Sem laudo, o RecuperaJogo não inclui o
            pedido de nulidade do inciso VI. Sem prova de idade, não inclui o inciso I.
          </p>
          <h2 className="font-display text-xl text-fg">2. Autoexclusão e Portaria SPA/MF 1.231/2024</h2>
          <p>
            Vale para operador <strong>autorizado</strong>. Aceitar depósito depois do bloqueio é o melhor
            fato para o art. 14 do CDC — se a data estiver no print. Casa irregular/offshore: não
            finja que a Portaria cabe do mesmo jeito; a execução costuma ser o problema, não o texto.
          </p>
          <h2 className="font-display text-xl text-fg">2.1 O que a SPA/MF realmente publicou</h2>
          <p>
            Regulador: Secretaria de Prêmios e Apostas do Ministério da Fazenda. Art. 27 da Lei 14.790/2023
            garante CDC ao apostador. Portaria 1.231/2024, art. 3º (diligência, política fidedigna) e art. 4º, I
            (aviso de risco no cadastro e a cada acesso). Portaria 2.579/2025: autoexclusão específica na casa
            e centralizada no gov.br. Portaria 615/2024, art. 3º: saque só para a conta cadastrada.
            Portaria 2.104/2024, art. 8º: domínio .bet.br. Sem autorização, a peça não trata a casa como operador.
          </p>
          <h2 className="font-display text-xl text-fg">2.2 Tigrinho / cassino on-line</h2>
          <p>
            Jogo on-line de sessão rápida. A peça cita RTP (art. 2º, XX, da 1.231, redação da 2.579) e o aviso
            de perda — não chama o fato de crime (contravenção não devolve dinheiro). Em 2026 a 3ª Turma Cível
            do TJDFT confirmou restituição em caso de cassino/Tigrinho com laudo e bloqueio ignorado, com
            fundamento no art. 26, VI e §1º, da Lei 14.790 c/c art. 166, VII, do Código Civil, abatidos os
            prêmios resgatados. O RecuperaJogo usa esses artigos quando há prova; não cola número de processo.
          </p>
          <h2 className="font-display text-xl text-fg">3. CDC — o que cabe e o que é armadilha</h2>
          <p>
            Arts. 2º e 3º (relação de consumo), 4º e 6º (vulnerabilidade, informação, inversão do ônus),
            14 (defeito do serviço), 37 (publicidade), 39 (prática abusiva), 47 (interpretação mais
            favorável), 51 (cláusula abusiva). O art. 42, parágrafo único (dobro) vale para cobrança
            de dívida indevida, não para “perdi no jogo”. Usar dobro no pedido errado é o atalho que
            o advogado da casa ataca primeiro.
          </p>
          <h2 className="font-display text-xl text-fg">4. LGPD (Lei 13.709/2018)</h2>
          <p>
            Cadastro, histórico de depósito e perfil de risco são dados pessoais. Diagnóstico de
            ludopatia é dado sensível (art. 11). Marketing depois da autoexclusão, perfilamento para
            empurrar depósito e recusa em informar o que foi tratado (art. 18) geram responsabilidade
            (art. 42) — desde que você tenha o print. Não invente “venderam meus dados” sem indício.
          </p>
          <h2 className="font-display text-xl text-fg">5. Juros: não escreva 1% ao mês como lei</h2>
          <p>
            A Lei 14.905/2024 alterou o art. 406 do Código Civil. A peça pede juros e correção “na
            forma da lei civil vigente”. Colocar 1% a.m. como se ainda fosse a regra é presente para
            a contestação.
          </p>
          <h2 className="font-display text-xl text-fg">6. Dois tetos do Juizado (Lei 9.099/95)</h2>
          <p>
            Art. 9º — atuar <strong>sem advogado</strong>: 20 SM ({fmtBRL(LIMITE_JUS_POSTULANDI)} em 2026).
            Art. 3º, I — competência do JEC: 40 SM ({fmtBRL(LIMITE_COMPETENCIA_JEC)}). Entre 20 e 40 SM
            ainda é Juizado, mas com advogado ou Defensoria. Acima de 40 SM, Justiça Comum.
          </p>
          <h2 className="font-display text-xl text-fg">7. Se o problema for o vício, não o processo</h2>
          <p>
            CVV 188. Autoexclusão no operador autorizado. Arquivo hosts e DNS no{" "}
            <Link to="/escudo">Escudo</Link>. Gamban/BetBlocker no celular. Recuperar dinheiro não
            substitui parar de apostar.
          </p>
        </section>

        <form onSubmit={onSubmit} className="mt-10 rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-medium">Receber este guia por e-mail</p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="min-h-11 flex-1 rounded-md border border-border bg-bg px-3"
            />
            <button type="submit" className="rounded-md bg-primary px-4 font-medium text-primary-fg">
              Enviar
            </button>
          </div>
          {status === "ok" && <p className="mt-2 text-xs text-ok">Guardado.</p>}
          {status === "err" && <p className="mt-2 text-xs text-danger">Não salvou. Tente de novo.</p>}
        </form>

        <Link to="/login" className="mt-8 inline-block text-sm font-medium text-primary">
          Ir ao gerador
        </Link>
      </article>
      <SiteFooter />
    </div>
  );
}
