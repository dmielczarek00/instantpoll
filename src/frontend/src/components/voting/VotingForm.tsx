"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionBlock } from "./QuestionBlock";
import { AlreadyVoted } from "./AlreadyVoted";
import { VoteSuccess } from "./VoteSuccess";
import { ResultsPreview } from "./ResultsPreview";
import { castVote, fetchResults } from "@/lib/api";
import { getFingerprint, hasVoted, markVoted } from "@/lib/fingerprint";
import type { Poll } from "@/types/poll";
import type { PollResults } from "@/types/api";

interface VotingFormProps {
  poll: Poll;
}

type VoteState = "idle" | "submitting" | "success" | "already_voted";

export function VotingForm({ poll }: VotingFormProps) {
  const [answers, setAnswers] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(poll.questions.map((q) => [q.id, []]))
  );
  const [voteState, setVoteState] = useState<VoteState>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [results, setResults] = useState<PollResults | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  //czy już głosował
useEffect(() => {
  const init = async () => {
    if (hasVoted(poll.publicId)) {
      setVoteState("already_voted");

      try {
        setLoadingResults(true);
        const data = await fetchResults(poll.publicId);
        setResults(data);
      } finally {
        setLoadingResults(false);
      }
    }
  };

  init();
}, [poll.publicId]);

  const handleAnswer = (questionId: string, optionId: string, checked: boolean) => {
    const question = poll.questions.find((q) => q.id === questionId)!;

    setAnswers((prev) => {
      const current = prev[questionId] ?? [];

      if (question.type === "single") {
        return { ...prev, [questionId]: checked ? [optionId] : [] };
      } else {
        return {
          ...prev,
          [questionId]: checked
            ? [...current, optionId]
            : current.filter((id) => id !== optionId),
        };
      }
    });

    setErrors((prev) =>
      prev.filter((e) => !e.includes(question.text.slice(0, 20)))
    );
  };

  const validate = (): string[] => {
    return poll.questions
      .filter((q) => !answers[q.id]?.length)
      .map((q) => `Pytanie "${q.text.slice(0, 40)}${q.text.length > 40 ? "…" : ""}" — wybierz odpowiedź.`);
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setVoteState("submitting");
    setErrors([]);

    try {
      await castVote({
        publicId: poll.publicId,
        fingerprint: getFingerprint(),
        answers: Object.entries(answers).map(([questionId, optionIds]) => ({
          questionId,
          optionIds,
        })),
      });

      markVoted(poll.publicId);
      setVoteState("success");
    } catch (err) {
      setVoteState("idle");
      setErrors([
        err instanceof Error ? err.message : "Nie udało się zapisać głosu.",
      ]);
    }
  };

  const handleShowResults = async () => {
    setLoadingResults(true);
    try {
      const data = await fetchResults(poll.publicId);
      setResults(data);
    } catch {

    } finally {
      setLoadingResults(false);
    }
  };

  if (!poll.isActive) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-lg font-medium text-zinc-900 dark:text-white">Ankieta zakończona</p>
        <p className="text-sm text-zinc-500">Ta ankieta nie przyjmuje już głosów.</p>
      </div>
    );
  }

if (voteState === "already_voted") {
  return (
    <AlreadyVoted
      pollTitle={poll.title}
      resultsVisible={poll.resultsVisible}
      publicId={poll.publicId}
      results={results || undefined}
      isLoading={loadingResults}
    />
  );
}

  if (voteState === "success") {
    return (
      <div className="space-y-6">
        <VoteSuccess
          pollTitle={poll.title}
          resultsVisible={poll.resultsVisible}
          publicId={poll.publicId}
          onShowResults={handleShowResults}
        />
        {loadingResults && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        )}
        {results && <ResultsPreview results={results} />}
      </div>
    );
  }

  const isSubmitting = voteState === "submitting";

  return (
    <div className="space-y-8">
      {poll.questions.map((question, index) => (
        <QuestionBlock
          key={question.id}
          question={question}
          index={index}
          selectedOptions={answers[question.id] ?? []}
          disabled={isSubmitting}
          onAnswer={handleAnswer}
        />
      ))}

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-3">
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-red-600 dark:text-red-400">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            "Oddaj głos"
          )}
        </Button>
      </div>
    </div>
  );
}
