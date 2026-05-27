export type QuestionType = "single" | "multiple";

export interface PollOption {
  id: string;
  text: string;
}

export interface PollQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: PollOption[];
}

export interface Poll {
  id: string;
  publicId: string;
  adminId: string;
  title: string;
  questions: PollQuestion[];
  isActive: boolean;
  resultsVisible: boolean;
  createdAt: string;
  totalVotes: number;
}

export interface PollOptionDraft {
  id: string;
  text: string;
}

export interface PollQuestionDraft {
  id: string;
  text: string;
  type: QuestionType;
  options: PollOptionDraft[];
}

export interface PollFormData {
  title: string;
  questions: PollQuestionDraft[];
}
