"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import packagesJson from "@/data/packages.json";
import { getProfile } from "@/lib/auth";
import { createPayment } from "@/lib/payments";
import { initializeTransaction } from "@/lib/paystack";
import type { PackagesConfig } from "@/lib/types";

const packages = packagesJson as PackagesConfig;

function priceFor(packageId: string): number | null {
  const tier = packages.tiers.find((item) => item.id === packageId);
  if (tier?.priceKes) return tier.priceKes;
  if (packageId === packages.addOn.id) return packages.addOn.priceKes;
  return null;
}

async function origin(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function startCheckoutAction(formData: FormData) {
  const packageId = String(formData.get("package") ?? "");
  const amountKes = priceFor(packageId);

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().slice(0, 160);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 40);
  const businessName = String(formData.get("businessName") ?? "").trim().slice(0, 160);

  const back = `/advertise/checkout?package=${encodeURIComponent(packageId)}`;

  if (!amountKes) redirect("/advertise?notice=Unknown+package");
  if (!name) redirect(`${back}&error=Enter+your+name`);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect(`${back}&error=Enter+a+valid+email+address`);
  }

  const reference = `PKG-${packageId.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}-${Date.now()
    .toString(36)
    .toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const profile = await getProfile();

  const { verifyToken } = await createPayment({
    reference,
    package: packageId,
    amountKes,
    buyerName: name,
    buyerEmail: email,
    buyerPhone: phone,
    businessName,
    businessId: profile?.businessId ?? null,
  });

  let authorizationUrl = "";
  try {
    const initialized = await initializeTransaction({
      email,
      amountKes,
      reference,
      callbackUrl: `${await origin()}/advertise/thanks?ref=${reference}`,
      label: `Rotary D9215${businessName ? ` — ${businessName}` : ""}`,
      metadata: {
        package: packageId,
        business_name: businessName,
        verify_token: verifyToken,
      },
    });
    authorizationUrl = initialized.authorizationUrl;
  } catch {
    redirect(`${back}&error=${encodeURIComponent("Could not start the payment. Please try again.")}`);
  }

  redirect(authorizationUrl);
}
