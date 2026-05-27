"use client";

import { Plus } from "lucide-react";

interface AddQuestionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function AddQuestionButton({
  onClick,
  disabled = false,
}: AddQuestionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        w-full
        flex items-center justify-center gap-2
        py-4 px-5
        rounded-xl
        border-2 border-dashed border-zinc-200 dark:border-zinc-700
        text-sm text-zinc-400 dark:text-zinc-500
        hover:border-zinc-400 dark:hover:border-zinc-500
        hover:text-zinc-600 dark:hover:text-zinc-300
        hover:bg-zinc-50 dark:hover:bg-zinc-800/50
        disabled:opacity-30 disabled:cursor-not-allowed
        transition-all duration-200
        group
      "
    >
      <Plus
        className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90"
        aria-hidden="true"
      />
      Dodaj pytanie
      {disabled && <span className="text-zinc-300 dark:text-zinc-600">(max 20)</span>}
    </button>
  );
}
