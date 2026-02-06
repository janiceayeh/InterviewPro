export interface InterviewTip {
  id: string
  category: string
  title: string
  summary: string
  content: string
  keyTakeaways: string[]
  examples?: string[]
}

export const interviewTips: InterviewTip[] = [
  {
    id: 'tip-1',
    category: 'Preparation',
    title: 'Research the Company Thoroughly',
    summary: 'Understanding the company culture, values, and recent news can set you apart.',
    content: `Before any interview, invest time in understanding the company beyond just their products or services. Look into their mission statement, recent press releases, company culture, and any notable achievements or challenges they may be facing.

This knowledge demonstrates genuine interest and allows you to tailor your responses to align with what the company values. It also helps you prepare thoughtful questions that show you've done your homework.`,
    keyTakeaways: [
      'Review the company website, especially About Us and News sections',
      'Check recent news articles and press releases',
      'Look at their social media presence and employee reviews',
      'Understand their competitors and market position',
      'Note any recent achievements, challenges, or strategic initiatives',
    ],
    examples: [
      '"I noticed your company recently launched [initiative]. How does this role contribute to that goal?"',
      '"I was impressed by your commitment to sustainability mentioned in your annual report..."',
    ],
  },
  {
    id: 'tip-2',
    category: 'Preparation',
    title: 'Master the STAR Method',
    summary: 'Structure your behavioral answers using Situation, Task, Action, Result.',
    content: `The STAR method is a structured approach to answering behavioral interview questions. It helps you provide clear, concise, and compelling answers that demonstrate your capabilities.

STAR stands for:
- Situation: Set the context for your story
- Task: Describe what your responsibility was
- Action: Explain exactly what steps you took
- Result: Share the outcomes of your actions

Practice this method with various scenarios from your experience to be prepared for any behavioral question.`,
    keyTakeaways: [
      'Keep the Situation and Task portions brief (about 20% of your answer)',
      'Focus most of your time on the Action (about 60%)',
      'Quantify Results whenever possible',
      'Practice with common behavioral questions',
      'Have 5-7 versatile stories that can answer multiple question types',
    ],
    examples: [
      'Situation: "In my previous role, our team faced a 30% budget cut mid-project..."',
      'Action: "I took the initiative to... I collaborated with... I implemented..."',
      'Result: "As a result, we delivered the project on time and under the reduced budget by 15%."',
    ],
  },
  {
    id: 'tip-3',
    category: 'During Interview',
    title: 'Ask Thoughtful Questions',
    summary: 'Your questions reveal your interest level and critical thinking abilities.',
    content: `The questions you ask at the end of an interview are just as important as the answers you give. They demonstrate your genuine interest in the role and company, and show that you think critically about your career decisions.

Prepare at least 5-7 questions, as some may be answered during the interview. Focus on questions that show you're thinking about how you can contribute and grow in the role.`,
    keyTakeaways: [
      'Avoid questions easily answered by the website',
      'Ask about team dynamics and company culture',
      'Inquire about success metrics for the role',
      'Show interest in professional development opportunities',
      'Ask about challenges the team is currently facing',
    ],
    examples: [
      '"What does success look like in this role after the first 90 days?"',
      '"How would you describe the team culture and collaboration style?"',
      '"What are the biggest challenges the team is currently tackling?"',
    ],
  },
  {
    id: 'tip-4',
    category: 'During Interview',
    title: 'Handle Salary Questions Strategically',
    summary: 'Navigate compensation discussions without underselling yourself.',
    content: `Salary negotiations can be one of the most uncomfortable parts of the interview process. The key is to be prepared, know your worth, and approach the conversation professionally.

Research salary ranges for the role in your area using sites like Glassdoor, LinkedIn, and industry reports. When possible, try to delay specific numbers until you have a better understanding of the full compensation package and role responsibilities.`,
    keyTakeaways: [
      'Research market rates before the interview',
      'If asked early, try to defer: "I\'d like to learn more about the role first"',
      'When giving a range, start slightly above your target',
      'Consider total compensation, not just base salary',
      'Never lie about current compensation',
    ],
    examples: [
      '"Based on my research and experience, I\'m targeting a range of $X-$Y, but I\'m open to discussing based on the total compensation package."',
      '"I\'d prefer to understand the full scope of the role before discussing specific numbers. What range did you have budgeted for this position?"',
    ],
  },
  {
    id: 'tip-5',
    category: 'Body Language',
    title: 'Project Confidence Through Body Language',
    summary: 'Non-verbal cues can be as impactful as your verbal responses.',
    content: `Your body language communicates just as much as your words. Confident, open body language can reinforce your verbal messages and create a positive impression, while nervous habits can undermine even the best answers.

Practice maintaining good posture, making appropriate eye contact, and using natural hand gestures. Be aware of nervous habits like fidgeting or crossed arms that might send the wrong message.`,
    keyTakeaways: [
      'Maintain good posture - sit up straight but relaxed',
      'Make regular eye contact without staring',
      'Use natural hand gestures to emphasize points',
      'Avoid crossing arms or other defensive postures',
      'Mirror the interviewer\'s energy level appropriately',
    ],
    examples: [
      'Lean slightly forward when the interviewer is speaking to show engagement',
      'Nod occasionally to show you are actively listening',
      'Smile naturally when appropriate, especially when greeting and departing',
    ],
  },
  {
    id: 'tip-6',
    category: 'Follow-Up',
    title: 'Send a Memorable Thank-You Note',
    summary: 'A well-crafted follow-up can reinforce your candidacy.',
    content: `A thank-you note is not just a formality—it's an opportunity to reinforce your interest, address anything you may have missed, and stand out from other candidates. Send it within 24 hours of your interview.

Personalize each note to reference specific conversations or topics discussed. This shows you were engaged and helps the interviewer remember your conversation positively.`,
    keyTakeaways: [
      'Send within 24 hours of the interview',
      'Reference specific topics from your conversation',
      'Reiterate your interest and enthusiasm',
      'Keep it concise - 3-4 short paragraphs',
      'Proofread carefully before sending',
    ],
    examples: [
      '"I particularly enjoyed our discussion about the upcoming product launch and how this role would contribute to its success."',
      '"Our conversation reinforced my enthusiasm for this opportunity, especially the emphasis on innovation and cross-functional collaboration."',
    ],
  },
  {
    id: 'tip-7',
    category: 'Common Questions',
    title: 'Answer "Tell Me About Yourself" Effectively',
    summary: 'Craft a compelling 2-minute pitch that sets the tone for the interview.',
    content: `This common opening question is your chance to make a strong first impression. Your answer should be a concise, well-structured summary of your professional background that's relevant to the role you're interviewing for.

Think of it as your "elevator pitch" - a 2-minute overview that highlights your most relevant experiences, skills, and what makes you a great fit for this specific opportunity.`,
    keyTakeaways: [
      'Keep it to 2 minutes or less',
      'Focus on professional background, not personal life',
      'Highlight experiences relevant to the role',
      'End with why you\'re excited about this opportunity',
      'Practice until it feels natural, not rehearsed',
    ],
    examples: [
      'Present-Past-Future format: Start with your current role, highlight relevant past experiences, and express enthusiasm for the future opportunity',
      '"I\'m currently a [role] at [company] where I [key responsibility]. Before that, I [relevant experience]. I\'m excited about this role because [connection to their needs]."',
    ],
  },
  {
    id: 'tip-8',
    category: 'Common Questions',
    title: 'Turn Weaknesses Into Strengths',
    summary: 'Frame weaknesses as areas of growth with concrete improvement actions.',
    content: `When asked about weaknesses, interviewers want to see self-awareness and a growth mindset. The key is to be honest about a real weakness while demonstrating that you're actively working to improve.

Choose a genuine weakness that isn't critical to the role, explain the steps you're taking to address it, and if possible, share measurable progress you've made.`,
    keyTakeaways: [
      'Choose a real weakness, not a humble-brag',
      'Avoid weaknesses critical to the role',
      'Focus on what you\'re doing to improve',
      'Share specific examples of progress',
      'Keep the answer brief and move forward positively',
    ],
    examples: [
      '"I\'ve historically struggled with public speaking. I joined Toastmasters last year and have since led three team presentations, which helped me become more comfortable."',
      '"I tend to be overly detail-oriented, which can slow me down. I\'ve learned to set time limits for tasks and ask myself if the extra detail adds meaningful value."',
    ],
  },
]

export const tipCategories = [
  { id: 'all', label: 'All Tips' },
  { id: 'Preparation', label: 'Preparation' },
  { id: 'During Interview', label: 'During Interview' },
  { id: 'Body Language', label: 'Body Language' },
  { id: 'Follow-Up', label: 'Follow-Up' },
  { id: 'Common Questions', label: 'Common Questions' },
]
