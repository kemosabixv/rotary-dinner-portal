import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export type PaymentStatus = "pending" | "paid" | "failed" | "abandoned";

export type Payment = {
  id: string;
  reference: string;
  package: string;
  amountKes: number;
  currency: string;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  businessName: string | null;
  status: PaymentStatus;
  channel: string | null;
  paystackId: number | null;
  paidAt: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  reference: string;
  package: string;
  amount_kes: number;
  currency: string;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  business_name: string | null;
  status: PaymentStatus;
  channel: string | null;
  paystack_id: number | null;
  paid_at: string | null;
  created_at: string;
};

const COLUMNS =
  "id, reference, package, amount_kes, currency, buyer_name, buyer_email, buyer_phone, business_name, status, channel, paystack_id, paid_at, created_at";

function toPayment(row: Row): Payment {
  return {
    id: row.id,
    reference: row.reference,
    package: row.package,
    amountKes: Number(row.amount_kes),
    currency: row.currency,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    buyerPhone: row.buyer_phone,
    businessName: row.business_name,
    status: row.status,
    channel: row.channel,
    paystackId: row.paystack_id === null ? null : Number(row.paystack_id),
    paidAt: row.paid_at,
    createdAt: row.created_at,
  };
}

export type NewPayment = {
  reference: string;
  package: string;
  amountKes: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  businessName?: string;
};

export async function createPayment(input: NewPayment): Promise<{ verifyToken: string }> {
  const supabase = await createClient();
  const verifyToken = crypto.randomBytes(16).toString("hex");

  const { error } = await supabase.from("payments").insert({
    reference: input.reference,
    package: input.package,
    amount_kes: input.amountKes,
    buyer_name: input.buyerName || null,
    buyer_email: input.buyerEmail || null,
    buyer_phone: input.buyerPhone || null,
    business_name: input.businessName || null,
    status: "pending",
    verify_token: verifyToken,
  });

  if (error) throw new Error(`Could not record payment: ${error.message}`);
  return { verifyToken };
}

/**
 * Public receipt lookup: returns only the fields a buyer needs, via a
 * security-definer function, because anon cannot read the payments table.
 */
export async function getPaymentStatus(reference: string): Promise<{
  reference: string;
  status: PaymentStatus;
  package: string;
  amountKes: number;
  businessName: string | null;
} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("payment_status", { p_reference: reference });
  if (error) return null;

  const row = (data as Array<{
    reference: string;
    status: PaymentStatus;
    package: string;
    amount_kes: number;
    business_name: string | null;
  }> | null)?.[0];
  if (!row) return null;

  return {
    reference: row.reference,
    status: row.status,
    package: row.package,
    amountKes: Number(row.amount_kes),
    businessName: row.business_name,
  };
}

/**
 * Called from the webhook route. The token proves the event came from our own
 * checkout (it travels to Paystack in transaction metadata and back), so anon
 * cannot flip a payment to paid without it.
 */
export async function markPaymentPaidByToken(
  reference: string,
  verifyToken: string,
  details: { channel?: string | null; paystackId?: number | null; paidAt?: string | null },
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mark_payment_paid", {
    p_reference: reference,
    p_verify_token: verifyToken,
    p_channel: details.channel ?? null,
    p_paystack_id: details.paystackId ?? null,
    p_paid_at: details.paidAt ?? new Date().toISOString(),
  });

  if (error) return false;
  return Boolean(data);
}

export async function listPayments(limit = 25): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load payments: ${error.message}`);
  return (data as Row[]).map(toPayment);
}
