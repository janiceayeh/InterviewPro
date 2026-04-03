import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { TInterviewSessionEvaluation } from "./constants";

//collections

export interface UserProfile {
  createdAt: string;
  email: string;
  field: string;
  firstname: string;
  lastname: string;
  role: string;
  lastAnsweredQuestionId: string | undefined;
  interviewSessionsCompleted: number | undefined;
  totalPractiseTime: number | undefined; // in seconds
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: "technical" | "situational" | "general" | "behavioral";
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // in seconds
  tips: string[];
  status: "draft" | "published";
  createdAt: Timestamp;
}

export interface InterviewAnswer {
  id: string;
  questionId: string;
  answer: string | undefined;
  userId: string;
  interviewCategory: string;
  timeSpent: number; // time spent on the question in seconds to calculate progress,
  interviewSessionId: string;
  createdAt: Timestamp;
}

export interface InterviewSession {
  id: string;
  userId: string;
  totalScore: number | undefined;
  totalTimeSpent: number; // total time spent on the interview session.
  interviewCategory: string;
  createdAt: Timestamp;
  isCompleted: boolean;
  evaluation: TInterviewSessionEvaluation | null;
}

// ------------

export interface InterviewSessionQA {
  questionId: string;
  answerId: string;
  interviewSessionId: string;
  question: string;
  answer: string;
  timeSpent: number;
  interviewCategory: string;
}

export type AdminRole = "super-admin" | "content-manager" | "moderator";

export type PaginatedDocsResult<T> = {
  items: T[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
};

export type IsAdminResponseDto = {
  isAdmin: boolean;
  role: AdminRole;
};

export type ApiResponse<D> = {
  data: D | null;
  error: string | null;
};
