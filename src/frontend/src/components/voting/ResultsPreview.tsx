"use client";

import { cn } from "@/lib/utils";
import type { PollResults } from "@/types/api";

interface ResultsPreviewProps {
  results: PollResults;
}
export function ResultsPreview({ results }: ResultsPreviewProps) {
  return (
    <div id="results" className="space-y-8 pt-4">
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            Wyniki
          </h3>
          <span className="text-sm text-zinc-400">
            {results.totalVotes} {results.totalVotes === 1 ? "głos" : "głosów"}
          </span>
        </div>

        <div className="space-y-8">
          {results.questions.map((q) => (
            <div key={q.questionId} className="space-y-3">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {q.questionText}
              </p>
              <div className="space-y-2">
                {q.options
                  .slice()
                  .sort((a, b) => b.votes - a.votes)
                  .map((opt) => (
                    <div key={opt.optionId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-400">{opt.optionText}</span>
                        <span className="font-medium text-zinc-900 dark:text-white tabular-nums">
                          {opt.percentage.toFixed(1)}%
                          <span className="text-zinc-400 font-normal ml-1">({opt.votes})</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-700"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
