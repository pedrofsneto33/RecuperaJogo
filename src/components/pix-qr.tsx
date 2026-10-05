import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

export function PixQr({ payload }: { payload: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [qrOk, setQrOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function draw() {
      try {
        const QR = await import("qrcode");
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        await QR.toCanvas(canvas, payload, {
          width: 220,
          margin: 1,
          color: { dark: "#1c2430", light: "#fffcf6" },
        });
        if (!cancelled) setQrOk(true);
      } catch {
        if (!cancelled) setQrOk(false);
      }
    }
    void draw();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  async function copy() {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className={qrOk ? "rounded-md" : "hidden"} width={220} height={220} />
      </div>
      <p className="mt-3 text-center text-xs text-muted">PIX copia e cola</p>
      <p className="mt-1 break-all rounded-md bg-surface px-2 py-2 font-mono text-xs leading-relaxed text-fg">
        {payload}
      </p>
      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-sm font-medium"
      >
        {copied ? <Check size={16} className="text-ok" /> : <Copy size={16} />}
        {copied ? "Copiado" : "Copiar código PIX"}
      </button>
    </div>
  );
}
