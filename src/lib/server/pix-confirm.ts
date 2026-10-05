import { getSql } from "@/lib/db";
import { PRECO_RH_REAIS } from "@/lib/legal/constantes";
import { logEvent } from "@/lib/log";
import { notificarPagamento } from "./notify-pagamento";

/** Confirma PIX pelo txid (correlationID) e libera a conta. Usado só pelo webhook. */
export async function confirmarPixPago(txidRaw: string, amountCents?: number) {
  const txid = txidRaw.replace(/[^A-Za-z0-9]/g, "").slice(0, 25);
  if (!txid) return { ok: false as const, reason: "txid vazio" };
  const sql = await getSql();
  const orders = await sql<{
    user_id: string;
    amount_cents: number;
    status: string;
    produto: string | null;
  }>`
    select user_id, amount_cents, status, coalesce(produto, 'pacote') as produto
    from pix_orders where txid = ${txid} limit 1
  `;
  const order = orders[0];
  if (!order) return { ok: false as const, reason: "pedido não encontrado" };
  if (typeof amountCents === "number" && amountCents > 0 && order.amount_cents !== amountCents) {
    return { ok: false as const, reason: "valor divergente" };
  }
  await sql`
    update pix_orders
    set status = 'paid', paid_at = now()
    where txid = ${txid}
  `;
  const ehRh = order.produto === "rh" || order.amount_cents === Math.round(PRECO_RH_REAIS * 100);
  if (ehRh) {
    await sql`
      update subscriptions
      set kit_rh = true, payment_method = 'pix', pix_txid = ${txid}
      where user_id = ${order.user_id}
    `;
  } else {
    await sql`
      update subscriptions
      set status = 'active',
          payment_method = 'pix',
          pix_txid = ${txid},
          activated_at = now()
      where user_id = ${order.user_id}
    `;
  }
  const produto = ehRh ? ("rh" as const) : ("pacote" as const);
  logEvent("pix.paid", { txid, produto, replay: order.status === "paid" });
  if (order.status !== "paid") {
    void notificarPagamento({ userId: order.user_id, produto, txid }).catch((e) => {
      logEvent("whatsapp.fail", { message: e instanceof Error ? e.message : "erro" });
    });
  }
  return { ok: true as const, userId: order.user_id, produto };
}
