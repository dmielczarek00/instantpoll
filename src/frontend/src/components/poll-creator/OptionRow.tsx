"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PollOptionDraft, QuestionType } from "@/types/poll";

interface OptionRowProps {
  option: PollOptionDraft;
  questionType: QuestionType;
  index: number;
  canDelete: boolean;
  onChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export function OptionRow({
  option,
  questionType,
  index,
  canDelete,
  onChange,
  onDelete,
}: OptionRowProps) {
  return (
    <div className="group flex items-center gap-3 py-1.5">
      <div
        className={cn(
          "flex-shrink-0 w-4 h-4 border-2 border-zinc-300 dark:border-zinc-600",
          questionType === "single" ? "rounded-full" : "rounded-sm"
        )}
        aria-hidden="true"
      />

      <input
        type="text"
        value={option.text}
        onChange={(e) => onChange(option.id, e.target.value)}
        placeholder={`Opcja ${index + 1}`}
        maxLength={200}
        className="
          flex-1
          bg-transparent
          text-sm text-zinc-700 dark:text-zinc-300
          placeholder:text-zinc-300 dark:placeholder:text-zinc-600
          outline-none
          border-b border-transparent
          focus:border-zinc-300 dark:focus:border-zinc-600
          transition-colors duration-150
          py-0.5
        "
      />

      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(option.id)}
          className="
            flex-shrink-0
            opacity-0 group-hover:opacity-100
            p-1 rounded
            text-zinc-400 hover:text-red-500
            hover:bg-red-50 dark:hover:bg-red-950/30
            transition-all duration-150
          "
          aria-label="Usuń opcję"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
