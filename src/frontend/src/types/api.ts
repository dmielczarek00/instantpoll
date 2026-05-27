import type { PollFormData } from "./poll";

export type { Poll, PollQuestion, PollOption, QuestionType } from "./poll";

export interface QuestionResult {
  questionId: string;
  questionText: string;
  type: "single" | "multiple";
  totalAnswers: number;
  options: OptionResult[];
}

export interface OptionResult {
  optionId: string;
  optionText: string;
  votes: number;
  percentage: number;
}

export interface PollResults {
  publicId: string;
  title: string;
  totalVotes: number;
  resultsVisible: boolean;
  questions: QuestionResult[];
}

export interface CastVoteRequest {
  publicId: string;
  fingerprint: string;
  answers: Array<{
    questionId: string;
    optionIds: string[];
  }>;
}

export interface AdminPollData {
  poll: import("./poll").Poll;
  results: PollResults;
  publicUrl: string;
  adminUrl: string;
}

export interface UpdatePollSettingsRequest {
  isActive?: boolean;
  resultsVisible?: boolean;
  title?: string;
}

export interface CreatePollRequest {
  title: string;
  questions: Array<{
    text: string;
    type: "single" | "multiple";
    options: Array<{ text: string }>;
  }>;
}

export interface CreatePollResponse {
  poll: import("./poll").Poll;
  publicUrl: string;
  adminUrl: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export function toCreatePollRequest(form: PollFormData): CreatePollRequest {
  return {
    title: form.title,
    questions: form.questions.map((q) => ({
      text: q.text,
      type: q.type,
      options: q.options.map((o) => ({ text: o.text })),
    })),
  };
}