import { z } from "zod";
import { ForumCategory } from "./types";

export const COLLECTIONS = {
  users: "users",
  roles: "roles",
  interviewQuestions: "interview-questions",
  interviewSessions: "interview-sessions",
  interviewAnswers: "interview-answers",
  interviewTips: "interview-tips",
  interviewTipHelpfuls: "interview-tip-helpfuls",
  interviewTipViews: "interview-tip-views",
  forumPosts: "forum-posts",
  forumPostAnswers: "forum-post-answers",
  forumPostViews: "forum-post-views",
  forumPostVotes: "forum-post-votes",
  forumPostAnswerVotes: "forum-post-answer-votes",
};

export const InterviewSessionEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  questionScores: z.array(
    z.object({
      questionId: z.string(),
      score: z.number().min(0).max(100),
      feedback: z.string(),
      keyPoints: z.array(z.string()),
    }),
  ),
  categoryBreakdown: z.object({
    communication: z.number().min(0).max(100),
    relevance: z.number().min(0).max(100),
    structure: z.number().min(0).max(100),
    depth: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
  }),
  recommendations: z.array(z.string()),
});
export type TInterviewSessionEvaluation = z.infer<
  typeof InterviewSessionEvaluationSchema
>;

export const NUMBER_OF_QUESTIONS_PER_INTERVIEW_SESSION = 3;

export const INTERVIEW_TIP_CATEGORIES = [
  { value: "Preparation", label: "Preparation" },
  { value: "Communication", label: "Communication" },
  { value: "Technical", label: "Technical" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Body Language", label: "Body Language" },
  { value: "Follow-up", label: "Follow-up" },
  { value: "During Interview", label: "During Interview" },
  { value: "Common Questions", label: "Common Questions" },
];

export const forumCategories: ForumCategory[] = [
  {
    id: "general",
    name: "General Discussion",
    slug: "general",
    description:
      "General questions and discussions about interview preparation",
    icon: "MessageSquare",
    color: "from-blue-500 to-blue-600",
    postCount: 0,
  },
  {
    id: "behavioral",
    name: "Behavioral Interviews",
    slug: "behavioral",
    description:
      "Share experiences and ask about behavioral interview questions",
    icon: "Users",
    color: "from-purple-500 to-purple-600",
    postCount: 0,
  },
  {
    id: "technical",
    name: "Technical Interviews",
    slug: "technical",
    description:
      "Discuss coding challenges, system design, and technical topics",
    icon: "Code2",
    color: "from-emerald-500 to-emerald-600",
    postCount: 0,
  },
  {
    id: "company-specific",
    name: "Company Specific",
    slug: "company-specific",
    description: "Questions and tips specific to particular companies",
    icon: "Building2",
    color: "from-amber-500 to-amber-600",
    postCount: 0,
  },
  {
    id: "feedback",
    name: "Feedback & Tips",
    slug: "feedback",
    description: "Share interview feedback, tips, and success stories",
    icon: "Lightbulb",
    color: "from-rose-500 to-rose-600",
    postCount: 0,
  },
  {
    id: "resources",
    name: "Resources & Tools",
    slug: "resources",
    description: "Share useful resources, tools, and study materials",
    icon: "BookMarked",
    color: "from-indigo-500 to-indigo-600",
    postCount: 0,
  },
];
