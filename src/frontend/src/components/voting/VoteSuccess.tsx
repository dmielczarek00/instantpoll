"use client";

import { CheckCircle2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoteSuccessProps {
  pollTitle: string;
  resultsVisible: boolean;
  publicId: string;
  onShowResults: () => void;
}

export function VoteSuccess({
  pollTitle,
  resultsVisible,
  publicId,
  onShowResults,
}: VoteSuccessProps) {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-10 h-10 text-white dark:text-zinc-900" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Głos oddany!
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
          Dziękujemy za udział w ankiecie{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{pollTitle}</span>.
        </p>
      </div>

      {resultsVisible ? (
        <Button onClick={onShowResults} className="gap-2">
          <BarChart2 className="w-4 h-4" />
          Zobacz wyniki
        </Button>
      ) : (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Właściciel ankiety nie udostępnił jeszcze wyników.
        </p>
      )}
    </div>
  );
}
