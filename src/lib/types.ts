import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { TInterviewSessionEvaluation } from "./constants";

//collections

export interface UserProfile {
  id: string;
  createdAt: Timestamp;
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
  roles: string[]; // The user roles which the question applies to
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

export interface InterviewTip {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  keyTakeaways: string[];
  examples: string[];
  viewsCount?: number;
  helpfulCount: number | null;
  status: "draft" | "published";
  createdAt: Timestamp;
}

export interface InterviewTipHelpful {
  id: string;
  userId: string;
  tipId: string;
  isHelpful: boolean | null;
  createdAt: Timestamp;
}

export interface InterviewTipView {
  id: string;
  userId: string;
  tipId: string;
  createdAt: Timestamp;
}

export interface IndustryRole {
  category: string;
  roles: string[]; //array of string type
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string; // User ID of the author
  views: number;
  votes: number;
  answers: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isAnswered: boolean;
  isPinned: boolean;
  isLocked: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

export interface ForumAnswer {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  votes: number;
  replies: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isAccepted: boolean;
}

export interface ForumPostViews {
  id: string;
  createdAt: Timestamp;
  userId: string;
  postId: string;
}

export interface ForumPostVotes {
  id: string;
  createdAt: Timestamp;
  userId: string;
  postId: string;
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

export type ForumPostSortBy = "recent" | "popular" | "unanswered";
