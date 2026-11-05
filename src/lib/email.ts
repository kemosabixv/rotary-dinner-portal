/**
 * Transactional email via Resend.
 *
 * Deliberately dependency-free: one POST to the Resend API. If RESEND_API_KEY
 * is not configured the caller falls back to showing the coupon on screen, so
 * the poll still works without email.
 */

export type EmailResult = { status: "sent" | "failed" | "skipped"; detail?: string };

type CouponEmail = {
  to: string;
  businessName: string;
  pollTitle: string;
  couponLabel: string;
  couponCode: string;
};

export async function sendCouponEmail(input: CouponEmail): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "skipped", detail: "RESEND_API_KEY not configured" };

  const from = process.env.RESEND_FROM ?? "Rotary D9215 Dinner <onboarding@resend.dev>";
  const subject = `Your ${input.couponLabel} code from ${input.businessName}`;

  const text = [
    `${input.businessName} — ${input.pollTitle}`,
    "",
    `Thank you for taking part. Your code: ${input.couponCode}`,
    "",
    `${input.couponLabel}`,
    "Show this code to the business. One use per respondent.",
    "",
    "Rotary District 9215 Foundation Dinner · 21 November 2026",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f8fb;font-family:Helvetica,Arial,sans-serif;color:#0b1b3a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fb;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d5dced;border-radius:12px;overflow:hidden">
        <tr><td style="background:#17458f;padding:18px 28px;color:#ffffff;font-size:14px;letter-spacing:0.08em;text-transform:uppercase">
          Rotary District 9215 · Foundation Dinner
        </td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 4px;font-size:13px;color:#45577c">${escapeHtml(input.businessName)}</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;color:#0b1b3a">${escapeHtml(input.pollTitle)}</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#45577c">Thank you for taking part. Here is your code:</p>
          <p style="margin:0 0 20px;padding:16px;border:1px dashed #5b83c4;border-radius:10px;background:#e6ebf5;text-align:center;font-family:Menlo,monospace;font-size:22px;letter-spacing:0.18em;color:#17458f">
            ${escapeHtml(input.couponCode)}
          </p>
          <p style="margin:0 0 8px;font-size:15px;color:#0b1b3a"><strong>${escapeHtml(input.couponLabel)}</strong></p>
          <p style="margin:0;font-size:13px;color:#45577c">Show this code to the business. One use per respondent.</p>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #d5dced;font-size:12px;color:#6e82a6">
          Rotary District 9215 Foundation Dinner · 21 November 2026 · Trademark Hotel, Nairobi
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [input.to], subject, html, text }),
    });

    if (!response.ok) {
      return { status: "failed", detail: (await response.text()).slice(0, 200) };
    }
    return { status: "sent" };
  } catch (error) {
    return { status: "failed", detail: String(error).slice(0, 200) };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
