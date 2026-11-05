"use client";

import { useState } from "react";

export type QuestionDraft = {
  prompt: string;
  kind: "choice" | "text";
  options: string[];
  required: boolean;
};

type Editable = {
  prompt: string;
  kind: "choice" | "text";
  optionsText: string;
  required: boolean;
};

function toEditable(question?: QuestionDraft): Editable {
  return {
    prompt: question?.prompt ?? "",
    kind: question?.kind ?? "choice",
    optionsText: (question?.options ?? []).join("\n"),
    required: question?.required ?? true,
  };
}

export function PollQuestionsEditor({
  initial = [],
  name = "questions",
}: {
  initial?: QuestionDraft[];
  name?: string;
}) {
  const [questions, setQuestions] = useState<Editable[]>(
    initial.length > 0 ? initial.map(toEditable) : [toEditable()],
  );

  const serialized = JSON.stringify(
    questions
      .map((question) => ({
        prompt: question.prompt.trim(),
        kind: question.kind,
        options:
          question.kind === "choice"
            ? question.optionsText
                .split(/\r?\n/)
                .map((option) => option.trim())
                .filter(Boolean)
            : [],
        required: question.required,
      }))
      .filter((question) => question.prompt.length > 0),
  );

  function update(index: number, patch: Partial<Editable>) {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialized} />

      {questions.map((question, index) => (
        <div key={index} className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Question {index + 1}
            </p>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => setQuestions((current) => current.filter((_, i) => i !== index))}
                className="text-xs text-rose-600 hover:text-rose-700"
              >
                Remove
              </button>
            )}
          </div>

          <label className="mt-2 block text-sm font-medium text-ink">
            Prompt
            <input
              value={question.prompt}
              onChange={(event) => update(index, { prompt: event.target.value })}
              placeholder="Which of these do you buy most often?"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
            <label className="block text-sm font-medium text-ink">
              Type
              <select
                value={question.kind}
                onChange={(event) => update(index, { kind: event.target.value as Editable["kind"] })}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="choice">Multiple choice</option>
                <option value="text">Short answer</option>
              </select>
            </label>

            {question.kind === "choice" ? (
              <label className="block text-sm font-medium text-ink">
                Options (one per line)
                <textarea
                  value={question.optionsText}
                  onChange={(event) => update(index, { optionsText: event.target.value })}
                  rows={3}
                  placeholder={"Weekly\nMonthly\nRarely"}
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                />
              </label>
            ) : (
              <div className="flex items-end pb-2 text-xs text-muted">
                Respondents type a free-text answer (max 500 characters).
              </div>
            )}
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(event) => update(index, { required: event.target.checked })}
              className="h-3.5 w-3.5 rounded border-line"
            />
            Required
          </label>
        </div>
      ))}

      {questions.length < 10 && (
        <button
          type="button"
          onClick={() => setQuestions((current) => [...current, toEditable()])}
          className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-brand hover:text-brand"
        >
          + Add question
        </button>
      )}
    </div>
  );
}
