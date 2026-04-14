import { z } from "zod";
import { ForumCategory, StudentPersonalisedAnalytics } from "./types";

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
  forumPostFlags: "forum-post-flags",
  forumPostAnswerFlags: "forum-post-answer-flags",
  studentPersonalisedAnalytics: "student-personalised-analytics",
  userLastAnsweredInterviewQuestions: "user-last-answered-interview-questions",
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

export const FORUM_POST_FLAGS = [
  {
    category: "Content policy violations",
    items: [
      {
        category: "Content policy violations",
        label: "Spam",
        value: "spam",
        description: "Unsolicited, repetitive, or promotional content",
      },
      {
        category: "Content policy violations",
        label: "Self-promotion",
        value: "self_promotion",
        description:
          "Excessive promotion of a product, service, or personal project",
      },
      {
        category: "Content policy violations",
        label: "Copyright infringement",
        value: "copyright_infringement",
        description: "Reposting copyrighted material without permission",
      },
      {
        category: "Content policy violations",
        label: "Misinformation",
        value: "misinformation",
        description: "False or misleading factual claims",
      },
    ],
  },
  {
    category: "Safety & abuse",
    items: [
      {
        category: "Safety & abuse",
        label: "Hate speech",
        value: "hate_speech",
        description: "Attacks or demeaning language against a protected group",
      },
      {
        category: "Safety & abuse",
        label: "Harassment / bullying",
        value: "harassment",
        description: "Targeted insults, threats, or doxxing",
      },
      {
        category: "Safety & abuse",
        label: "Violent content",
        value: "violent_content",
        description: "Graphic violence or threats of harm",
      },
      {
        category: "Safety & abuse",
        label: "Sexual content",
        value: "sexual_content",
        description: "Explicit sexual material or sexual solicitation",
      },
      {
        category: "Safety & abuse",
        label: "Child sexual content",
        value: "child_sexual_content",
        description: "Sexual content involving minors — remove immediately",
      },
    ],
  },
  {
    category: "Legal & privacy",
    items: [
      {
        category: "Legal & privacy",
        label: "Illicit behavior",
        value: "illicit_behavior",
        description:
          "Instructions or facilitation of illegal activity (drugs, hacking, etc.)",
      },
      {
        category: "Legal & privacy",
        label: "Privacy violation",
        value: "privacy_violation",
        description: "Sharing private/personal information without consent",
      },
      {
        category: "Legal & privacy",
        label: "Defamation",
        value: "defamation",
        description: "False statements harming someone's reputation",
      },
    ],
  },
  {
    category: "Quality & relevance",
    items: [
      {
        category: "Quality & relevance",
        label: "Off-topic",
        value: "off_topic",
        description: "Not related to the forum's subject",
      },
      {
        category: "Quality & relevance",
        label: "Low-effort / gibberish",
        value: "low_effort",
        description:
          "Unreadable, nonsensical, or extremely short without value",
      },
      {
        category: "Quality & relevance",
        label: "Duplicate",
        value: "duplicate",
        description: "Repeats an existing thread or post",
      },
      {
        category: "Quality & relevance",
        label: "Misplaced content",
        value: "misplaced_content",
        description: "Belongs in another forum or category",
      },
    ],
  },
  {
    category: "Formatting & usability",
    items: [
      {
        category: "Formatting & usability",
        label: "Broken links / attachments",
        value: "broken_links",
        description: "Linked resources are dead or attachments are corrupted",
      },
      {
        category: "Formatting & usability",
        label: "Spammy formatting",
        value: "spammy_formatting",
        description: "Excessive emojis, ALL CAPS, or repeated characters",
      },
      {
        category: "Formatting & usability",
        label: "Needs clarification",
        value: "needs_clarification",
        description: "Unclear or missing critical details; request to edit",
      },
    ],
  },
];

// {
//   category: "Action",
//   items: [
//     {
//       category: "Action",
//       label: "Needs review",
//       value: "needs_review",
//       description: "Requires moderator attention",
//     },
//     {
//       category: "Action",
//       label: "Remove immediately",
//       value: "remove_immediately",
//       description:
//         "Urgent removal required (e.g., threats, child sexual content)",
//     },
//     {
//       category: "Action",
//       label: "Warn user",
//       value: "warn_user",
//       description: "User should receive a warning",
//     },
//     {
//       category: "Action",
//       label: "Temporary suspension",
//       value: "temporary_suspension",
//       description: "Recommend short-term account suspension",
//     },
//     {
//       category: "Action",
//       label: "Permanent ban",
//       value: "permanent_ban",
//       description: "Recommend account termination",
//     },
//   ],
// },

export const DEFAULT_STUDENT_PERSONALISED_ANALYTICS: StudentPersonalisedAnalytics =
  {
    userId: "",
    overallReadinessScore: 0,
    totalInterviewsTaken: 0,
    averageScore: 0,
    categoryScores: {},
    progressTrend: [],
    recommendations: [
      {
        title: "Get Started with Your First Interview",
        description:
          "Take your first mock interview to begin tracking your progress.",
        priority: "high" as const,
        actionItems: [
          "Start a behavioral interview",
          "Try a technical interview",
          "Practice with the AI copilot",
        ],
      },
    ],
  };
