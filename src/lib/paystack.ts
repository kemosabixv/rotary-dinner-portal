import crypto from "node:crypto";

const BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export type InitializeInput = {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
  label?: string;
  metadata?: Record<string, string>;
};

export type InitializedTransaction = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

/**
 * Starts a hosted Paystack checkout. The buyer pays on Paystack's page (M-Pesa
 * or card), then lands on our callback URL. The webhook is what we trust.
 */
export async function initializeTransaction(input: InitializeInput): Promise<InitializedTransaction> {
  const response = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      // Paystack amounts are in the smallest currency unit: KES cents.
      amount: Math.round(input.amountKes * 100),
      currency: "KES",
      reference: input.reference,
      callback_url: input.callbackUrl,
      label: input.label,
      metadata: input.metadata,
    }),
  });

  const body = await response.json();
  if (!response.ok || !body?.status) {
    throw new Error(body?.message ?? `Paystack returned ${response.status}`);
  }

  return {
    authorizationUrl: body.data.authorization_url,
    accessCode: body.data.access_code,
    reference: body.data.reference,
  };
}

export type VerifiedTransaction = {
  reference: string;
  status: "paid" | "failed";
  channel: string | null;
  amountKes: number;
  paystackId: number | null;
  paidAt: string | null;
};

export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  const response = await fetch(
    `${BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const body = await response.json();
  if (!response.ok || !body?.status) return null;

  const data = body.data;
  return {
    reference: data.reference,
    status: data.status === "success" ? "paid" : "failed",
    channel: data.channel ?? null,
    amountKes: Math.round((data.amount ?? 0) / 100),
    paystackId: data.id ?? null,
    paidAt: data.paid_at ? new Date(data.paid_at).toISOString() : null,
  };
}

/**
 * Paystack signs webhooks with HMAC-SHA512 over the raw body, keyed with the
 * secret key (or a dedicated webhook secret if one is configured).
 */
export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const digest = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(digest);
  const received = Buffer.from(signature);

  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}
