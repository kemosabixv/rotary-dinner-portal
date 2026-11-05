import { createClient } from "@/lib/supabase/server";
import { getPoll, listResponses } from "@/lib/polls";

function csvCell(value: string | null | undefined): string {
  const text = value ?? "";
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pollId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { pollId } = await params;
  const poll = await getPoll(pollId);
  if (!poll) return new Response("Not found", { status: 404 });

  const responses = await listResponses(pollId);

  const header = [
    "submitted_at",
    "name",
    "email",
    "phone",
    "coupon_code",
    "coupon_email_status",
    ...poll.questions.map((question, index) => `q${index + 1}: ${question.prompt}`),
  ];

  const rows = responses.map((response) => [
    response.createdAt,
    response.respondentName,
    response.respondentEmail,
    response.respondentContact,
    response.couponCode,
    response.couponEmailStatus,
    ...poll.questions.map((question) => response.answers[question.id] ?? ""),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${poll.slug}-responses.csv"`,
      "cache-control": "no-store",
    },
  });
}
