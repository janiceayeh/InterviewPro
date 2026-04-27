import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { TInterviewSessionEvaluation } from "./constants";
import { UIDataTypes, UIMessage, UITools } from "ai";

//collections

export interface UserProfile {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  email: string;
  field: string;
  firstname: string;
  lastname: string;
  role: string;
  interviewSessionsCompleted: number | undefined;
  totalPractiseTime: number | undefined; // in seconds
  about?: string;
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
  status: "draft" | "published";
  createdAt: Timestamp;
  helpfulCount?: number; // not a doc field but a derived one.
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isAnswered: boolean;
  hasAcceptedAnswer: boolean;
  isEdited?: boolean;
}

export interface ForumPostFlag {
  id: string;
  createdAt: Timestamp;
  userId: string;
  postId: string;
  flagCategory: string;
  flagValue: string; //value of the flag object
}

export interface ForumPostAnswer {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isAccepted: boolean;
  isEdited: boolean;
}

export interface ForumPostAnswerFlag {
  id: string;
  createdAt: Timestamp;
  userId: string;
  answerId: string;
  flagCategory: string;
  flagValue: string; //value of the flag object
}

export interface ForumPostView {
  id: string;
  createdAt: Timestamp;
  userId: string;
  postId: string;
}

export interface ForumPostVote {
  id: string;
  createdAt: Timestamp;
  userId: string;
  postId: string;
  voteType: "upvote" | "downvote";
}

export interface ForumPostAnswerVote {
  id: string;
  createdAt: Timestamp;
  userId: string;
  answerId: string;
  voteType: "upvote" | "downvote";
}

export interface StudentPersonalisedAnalytics {
  id?: string;
  overallReadinessScore: number;
  totalInterviewsTaken: number;
  averageScore: number;
  categoryScores: Record<string, { average: number; count: number }>;
  progressTrend: Array<{ date: string; score: number }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    actionItems: string[];
  }>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
}

export interface UserLastAnsweredInterviewQuestion {
  id: string;
  userId: string;
  questionCategory: string;
  questionId: string;
  createdAt: Timestamp;
}

export interface CopilotChat {
  userId: string;
  title: string;
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  messageCount: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  id: string;
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
export type ForumPostAnswerSortBy = "recent" | "accepted" | "relevant";
export type ForumFlagsOptions = {
  flagType: "post" | "answer";
  id: string;
};

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
}

export type DeleteUserResponseDto = {
  ok: boolean;
};

export type StudentPersonalisedEvaluationResponseDto = {
  evaluation: StudentPersonalisedAnalytics | null;
};

export type SaveCopilotChatResponseDto = {
  chat: CopilotChat | null;
};

export interface SaveCopilotChatRequestDto {
  chatId?: string;
  title: string;
  messages: UIMessage[];
}

export interface GetCopilotChatHistoryResponseDto {
  chatHistory: CopilotChat[] | null;
}

export interface DeleteCopilotChatResponseDto {
  success: boolean;
}

export interface EvaluateInterviewResponseDto {
  evaluation: TInterviewSessionEvaluation;
}
