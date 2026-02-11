export interface Question {
  id: string
  question: string
  category: string
  timeLimit: number // in seconds
  tips: string[]
}

export const interviewQuestions: Record<string, Question[]> = {
  behavioral: [
    {
      id: 'beh-1',
      question: 'Tell me about a time when you had to deal with a difficult team member. How did you handle it?',
      category: 'behavioral',
      timeLimit: 120,
      tips: ['Use the STAR method', 'Focus on the resolution', 'Show emotional intelligence'],
    },
    {
      id: 'beh-2',
      question: 'Describe a situation where you had to meet a tight deadline. What was your approach?',
      category: 'behavioral',
      timeLimit: 120,
      tips: ['Highlight prioritization skills', 'Mention time management', 'Share the outcome'],
    },
    {
      id: 'beh-3',
      question: 'Give an example of a goal you reached and tell me how you achieved it.',
      category: 'behavioral',
      timeLimit: 120,
      tips: ['Be specific about the goal', 'Explain your strategy', 'Quantify results if possible'],
    },
    {
      id: 'beh-4',
      question: 'Tell me about a time you failed. How did you deal with it?',
      category: 'behavioral',
      timeLimit: 120,
      tips: ['Be honest about the failure', 'Focus on lessons learned', 'Show growth mindset'],
    },
    {
      id: 'beh-5',
      question: 'Describe a situation where you had to persuade someone to see things your way.',
      category: 'behavioral',
      timeLimit: 120,
      tips: ['Show communication skills', 'Demonstrate empathy', 'Explain your reasoning'],
    },
  ],
  technical: [
    {
      id: 'tech-1',
      question: 'Explain the concept of RESTful APIs and their key principles.',
      category: 'technical',
      timeLimit: 150,
      tips: ['Cover HTTP methods', 'Explain statelessness', 'Mention best practices'],
    },
    {
      id: 'tech-2',
      question: 'What is the difference between SQL and NoSQL databases? When would you use each?',
      category: 'technical',
      timeLimit: 150,
      tips: ['Compare structures', 'Discuss scalability', 'Give use case examples'],
    },
    {
      id: 'tech-3',
      question: 'Describe the process you follow when debugging a complex issue.',
      category: 'technical',
      timeLimit: 120,
      tips: ['Explain systematic approach', 'Mention tools you use', 'Share an example'],
    },
    {
      id: 'tech-4',
      question: 'What are design patterns and can you explain one you have used?',
      category: 'technical',
      timeLimit: 150,
      tips: ['Define design patterns', 'Explain benefits', 'Give practical example'],
    },
    {
      id: 'tech-5',
      question: 'How do you ensure code quality in your projects?',
      category: 'technical',
      timeLimit: 120,
      tips: ['Mention testing strategies', 'Discuss code reviews', 'Talk about documentation'],
    },
  ],
  situational: [
    {
      id: 'sit-1',
      question: 'If you discovered a critical bug just before a major release, what would you do?',
      category: 'situational',
      timeLimit: 120,
      tips: ['Assess impact first', 'Communicate with stakeholders', 'Propose solutions'],
    },
    {
      id: 'sit-2',
      question: 'How would you handle a situation where your manager disagrees with your approach?',
      category: 'situational',
      timeLimit: 120,
      tips: ['Show respect for authority', 'Explain your reasoning', 'Be open to feedback'],
    },
    {
      id: 'sit-3',
      question: 'Imagine you are assigned to a project with unclear requirements. How would you proceed?',
      category: 'situational',
      timeLimit: 120,
      tips: ['Ask clarifying questions', 'Document assumptions', 'Iterate with stakeholders'],
    },
    {
      id: 'sit-4',
      question: 'What would you do if a colleague was not contributing equally to a team project?',
      category: 'situational',
      timeLimit: 120,
      tips: ['Address privately first', 'Seek to understand', 'Escalate if necessary'],
    },
    {
      id: 'sit-5',
      question: 'How would you prioritize multiple urgent tasks from different stakeholders?',
      category: 'situational',
      timeLimit: 120,
      tips: ['Assess business impact', 'Communicate transparently', 'Negotiate deadlines'],
    },
  ],
  general: [
    {
      id: 'gen-1',
      question: 'Tell me about yourself and why you are interested in this role.',
      category: 'general',
      timeLimit: 90,
      tips: ['Keep it professional', 'Highlight relevant experience', 'Show enthusiasm'],
    },
    {
      id: 'gen-2',
      question: 'Where do you see yourself in 5 years?',
      category: 'general',
      timeLimit: 90,
      tips: ['Be realistic', 'Align with company growth', 'Show ambition'],
    },
    {
      id: 'gen-3',
      question: 'What are your greatest strengths and weaknesses?',
      category: 'general',
      timeLimit: 120,
      tips: ['Be honest about weaknesses', 'Show self-awareness', 'Mention improvement efforts'],
    },
    {
      id: 'gen-4',
      question: 'Why are you leaving your current position?',
      category: 'general',
      timeLimit: 90,
      tips: ['Stay positive', 'Focus on growth', 'Avoid negativity about previous employer'],
    },
    {
      id: 'gen-5',
      question: 'What motivates you in your work?',
      category: 'general',
      timeLimit: 90,
      tips: ['Be authentic', 'Connect to the role', 'Give specific examples'],
    },
  ],
}
