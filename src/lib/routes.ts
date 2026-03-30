export const routes = {
  home: () => "/",
  dashboard: () => "/dashboard",
  mockInterview: () => "/dashboard/mock-interview",
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
  api: {
    evaluateInterview: ({
      category,
      interviewSessionId,
    }: {
      category: string;
      interviewSessionId: string;
    }) => `/api/evaluate-interview/${category}/${interviewSessionId}`,
  },
};
