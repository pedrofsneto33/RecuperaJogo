import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { pingOpenPix } from "@/lib/integrations/openpix/client";
import { pingWhatsApp } from "@/lib/integrations/whatsapp/client";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const started = Date.now();
        const out: {
          ok: boolean;
          db: "ok" | "down";
          openpix: "ok" | "down" | "off";
          whatsapp: "ok" | "down" | "off";
          ms: number;
        } = { ok: true, db: "ok", openpix: "off", whatsapp: "off", ms: 0 };
        try {
          const sql = await getSql();
          await sql`select 1 as n`;
        } catch {
          out.db = "down";
          out.ok = false;
        }
        try {
          const sql = await getSql();
          const rows = await sql<{
            openpix_app_id: string;
            wa_token: string;
            wa_phone_id: string;
          }>`
            select coalesce(openpix_app_id, '') as openpix_app_id,
                   coalesce(wa_token, '') as wa_token,
                   coalesce(wa_phone_id, '') as wa_phone_id
            from site_settings where id = 1 limit 1
          `;
          const row = rows[0];
          const appId = row?.openpix_app_id.trim() ?? "";
          const token = row?.wa_token.trim() ?? "";
          const phoneId = row?.wa_phone_id.trim() ?? "";
          if (appId) {
            out.openpix = await pingOpenPix(appId);
            if (out.openpix === "down") out.ok = false;
          }
          if (token && phoneId) {
            out.whatsapp = await pingWhatsApp(token, phoneId);
            if (out.whatsapp === "down") out.ok = false;
          }
        } catch {
          /* settings ausentes = off */
        }
        out.ms = Date.now() - started;
        return Response.json(out, { status: out.ok ? 200 : 503 });
      },
    },
  },
});
