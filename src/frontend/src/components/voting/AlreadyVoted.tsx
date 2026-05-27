import { CheckCircle, Loader2 } from "lucide-react"; // Dodany Loader2
import type { PollResults } from "@/types/api";
import { ResultsPreview } from "./ResultsPreview";

interface AlreadyVotedProps {
  pollTitle: string;
  resultsVisible: boolean;
  publicId: string;
  results?: PollResults;
  isLoading?: boolean;
}

export function AlreadyVoted({ pollTitle, resultsVisible, results, isLoading }: AlreadyVotedProps) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-zinc-500 dark:text-zinc-400" />
        </div>
      </div>
      
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Już oddałeś głos
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Twój głos w ankiecie <span className="font-medium text-zinc-700 dark:text-zinc-300">{pollTitle}</span> został zapisany.
        </p>
      </div>

      {resultsVisible && (
        <div className="text-left mt-8">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : results ? (
            <ResultsPreview results={results} />
          ) : (
            <p className="text-sm text-center text-zinc-400">Nie udało się załadować wyników.</p>
          )}
        </div>
      )}
    </div>
  );
}