"use client";

import { Badge } from "@/components/ui/badge";
import { ChoiceOption } from "./ChoiceOption";
import type { PollQuestion } from "@/types/poll";

interface QuestionBlockProps {
  question: PollQuestion;
  index: number;
  selectedOptions: string[];
  disabled: boolean;
  onAnswer: (questionId: string, optionId: string, checked: boolean) => void;
}

export function QuestionBlock({
  question,
  index,
  selectedOptions,
  disabled,
  onAnswer,
}: QuestionBlockProps) {
  return (
    <div className="space-y-3">
\      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5 text-xs font-medium text-zinc-400 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 space-y-1">
          <p className="text-base font-medium text-zinc-900 dark:text-white leading-snug">
            {question.text}
          </p>
          <Badge variant="secondary" className="text-xs">
            {question.type === "single" ? "jednokrotny wybór" : "wielokrotny wybór"}
          </Badge>
        </div>
      </div>

      <div className="pl-7 space-y-2">
        {question.options.map((option) => (
          <ChoiceOption
            key={option.id}
            optionId={option.id}
            text={option.text}
            questionType={question.type}
            checked={selectedOptions.includes(option.id)}
            disabled={disabled}
            onChange={(optionId, checked) => onAnswer(question.id, optionId, checked)}
          />
        ))}
      </div>
    </div>
  );
}
