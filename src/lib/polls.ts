import { createClient } from "@/lib/supabase/server";
import type { Poll, PollQuestion, PollResponse, PollStatus } from "./types";

type PollRow = {
  id: string;
  business_id: string;
  slug: string;
  title: string;
  intro: string;
  status: PollStatus;
  coupon_label: string | null;
  coupon_prefix: string;
  created_at: string;
  updated_at: string;
};

type QuestionRow = {
  id: string;
  poll_id: string;
  position: number;
  prompt: string;
  kind: "choice" | "text";
  options: unknown;
  required: boolean;
};

type ResponseRow = {
  id: string;
  poll_id: string;
  answers: unknown;
  respondent_name: string | null;
  respondent_contact: string | null;
  respondent_email: string | null;
  coupon_code: string | null;
  coupon_email_status: string | null;
  created_at: string;
};

const POLL_COLUMNS = "id, business_id, slug, title, intro, status, coupon_label, coupon_prefix, created_at, updated_at";
const QUESTION_COLUMNS = "id, poll_id, position, prompt, kind, options, required";

function toQuestion(row: QuestionRow): PollQuestion {
  return {
    id: row.id,
    position: row.position,
    prompt: row.prompt,
    kind: row.kind,
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    required: row.required,
  };
}

function toPoll(row: PollRow, questions: PollQuestion[]): Poll {
  return {
    id: row.id,
    businessId: row.business_id,
    slug: row.slug,
    title: row.title,
    intro: row.intro,
    status: row.status,
    couponLabel: row.coupon_label,
    couponPrefix: row.coupon_prefix,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    questions,
  };
}

async function questionsFor(pollIds: string[]): Promise<Map<string, PollQuestion[]>> {
  const map = new Map<string, PollQuestion[]>();
  if (pollIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("poll_questions")
    .select(QUESTION_COLUMNS)
    .in("poll_id", pollIds)
    .order("position", { ascending: true });

  if (error) throw new Error(`Could not load questions: ${error.message}`);

  for (const row of data as QuestionRow[]) {
    const list = map.get(row.poll_id) ?? [];
    list.push(toQuestion(row));
    map.set(row.poll_id, list);
  }
  return map;
}

export async function listPollsForBusiness(businessId: string): Promise<Poll[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select(POLL_COLUMNS)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load polls: ${error.message}`);

  const rows = data as PollRow[];
  const questions = await questionsFor(rows.map((row) => row.id));
  return rows.map((row) => toPoll(row, questions.get(row.id) ?? []));
}

export async function getPoll(id: string): Promise<Poll | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("polls").select(POLL_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load poll: ${error.message}`);
  if (!data) return null;

  const questions = await questionsFor([id]);
  return toPoll(data as PollRow, questions.get(id) ?? []);
}

export async function getLivePollBySlug(slug: string): Promise<Poll | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select(POLL_COLUMNS)
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();

  if (error) throw new Error(`Could not load poll: ${error.message}`);
  if (!data) return null;

  const questions = await questionsFor([(data as PollRow).id]);
  return toPoll(data as PollRow, questions.get((data as PollRow).id) ?? []);
}

export type PollInput = {
  businessId: string;
  title: string;
  intro: string;
  couponLabel: string;
  couponPrefix: string;
  questions: Array<{ prompt: string; kind: "choice" | "text"; options: string[]; required: boolean }>;
};

export function slugifyPoll(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function replaceQuestions(pollId: string, questions: PollInput["questions"]) {
  const supabase = await createClient();
  const { error: clearError } = await supabase.from("poll_questions").delete().eq("poll_id", pollId);
  if (clearError) throw new Error(`Could not reset questions: ${clearError.message}`);

  if (questions.length === 0) return;

  const { error } = await supabase.from("poll_questions").insert(
    questions.map((question, index) => ({
      poll_id: pollId,
      position: index,
      prompt: question.prompt,
      kind: question.kind,
      options: question.options,
      required: question.required,
    })),
  );

  if (error) throw new Error(`Could not save questions: ${error.message}`);
}

export async function createPoll(input: PollInput): Promise<Poll> {
  const supabase = await createClient();
  const base = slugifyPoll(input.title) || `poll-${Date.now()}`;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 5)}`;
    const { data, error } = await supabase
      .from("polls")
      .insert({
        business_id: input.businessId,
        slug,
        title: input.title,
        intro: input.intro,
        coupon_label: input.couponLabel || null,
        coupon_prefix: input.couponPrefix || "DINNER",
        status: "draft",
      })
      .select(POLL_COLUMNS)
      .single();

    if (!error) {
      const poll = data as PollRow;
      await replaceQuestions(poll.id, input.questions);
      return toPoll(poll, []);
    }
    if (error.code !== "23505") throw new Error(`Could not create poll: ${error.message}`);
  }

  throw new Error("Could not create poll: slug conflict");
}

export async function updatePoll(id: string, input: PollInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("polls")
    .update({
      title: input.title,
      intro: input.intro,
      coupon_label: input.couponLabel || null,
      coupon_prefix: input.couponPrefix || "DINNER",
    })
    .eq("id", id);

  if (error) throw new Error(`Could not save poll: ${error.message}`);
  await replaceQuestions(id, input.questions);
}

export async function setPollStatus(id: string, status: PollStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("polls").update({ status }).eq("id", id);
  if (error) throw new Error(`Could not update poll: ${error.message}`);
}

export async function deletePoll(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) throw new Error(`Could not delete poll: ${error.message}`);
}

export async function listResponses(pollId: string): Promise<PollResponse[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("poll_responses")
    .select("id, poll_id, answers, respondent_name, respondent_contact, respondent_email, coupon_code, coupon_email_status, created_at")
    .eq("poll_id", pollId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load responses: ${error.message}`);

  return (data as ResponseRow[]).map((row) => ({
    id: row.id,
    pollId: row.poll_id,
    answers: typeof row.answers === "object" && row.answers ? (row.answers as Record<string, string>) : {},
    respondentName: row.respondent_name,
    respondentContact: row.respondent_contact,
    respondentEmail: row.respondent_email,
    couponCode: row.coupon_code,
    couponEmailStatus: row.coupon_email_status,
    createdAt: row.created_at,
  }));
}

export function makeCouponCode(prefix: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${(prefix || "DINNER").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)}-${code}`;
}

export async function insertResponse(input: {
  pollId: string;
  answers: Record<string, string>;
  name?: string;
  contact?: string;
  email?: string;
  couponCode: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("poll_responses")
    .insert({
      poll_id: input.pollId,
      answers: input.answers,
      respondent_name: input.name || null,
      respondent_contact: input.contact || null,
      respondent_email: input.email || null,
      coupon_code: input.couponCode,
      coupon_email_status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Could not save response: ${error.message}`);
  return (data as { id: string }).id;
}

export async function setCouponEmailStatus(id: string, status: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("poll_responses").update({ coupon_email_status: status }).eq("id", id);
}

export async function listLivePollsForBusiness(businessId: string): Promise<Poll[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select(POLL_COLUMNS)
    .eq("business_id", businessId)
    .eq("status", "live")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load polls: ${error.message}`);

  const rows = data as PollRow[];
  const questions = await questionsFor(rows.map((row) => row.id));
  return rows.map((row) => toPoll(row, questions.get(row.id) ?? []));
}

export async function findCouponForEmail(pollId: string, email: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("poll_coupon_for_email", {
    p_poll: pollId,
    p_email: email,
  });
  if (error) return null;
  return (data as string | null) ?? null;
}
