import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EMPRESA } from "@/lib/empresa";

export const Route = createFileRoute("/privacidade")({ component: Privacidade });

function Privacidade() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteHeader />
      <article className="mx-auto max-w-2xl space-y-4 px-4 py-12 text-sm leading-relaxed text-muted">
        <h1 className="font-display text-3xl text-fg">Privacidade (LGPD)</h1>
        <p>Última atualização: 25 de setembro de 2026.</p>
        <p>
          Controladora e encarregada: <strong className="text-fg">{EMPRESA.razao}</strong>,
          CNPJ {EMPRESA.cnpj}. Contato do titular: {EMPRESA.email} · {EMPRESA.telefone}.
        </p>
        <h2 className="font-display text-xl text-fg">Dados tratados</h2>
        <p>
          Nome, e-mail e senha (hash) da conta; status de pagamento e PIX declarado; contagem de
          rascunhos; chamados de suporte; e-mail do guia, se informado. Relatos enviados à IA não
          incluem CPF, nome nem endereço. Não envie laudo médico ao site — diagnóstico é dado
          sensível (art. 11 da LGPD) e vai só ao protocolo judicial.
        </p>
        <h2 className="font-display text-xl text-fg">Bases legais</h2>
        <p>
          Execução de contrato (art. 7º, V) para conta, pagamento e geração; consentimento para o
          guia por e-mail; cumprimento de obrigação legal de guarda de registro de pagamento;
          atendimento de direitos do titular (art. 18).
        </p>
        <h2 className="font-display text-xl text-fg">Direitos</h2>
        <p>
          Acesso, correção, eliminação, oposição, portabilidade e informação. Peça em{" "}
          <Link to="/suporte">Suporte</Link> ou pelo e-mail da controladora. Retenção: enquanto a
          conta existir e pelo prazo legal mínimo de guarda fiscal/consumo.
        </p>
        <h2 className="font-display text-xl text-fg">Compartilhamento</h2>
        <p>
          Infraestrutura de hospedagem e banco (Postgres). PIX vai à instituição de pagamento do
          recebedor. Não vendemos lista. Cookies: ver <Link to="/cookies">política de cookies</Link>.
        </p>
        <p>
          ANPD: o titular pode apresentar reclamação à Autoridade Nacional de Proteção de Dados.
        </p>
      </article>
      <SiteFooter />
    </div>
  );
}
