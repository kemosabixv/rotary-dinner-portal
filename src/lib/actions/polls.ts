"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getBusinessById } from "@/lib/data";
import { sendCouponEmail } from "@/lib/email";
import {
  createPoll,
  deletePoll,
  findCouponForEmail,
  getLivePollBySlug,
  getPoll,
  insertResponse,
  makeCouponCode,
  setCouponEmailStatus,
  setPollStatus,
  updatePoll,
  type PollInput,
} from "@/lib/polls";
import type { PollStatus } from "@/lib/types";
import { requireUser } from "./guard";

type QuestionDraft = { prompt: string; kind: "choice" | "text"; options: string[]; required: boolean };

function parseQuestions(raw: string): QuestionDraft[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      const draft = item as Partial<QuestionDraft>;
      const kind = draft.kind === "text" ? "text" : "choice";
      const options = Array.isArray(draft.options)
        ? draft.options.map((option) => String(option).trim()).filter(Boolean).slice(0, 8)
        : [];
      return {
        prompt: String(draft.prompt ?? "").trim(),
        kind,
        options: kind === "choice" ? options : [],
        required: draft.required !== false,
      } satisfies QuestionDraft;
    })
    .filter((question) => question.prompt.length > 0 && (question.kind === "text" || question.options.length >= 2))
    .slice(0, 10);
}

function parsePollForm(formData: FormData): PollInput {
  return {
    businessId: String(formData.get("businessId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    intro: String(formData.get("intro") ?? "").trim(),
    couponLabel: String(formData.get("couponLabel") ?? "").trim(),
    couponPrefix: String(formData.get("couponPrefix") ?? "DINNER").trim() || "DINNER",
    questions: parseQuestions(String(formData.get("questions") ?? "[]")),
  };
}

/** Where a poll lives for this person: staff get the admin screen, businesses the portal. */
function manageHref(pollId: string, isBusiness: boolean) {
  return isBusiness ? `/portal/polls/${pollId}` : `/admin/polls/${pollId}`;
}

export async function createPollAction(formData: FormData) {
  await requireUser();
  const profile = await getProfile();
  const isBusiness = profile?.role === "business";
  const input = parsePollForm(formData);

  // A business can only create polls against its own listing.
  if (isBusiness) {
    if (!profile?.businessId) redirect("/portal");
    input.businessId = profile.businessId;
  }

  const back = isBusiness ? "/portal/polls/new" : `/admin/${input.businessId || ""}/polls`;

  if (!input.businessId || !input.title) {
    redirect(`${back}?notice=Title+is+required`);
  }
  if (input.questions.length === 0) {
    redirect(`${back}?notice=Add+at+least+one+question`);
  }

  const poll = await createPoll(input);
  revalidatePath("/", "layout");
  redirect(`${manageHref(poll.id, isBusiness)}?saved=1`);
}

export async function updatePollAction(formData: FormData) {
  await requireUser();
  const profile = await getProfile();
  const isBusiness = profile?.role === "business";
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(isBusiness ? "/portal" : "/admin");

  const poll = await getPoll(id);
  if (!poll) redirect(isBusiness ? "/portal" : "/admin");
  if (isBusiness && poll.businessId !== profile?.businessId) redirect("/portal");

  const input = parsePollForm(formData);
  input.businessId = poll.businessId;

  await updatePoll(id, input);
  revalidatePath("/", "layout");
  redirect(`${manageHref(id, isBusiness)}?saved=1`);
}

export async function setPollStatusAction(formData: FormData) {
  await requireUser();
  const profile = await getProfile();
  const isBusiness = profile?.role === "business";
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as PollStatus;
  const businessId = String(formData.get("businessId") ?? "");

  if (!id || !["draft", "live", "closed"].includes(status)) {
    redirect(isBusiness ? "/portal" : "/admin");
  }

  const poll = await getPoll(id);
  if (!poll) redirect(isBusiness ? "/portal" : "/admin");
  if (isBusiness && poll.businessId !== profile?.businessId) redirect("/portal");

  await setPollStatus(id, status);
  revalidatePath("/", "layout");
  redirect(isBusiness ? `/portal/polls/${id}` : businessId ? `/admin/${businessId}/polls` : "/admin");
}

export async function deletePollAction(formData: FormData) {
  await requireUser();
  const profile = await getProfile();
  const isBusiness = profile?.role === "business";
  const id = String(formData.get("id") ?? "");
  const businessId = String(formData.get("businessId") ?? "");
  if (!id) redirect(isBusiness ? "/portal" : "/admin");

  const poll = await getPoll(id);
  if (!poll) redirect(isBusiness ? "/portal" : "/admin");
  if (isBusiness && poll.businessId !== profile?.businessId) redirect("/portal");

  await deletePoll(id);
  revalidatePath("/", "layout");
  redirect(isBusiness ? "/portal" : businessId ? `/admin/${businessId}/polls` : "/admin");
}

export async function submitPollResponseAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const poll = await getLivePollBySlug(slug);
  if (!poll) redirect("/businesses");

  // Honeypot: silently accept but do not store bot submissions.
  if (String(formData.get("website") ?? "").trim()) {
    redirect(`/polls/${slug}?thanks=1`);
  }

  const email = String(formData.get("email") ?? "").trim().slice(0, 160);
  if (poll.couponLabel && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect(`/polls/${slug}?error=${encodeURIComponent("Enter a valid email address so we can send your code.")}`);
  }

  const answers: Record<string, string> = {};
  for (const question of poll.questions) {
    const value = String(formData.get(`q_${question.id}`) ?? "").trim();
    if (question.required && !value) {
      redirect(`/polls/${slug}?error=${encodeURIComponent("Please answer every question.")}`);
    }
    if (value) answers[question.id] = value.slice(0, 500);
  }

  if (email) {
    const existing = await findCouponForEmail(poll.id, email);
    if (existing) {
      redirect(`/polls/${slug}?code=${encodeURIComponent(existing)}&thanks=1&emailed=repeat`);
    }
  }

  const couponCode = poll.couponLabel ? makeCouponCode(poll.couponPrefix) : null;

  let responseId: string;
  try {
    responseId = await insertResponse({
      pollId: poll.id,
      answers,
      name: String(formData.get("name") ?? "").trim().slice(0, 120) || undefined,
      contact: String(formData.get("contact") ?? "").trim().slice(0, 120) || undefined,
      email: email || undefined,
      couponCode,
    });
  } catch (error) {
    // Unique-index race: same email submitted twice at once.
    const existing = email ? await findCouponForEmail(poll.id, email) : null;
    if (existing) {
      redirect(`/polls/${slug}?code=${encodeURIComponent(existing)}&thanks=1&emailed=repeat`);
    }
    throw error;
  }

  let emailed = "skip";
  if (couponCode && email) {
    const business = await getBusinessById(poll.businessId);
    const result = await sendCouponEmail({
      to: email,
      businessName: business?.name ?? "Rotary D9215 Foundation Dinner",
      pollTitle: poll.title,
      couponLabel: poll.couponLabel ?? "Discount code",
      couponCode,
    });
    await setCouponEmailStatus(responseId, result.status);
    if (result.status === "sent") emailed = "1";
    else if (result.status === "failed") emailed = "0";
  }

  revalidatePath(`/admin/polls/${poll.id}`);
  redirect(
    `/polls/${slug}?code=${encodeURIComponent(couponCode ?? "1")}&thanks=1&emailed=${emailed}`,
  );
}
