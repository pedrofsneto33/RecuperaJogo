import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EMPRESA } from "@/lib/empresa";

export const Route = createFileRoute("/termos")({ component: Termos });

function Termos() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <article className="mx-auto max-w-2xl space-y-4 px-4 py-12 text-sm leading-relaxed text-muted">
        <h1 className="font-display text-3xl text-fg">Termos de uso</h1>
        <p>Última atualização: 25 de setembro de 2026.</p>
        <p>
          Fornecedor: <strong className="text-fg">{EMPRESA.razao}</strong>, CNPJ {EMPRESA.cnpj},
          e-mail {EMPRESA.email}, telefone {EMPRESA.telefone}. O RecuperaJogo é software da Primex Sistemas.
        </p>
        <h2 className="pt-4 font-display text-xl text-fg">1. Natureza do serviço</h2>
        <p>
          RecuperaJogo é um software de automação de rascunhos de peças processuais para uso
          pelo próprio usuário no Juizado Especial (jus postulandi) e de ferramentas de
          autoexclusão (“Escudo”). Não é escritório de advocacia, não presta consultoria jurídica,
          não representa partes e não forma relação advogado-cliente. Nada neste site constitui
          parecer, opinião legal ou captação irregular de clientela (Lei 8.906/1994).
        </p>
        <h2 className="font-display text-xl text-fg">2. Usuário é o autor da peça</h2>
        <p>
          O texto gerado é minuta. O usuário é o único responsável por conferir fatos, provas,
          qualificação, valor da causa, competência, prazos e a vigência das normas citadas antes
          de protocolar. O usuário declara que os fatos inseridos são verdadeiros.
        </p>
        <h2 className="font-display text-xl text-fg">3. Inteligência artificial</h2>
        <p>
          A função de organizar relato envia o texto dos fatos (sem CPF, nome ou endereço) a um
          modelo de linguagem. O modelo pode errar. Ele não substitui o quadro normativo do
          software e não está autorizado a inventar jurisprudência. O usuário revisa o resultado.
        </p>
        <h2 className="font-display text-xl text-fg">4. Sem garantia de resultado</h2>
        <p>
          Processos dependem de prova, juízo e contestação. A Primex não promete restituição, acordo
          ou êxito. Garantia, se houver, limita-se a falha técnica na geração do arquivo.
        </p>
        <h2 className="font-display text-xl text-fg">5. Escudo</h2>
        <p>
          O Escudo não é filtro de sistema operacional. Não bloqueia sites no aparelho como Gamban
          ou BetBlocker. Cadeado de pânico, lista hosts e DNS são ferramentas voluntárias.
        </p>
        <h2 className="font-display text-xl text-fg">6. Pagamento</h2>
        <p>
          O acesso pago é pessoal, intransferível, limitado a três rascunhos. PIX é configurado
          pela Primex. Abuso (liberação sem pagamento) pode ser revogado.
        </p>
        <h2 className="font-display text-xl text-fg">7. Limite de responsabilidade</h2>
        <p>
          Na máxima extensão permitida pelo CDC, a responsabilidade por danos indiretos, lucros
          cessantes ou sucumbência judicial é excluída. Qualquer indenização direta fica limitada
          ao valor efetivamente pago pelo acesso, salvo dolo.
        </p>
        <h2 className="font-display text-xl text-fg">8. Vedações</h2>
        <p>
          É vedado usar o rascunho para fatos falsos ou para simular que a peça foi elaborada por
          advogado. É vedado o uso do art. 26, VI, da Lei 14.790/2023 sem laudo.
        </p>
        <h2 className="font-display text-xl text-fg">9. Foro</h2>
        <p>
          Relação de consumo: foro do domicílio do usuário. Foro subsidiário da Primex: comarca de
          Teresina/PI, quando a lei permitir.
        </p>
        <h2 className="font-display text-xl text-fg">10. Suporte</h2>
        <p>
          Canal: {EMPRESA.email} e {EMPRESA.telefone}. Pedidos de senha, LGPD e falha técnica entram
          pelo site em Suporte.
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
