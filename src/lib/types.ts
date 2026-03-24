export interface GetInterviewQuestions {
  interviewCategory: string;
  userField: string;
  userRole: string;
}

export interface UserProfile {
  createdAt: string;
  email: string;
  field: string;
  firstname: string;
  lastname: string;
  role: string;
  lastAnsweredQuestionId: string | undefined;
  id: string;
}

export interface Question {
  id: string;
  question: string;
  category: string;
  timeLimit: number; // in seconds
  tips: string[];
}
