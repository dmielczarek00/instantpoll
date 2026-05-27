"use client";

import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types/poll";

interface ChoiceOptionProps {
  optionId: string;
  text: string;
  questionType: QuestionType;
  checked: boolean;
  disabled: boolean;
  onChange: (optionId: string, checked: boolean) => void;
}

export function ChoiceOption({
  optionId,
  text,
  questionType,
  checked,
  disabled,
  onChange,
}: ChoiceOptionProps) {
  const inputType = questionType === "single" ? "radio" : "checkbox";

  return (
    <label
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer select-none",
        "transition-all duration-150",
        checked
          ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type={inputType}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(optionId, e.target.checked)}
        className="sr-only"
      />

      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center",
          "w-5 h-5 border-2 transition-all duration-150",
          questionType === "single" ? "rounded-full" : "rounded-md",
          checked
            ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
            : "border-zinc-300 dark:border-zinc-600"
        )}
        aria-hidden="true"
      >
        {checked && (
          questionType === "single" ? (
            <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />
          ) : (
            <svg className="w-3 h-3 text-white dark:text-zinc-900" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        )}
      </div>

      <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">{text}</span>
    </label>
  );
}
