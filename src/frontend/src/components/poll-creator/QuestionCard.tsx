"use client";

import { Trash2, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptionRow } from "./OptionRow";
import { generateId } from "@/lib/utils";
import type { PollQuestionDraft } from "@/types/poll";

interface QuestionCardProps {
  question: PollQuestionDraft;
  index: number;
  canDelete: boolean;
  onChange: (updated: PollQuestionDraft) => void;
  onDelete: (id: string) => void;
}

export function QuestionCard({
  question,
  index,
  canDelete,
  onChange,
  onDelete,
}: QuestionCardProps) {
  const updateText = (text: string) => onChange({ ...question, text });

  const toggleType = () =>
    onChange({
      ...question,
      type: question.type === "single" ? "multiple" : "single",
    });

  const addOption = () =>
    onChange({
      ...question,
      options: [...question.options, { id: generateId(), text: "" }],
    });

  const updateOption = (optionId: string, text: string) =>
    onChange({
      ...question,
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      ),
    });

  const deleteOption = (optionId: string) =>
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== optionId),
    });

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Badge
            variant="secondary"
            className="cursor-pointer select-none text-xs"
            onClick={toggleType}
          >
            {question.type === "single" ? "jednokrotny" : "wielokrotny"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleType}
            className="h-8 px-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            title={
              question.type === "single"
                ? "Zmień na wielokrotny"
                : "Zmień na jednokrotny"
            }
          >
            {question.type === "single" ? (
              <ToggleLeft className="w-4 h-4" />
            ) : (
              <ToggleRight className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
            )}
            <span className="sr-only">Zmień typ pytania</span>
          </Button>

          {/* Usuń pytanie */}
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
              className="h-8 px-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Usuń pytanie</span>
            </Button>
          )}
        </div>
      </div>
      <input
        type="text"
        value={question.text}
        onChange={(e) => updateText(e.target.value)}
        placeholder="Treść pytania..."
        maxLength={500}
        className="
          w-full mb-4
          text-base font-medium
          text-zinc-900 dark:text-white
          bg-transparent outline-none
          placeholder:text-zinc-300 dark:placeholder:text-zinc-600
          border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-700
          pb-1 transition-colors duration-150
        "
      />
      <div className="space-y-0.5 mb-3">
        {question.options.map((option, i) => (
          <OptionRow
            key={option.id}
            option={option}
            questionType={question.type}
            index={i}
            canDelete={question.options.length > 2}
            onChange={updateOption}
            onDelete={deleteOption}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addOption}
        disabled={question.options.length >= 10}
        className="
          flex items-center gap-1.5
          text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300
          disabled:opacity-30 disabled:cursor-not-allowed
          transition-colors duration-150
          mt-1
        "
      >
        <Plus className="w-3.5 h-3.5" />
        Dodaj opcję
        {question.options.length >= 10 && (
          <span className="text-zinc-300">(max 10)</span>
        )}
      </button>
    </div>
  );
}
