export const routes = {
  home: () => "/",
  userLogin: () => "/login",
  dashboard: () => "/dashboard",
  mockInterview: () => "/dashboard/mock-interview",
  forum: () => "/dashboard/forum",
  newForumPost: () => "/dashboard/forum/new",
  editForumPost: ({ postId }: { postId: string }) =>
    `/dashboard/forum/edit/${postId}`,
  forumPost: ({ postId }: { postId: string }) =>
    `/dashboard/forum/posts/${postId}`,
  mockInterviewHistory: () => "/dashboard/mock-interview/history",
  mockInterviewSession: ({
    category,
    interviewSessionId,
  }: {
    category: string;
    interviewSessionId: string;
  }) => `/dashboard/mock-interview/${category}/${interviewSessionId}`,
  mockInterviewResults: ({
    category,
    interviewSessionId,
  }: {
    category: string;
    interviewSessionId: string;
  }) => `/dashboard/mock-interview/${category}/${interviewSessionId}/results`,
  copilot: () => "/dashboard/copilot",
  tips: () => "/dashboard/tips",
  adminDashboard: () => "/admin/dashboard",
  adminResetPassword: () => "/admin/reset-password",
  adminLogin: () => "/admin/login",
  adminInterviewQuestions: () => "/admin/interview-questions",
  adminTips: () => "/admin/tips",
  adminUsers: () => "/admin/users",
  adminForumModeration: () => "/admin/forum-moderation",
  adminForumPostAnswers: ({ postId }: { postId: string }) =>
    `/admin/forum-moderation/${postId}/answers`,
  adminFeedback: () => "/admin/feedback",
  adminSettings: () => "/admin/settings",
  api: {
    evaluateInterview: ({
      category,
      interviewSessionId,
    }: {
      category: string;
      interviewSessionId: string;
    }) => `/api/evaluate-interview/${category}/${interviewSessionId}`,
    copilot: () => "/api/copilot",
    isAdmin: ({ email }: { email: string }) => `/api/users/${email}/is-admin`,
  },
};
