import { COLLECTIONS, InterviewSessionEvaluationSchema } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { dbAdmin } from "@/lib/firebase-admin";
import {
  InterviewAnswer,
  InterviewQuestion,
  InterviewSession,
  InterviewSessionQA,
} from "@/lib/types";
import { generateText, Output } from "ai";
import { doc, updateDoc } from "firebase/firestore";
import { z } from "zod";

const requestDto = z.object({
  userId: z.string().min(1),
});

async function interviewSessionGetAnswers({
  interviewSessionId,
  userId,
}: {
  userId: string;
  interviewSessionId: string;
}) {
  try {
    const interviewSessionAnswersSnapshot = await dbAdmin
      .collection(COLLECTIONS.interviewAnswers)
      .where("interviewSessionId", "==", interviewSessionId)
      .where("userId", "==", userId)
      .get();

    const interviewSessionAnswers = interviewSessionAnswersSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }),
    ) as InterviewAnswer[];

    return ["ok", interviewSessionAnswers];
  } catch (error) {
    return ["error", error];
  }
}

async function interviewSessionGetQuestions(
  partialInterviewSessionQA: {
    questionId: string;
    answer: string;
    timeSpent: number;
  }[],
) {
  try {
    const interviewQuestionsSnapShot = await dbAdmin.getAll(
      ...partialInterviewSessionQA.map((q) =>
        dbAdmin.doc(`${COLLECTIONS.interviewQuestions}/${q.questionId}`),
      ),
    );

    const interviewQuestions = interviewQuestionsSnapShot
      .filter((s) => s.exists)
      .map((s) => ({ id: s.id, ...s.data() }));

    return ["ok", interviewQuestions];
  } catch (error) {
    return ["error", error];
  }
}

async function updateInterviewSession(
  interviewSessionId: string,
  data: Partial<InterviewSession>,
) {
  return updateDoc(
    doc(db, COLLECTIONS.interviewSessions, interviewSessionId),
    data,
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ category: string; session_id: string }> },
) {
  try {
    const body = await req.json();
    const { error, success, data: dto } = requestDto.safeParse(body);

    if (!success) {
      return Response.json(
        {
          errors: error,
          message: "Invalid request body",
        },
        { status: 400 },
      );
    }

    const { category, session_id: interviewSessionId } = await params;

    const [interviewSessionGetAnswersStatus, interviewSessionGetAnswersData] =
      await interviewSessionGetAnswers({
        interviewSessionId,
        userId: dto.userId,
      });
    if (interviewSessionGetAnswersStatus === "error") {
      return Response.json(
        {
          errors: interviewSessionGetAnswersData,
          message: "Failed to load interview session answers",
        },
        { status: 500 },
      );
    }

    const interviewAnswers =
      interviewSessionGetAnswersData as InterviewAnswer[];
    const partialInterviewSessionQA = interviewAnswers.map(
      (a) =>
        ({
          questionId: a.questionId,
          answerId: a.id,
          answer: a.answer,
          timeSpent: a.timeSpent,
        }) satisfies Partial<InterviewSessionQA>,
    );

    const [
      interviewSessionGetQuestionsStatus,
      interviewSessionGetQuestionsData,
    ] = await interviewSessionGetQuestions(partialInterviewSessionQA);
    if (interviewSessionGetQuestionsStatus === "error") {
      return Response.json({
        errors: interviewSessionGetQuestionsData,
        message: "Failed to load interview session questions",
      });
    }

    const interviewQuestions =
      interviewSessionGetQuestionsData as InterviewQuestion[];

    const interviewSessionQA: InterviewSessionQA[] =
      partialInterviewSessionQA.map(
        ({ answer, questionId, timeSpent, answerId }) => {
          const question = interviewQuestions.find((q) => q.id === questionId);

          return {
            questionId: questionId,
            answerId: answerId,
            interviewSessionId: interviewSessionId,
            question: question.question,
            answer: answer,
            timeSpent: timeSpent,
            interviewCategory: category,
          };
        },
      );
    console.log({ interviewSessionQA }); //TODO: Next, pass this data to the AI

    const result = await generateText({
      model: "anthropic/claude-sonnet-4",
      output: Output.object({
        schema: InterviewSessionEvaluationSchema,
      }),
      system: `You are an expert interview coach and evaluator. Analyze interview responses and provide detailed, constructive feedback. Be encouraging but honest. Score fairly based on:
    - Communication clarity and articulation
    - Relevance to the question asked
    - Structure and organization of the response
    - Depth of insight and examples provided
    - Confidence and professionalism conveyed

    For the ${category} interview category, focus on aspects specific to that type of interview.

    IMPORTANT: For questionScores, use these exact questionIds: ${interviewSessionQA.map((qa) => qa.questionId).join(", ")}`,
      prompt: `Evaluate the following ${category} interview responses:

    ${interviewSessionQA
      .map(
        (qa, i: number) => `
    Question ${i + 1} (ID: ${qa.questionId}): ${qa.question}
    Answer: (ID: ${qa.answerId}): ${qa.answer}
    Time spent: ${Math.floor(qa.timeSpent / 60)}m ${qa.timeSpent % 60}s
    `,
      )
      .join("\n")}

    Provide a comprehensive evaluation including:
    1. An overall score (0-100)
    2. A brief summary of performance
    3. Key strengths demonstrated
    4. Areas for improvement
    5. Individual scores and feedback for each question (use the provided question IDs)
    6. Category breakdown scores for: communication, relevance, structure, depth, confidence
    7. Actionable recommendations for improvement`,
    });

    if (!result.output) {
      throw new Error("Failed to evaluate interview session");
    }

    // Reinsert the question into the question scores list
    result.output.questionScores = result.output.questionScores.map((qs) => ({
      ...qs,
      question: interviewSessionQA.find((qa) => qa.questionId === qs.questionId)
        ?.question,
    }));

    // Save interview session evaluation
    await updateInterviewSession(interviewSessionId, {
      totalScore: result.output.overallScore,
      evaluation: result.output,
    });

    return Response.json(result.output);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
