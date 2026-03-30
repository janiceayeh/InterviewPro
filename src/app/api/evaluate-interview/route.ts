import { generateText, Output } from "ai";
import { z } from "zod";

const evaluationSchema = z.object({
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

export async function POST(
  req: Request,
  { params }: { params: { adminId: string } },
) {
  try {
    //     const { category, questions, answers } = await req.json()
    //     const questionsWithAnswers = questions.map(
    //       (q: { id: string; question: string }, index: number) => {
    //         const answer = answers.find((a: { questionId: string }) => a.questionId === q.id)
    //         return {
    //           id: q.id,
    //           question: q.question,
    //           answer: answer?.answer || 'No answer provided',
    //           timeSpent: answer?.timeSpent || 0,
    //         }
    //       }
    //     )
    //     const result = await generateText({
    //       model: 'anthropic/claude-sonnet-4',
    //       output: Output.object({
    //         schema: evaluationSchema,
    //       }),
    //       system: `You are an expert interview coach and evaluator. Analyze interview responses and provide detailed, constructive feedback. Be encouraging but honest. Score fairly based on:
    // - Communication clarity and articulation
    // - Relevance to the question asked
    // - Structure and organization of the response
    // - Depth of insight and examples provided
    // - Confidence and professionalism conveyed
    // For the ${category} interview category, focus on aspects specific to that type of interview.
    // IMPORTANT: For questionScores, use these exact questionIds: ${questionsWithAnswers.map((q: { id: string }) => q.id).join(', ')}`,
    //       prompt: `Evaluate the following ${category} interview responses:
    // ${questionsWithAnswers
    //   .map(
    //     (qa: { id: string; question: string; answer: string; timeSpent: number }, i: number) => `
    // Question ${i + 1} (ID: ${qa.id}): ${qa.question}
    // Answer: ${qa.answer}
    // Time spent: ${Math.floor(qa.timeSpent / 60)}m ${qa.timeSpent % 60}s
    // `
    //   )
    //   .join('\n')}
    // Provide a comprehensive evaluation including:
    // 1. An overall score (0-100)
    // 2. A brief summary of performance
    // 3. Key strengths demonstrated
    // 4. Areas for improvement
    // 5. Individual scores and feedback for each question (use the provided question IDs)
    // 6. Category breakdown scores for: communication, relevance, structure, depth, confidence
    // 7. Actionable recommendations for improvement`,
    //     })
    //     if (!result.output) {
    //       return new Response(JSON.stringify({ error: 'Failed to generate evaluation' }), {
    //         status: 500,
    //         headers: { 'Content-Type': 'application/json' },
    //       })
    //     }
    //     return new Response(JSON.stringify(result.output), {
    //       headers: { 'Content-Type': 'application/json' },
    //     })
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
