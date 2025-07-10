
export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For RADIO and CHECKBOX
  required: boolean;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string; // user email
}

export interface Submission {
  id: string;
  formId: string;
  submittedBy: string; // user email
  answers: Record<string, string | string[]>; // question.id -> answer
  submittedAt: string;
}

export interface Checkin {
  id: string;
  submissionId: string;
  formId: string;
  participantName: string;
  checkinTime: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  email: string;
  role: 'admin' | 'user';
}
