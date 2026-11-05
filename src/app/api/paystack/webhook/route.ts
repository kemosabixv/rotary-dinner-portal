import { markPaymentPaidByToken } from "@/lib/payments";
import { isValidWebhookSignature } from "@/lib/paystack";

/**
 * Paystack webhook — the source of truth for payment status.
 *
 * Requires the raw body for HMAC verification, so this must not be parsed
 * before the signature check. Configure the URL in the Paystack dashboard:
 *   https://<host>/api/paystack/webhook
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidWebhookSignature(raw, signature)) {
    return new Response("invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: Record<string, unknown> } = {};
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data) {
    const data = event.data;
    const reference = String(data.reference ?? "");
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const verifyToken = String(metadata.verify_token ?? "");

    if (reference && verifyToken) {
      await markPaymentPaidByToken(reference, verifyToken, {
        channel: data.channel ? String(data.channel) : null,
        paystackId: typeof data.id === "number" ? data.id : null,
        paidAt: data.paid_at ? new Date(String(data.paid_at)).toISOString() : null,
      });
    }
  }

  return new Response("ok", { status: 200 });
}
