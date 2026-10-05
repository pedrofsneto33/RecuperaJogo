import { createFileRoute } from "@tanstack/react-router";
import { processarWebhookPix } from "@/lib/server/openpix";

export const Route = createFileRoute("/api/pix/webhook")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          ok: true,
          service: "recupera-jogo-pix",
          hint: "POST OpenPix CHARGE_COMPLETED or { txid, paid: true }",
        }),
      POST: ({ request }) => processarWebhookPix(request),
    },
  },
});
