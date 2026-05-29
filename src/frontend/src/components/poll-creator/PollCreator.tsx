"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PollTitleInput } from "./PollTitleInput";
import { QuestionCard } from "./QuestionCard";
import { AddQuestionButton } from "./AddQuestionButton";
import { ShareModal } from "./ShareModal";
import { createPoll } from "@/lib/api";
import { toCreatePollRequest } from "@/types/api";
import { generateId } from "@/lib/utils";
import type { PollFormData, PollQuestionDraft } from "@/types/poll";


function createEmptyQuestion(): PollQuestionDraft {
  return {
    id: generateId(),
    text: "",
    type: "single",
    options: [
      { id: generateId(), text: "" },
      { id: generateId(), text: "" },
    ],
  };
}

function createInitialForm(): PollFormData {
  return {
    title: "",
    questions: [createEmptyQuestion()],
  };
}


interface ValidationError {
  field: string;
  message: string;
}

function validate(form: PollFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!form.title.trim()) {
    errors.push({ field: "title", message: "Podaj tytuł ankiety." });
  }

  form.questions.forEach((q, qi) => {
    if (!q.text.trim()) {
      errors.push({
        field: `question_${qi}`,
        message: `Pytanie ${qi + 1}: brak treści pytania.`,
      });
    }
    const filledOptions = q.options.filter((o) => o.text.trim());
    if (filledOptions.length < 2) {
      errors.push({
        field: `question_${qi}_options`,
        message: `Pytanie ${qi + 1}: wypełnij co najmniej 2 opcje.`,
      });
    }
  });

  return errors;
}

export function PollCreator() {
  const [form, setForm] = useState<PollFormData>(createInitialForm);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPoll, setCreatedPoll] = useState<{
    publicUrl: string;
    adminUrl: string;
  } | null>(null);

  const updateTitle = (title: string) => {
    setForm((prev) => ({ ...prev, title }));
    setErrors((prev) => prev.filter((e) => e.field !== "title"));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  };

  const updateQuestion = (updated: PollQuestionDraft) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === updated.id ? updated : q
      ),
    }));
  };

  const deleteQuestion = (id: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await createPoll(toCreatePollRequest(form));
      setCreatedPoll({
        publicUrl: response.publicUrl,
        adminUrl: response.adminUrl,
      });
    } catch (err) {
      setErrors([
        {
          field: "submit",
          message:
            err instanceof Error
              ? err.message
              : "Nie udało się utworzyć ankiety. Spróbuj ponownie.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPoll = () => {
    setCreatedPoll(null);
    setForm(createInitialForm());
    setErrors([]);
  };

  const submitError = errors.find((e) => e.field === "submit");
  const hasErrors = errors.length > 0;

  return (
    <>
      <div className="space-y-4">
        <PollTitleInput value={form.title} onChange={updateTitle} />

        {hasErrors && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-3">
            <ul className="space-y-1">
              {errors.map((err) => (
                <li key={err.field} className="text-sm text-red-600 dark:text-red-400">
                  {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {form.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              canDelete={form.questions.length > 1}
              onChange={updateQuestion}
              onDelete={deleteQuestion}
            />
          ))}
        </div>

        <AddQuestionButton
          onClick={addQuestion}
          disabled={form.questions.length >= 20}
        />

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">
            {form.questions.length}{" "}
            {form.questions.length === 1 ? "pytanie" : "pytania/pytań"}
          </p>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Tworzenie...
              </>
            ) : (
              "Utwórz ankietę"
            )}
          </Button>
        </div>
      </div>

      {createdPoll && (
        <ShareModal
          open={true}
          publicUrl={createdPoll.publicUrl}
          adminUrl={createdPoll.adminUrl}
          pollTitle={form.title}
          onClose={() => setCreatedPoll(null)}
          onNewPoll={handleNewPoll}
        />
      )}
    </>
  );
}
