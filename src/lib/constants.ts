import { z } from "zod";

export const COLLECTIONS = {
  users: "users",
  roles: "roles",
  interviewQuestions: "interview-questions",
  interviewSessions: "interview-sessions",
  interviewAnswers: "interview-answers",
  interviewTips: "interview-tips",
  interviewTipHelpfuls: "interview-tip-helpfuls",
  interviewTipViews: "interview-tip-views",
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

export const NUMBER_OF_QUESTIONS_PER_INTERVIEW_SESSION = 5;

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
