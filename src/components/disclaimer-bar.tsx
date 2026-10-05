import { AlertTriangle } from "lucide-react";

export function DisclaimerBar({ compact }: { compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-lg border border-warn/30 bg-warn-bg px-4 py-3 text-warn">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed">
        <strong>Isto não é advocacia.</strong> RecuperaJogo é software de automação de
        rascunho. Não há advogado responsável, não se forma relação cliente-advogado e
        nenhum resultado judicial é prometido.
        {!compact &&
          " Você revisa, assina e protocola em nome próprio (jus postulandi, causas de até 20 salários mínimos). Confirme a lei vigente e anexe só provas reais."}
      </p>
    </div>
  );
}
