import { COLLECTIONS } from "@/lib/constants";
import { db, auth } from "@/lib/firebase";
import { dbAdmin, verifyLoggedInUser } from "@/lib/firebase-admin";
import {
  ApiResponse,
  InterviewSession,
  StudentPersonalisedAnalytics,
  StudentPersonalisedEvaluationResponseDto,
} from "@/lib/types";
import { generateText, Output } from "ai";
import { z } from "zod";
import { DEFAULT_STUDENT_PERSONALISED_ANALYTICS } from "@/lib/constants";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase/firestore";

const defaultEvaluation: StudentPersonalisedAnalytics =
  DEFAULT_STUDENT_PERSONALISED_ANALYTICS;

const recommendationSchema = z.object({
  recommendations: z
    .array(
      z.object({
        title: z.string().describe("Specific, actionable recommendation title"),
        description: z
          .string()
          .describe("Detailed explanation of why this recommendation matters"),
        priority: z
          .enum(["high", "medium", "low"])
          .describe("Priority level based on impact"),
        actionItems: z
          .array(z.string())
          .describe("Specific, concrete action steps (3-4 items)"),
      }),
    )
    .min(1)
    .max(4),
});

export async function GET(req: Request): Promise<Response> {
  try {
    const { headers } = req;
    const userId = headers.get("uid");
    const idToken = headers.get("authorization");

    const { error, ok, isLoggedIn } = await verifyLoggedInUser({
      userId,
      idToken,
    });

    if (error) {
      return Response.json(
        {
          error: error.message,
          data: {
            evaluation: null,
          },
        } satisfies ApiResponse<StudentPersonalisedEvaluationResponseDto>,
        {
          status: 401,
        },
      );
    }

    if (ok && !isLoggedIn) {
      return Response.json(
        {
          error: "Unauthorized",
          data: {
            evaluation: null,
          },
        } satisfies ApiResponse<StudentPersonalisedEvaluationResponseDto>,
        {
          status: 401,
        },
      );
    }

    // Fetch all interview sessions by user
    const inteviewSessionsSnap = await dbAdmin
      .collection(COLLECTIONS.interviewSessions)
      .where("userId", "==", userId)
      .where("isCompleted", "==", true)
      .where("evaluation", "!=", null)
      .orderBy("createdAt", "desc")
      .get();

    if (inteviewSessionsSnap.empty) {
      defaultEvaluation.userId = userId;
      return Response.json(
        {
          data: {
            evaluation: defaultEvaluation,
          },
          error: null,
        } satisfies ApiResponse<StudentPersonalisedEvaluationResponseDto>,
        { status: 200 },
      );
    }

    const interviewSessions = inteviewSessionsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as InterviewSession[];

    const totalInterviewsTaken = interviewSessions.length;

    // Calculate category scores
    const categoryScores: Record<string, { scores: number[]; count: number }> =
      {};

    for (const interview of interviewSessions) {
      const category = interview.interviewCategory;
      if (!categoryScores[category]) {
        categoryScores[category] = { scores: [], count: 0 };
      }
      categoryScores[category].scores.push(interview.evaluation?.overallScore);
      categoryScores[category].count += 1;
    }

    const categoryAverages = Object.entries(categoryScores).reduce(
      (acc, [category, data]) => {
        const average =
          data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        acc[category] = { average: Math.round(average), count: data.count };
        return acc;
      },
      {} as Record<string, { average: number; count: number }>,
    );

    // Calculate overall readiness score (weighted)
    const averageScore = Math.round(
      interviewSessions.reduce(
        (sum, i) => sum + i.evaluation?.overallScore,
        0,
      ) / totalInterviewsTaken,
    );

    // Practice frequency (score if practiced recently)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPractice = interviewSessions.filter(
      (i) => i.createdAt.toDate() > thirtyDaysAgo,
    ).length;
    const frequencyScore = Math.min(100, (recentPractice / 4) * 100); // Assume 4+ interviews in 30 days is 100%

    // Overall readiness: 50% average score, 30% category coverage, 20% frequency
    const coverageScore = Math.min(
      100,
      Object.keys(categoryAverages).length * 25,
    ); // 25 per category, max 4
    const overallReadinessScore = Math.round(
      averageScore * 0.5 + coverageScore * 0.3 + frequencyScore * 0.2,
    );

    // Progress trend (last 10 interviews)
    const progressTrend = interviewSessions
      .slice(0, 10)
      .reverse()
      .map((interview) => ({
        date: interview.createdAt.toDate().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        score: interview.evaluation?.overallScore,
      }));

    // Generate AI-powered recommendations based on performance data

    // Prepare analytics summary for AI analysis
    const weakestCategory = Object.entries(categoryAverages).sort(
      ([, a], [, b]) => a.average - b.average,
    )[0];

    const strongestCategory = Object.entries(categoryAverages).sort(
      ([, a], [, b]) => b.average - a.average,
    )[0];

    const improvementTrend =
      progressTrend.length >= 3
        ? {
            recent:
              progressTrend.slice(-3).reduce((sum, t) => sum + t.score, 0) / 3,
            older:
              progressTrend.slice(0, 3).reduce((sum, t) => sum + t.score, 0) /
              3,
          }
        : null;

    const analyticsSummary = `
Interview Performance Analysis:
- Total Interviews: ${totalInterviewsTaken}
- Overall Readiness Score: ${overallReadinessScore}/100
- Average Score: ${averageScore}
- Categories Practiced: ${Object.keys(categoryAverages).length}
- Category Breakdown: ${Object.entries(categoryAverages)
      .map(
        ([cat, data]) => `${cat} (${data.average}%, ${data.count} interviews)`,
      )
      .join(", ")}
- Weakest Category: ${weakestCategory ? `${weakestCategory[0]} (${weakestCategory[1].average}%)` : "None"}
- Strongest Category: ${strongestCategory ? `${strongestCategory[0]} (${strongestCategory[1].average}%)` : "None"}
- Improvement Trend: ${
      improvementTrend
        ? `Recent average ${improvementTrend.recent.toFixed(1)}, Older average ${improvementTrend.older.toFixed(1)}, Trend: ${improvementTrend.recent > improvementTrend.older ? "Improving" : "Declining"}`
        : "Not enough data"
    }
- Practice Frequency: ${recentPractice} interviews in last 30 days
    `;

    let recommendations: StudentPersonalisedAnalytics["recommendations"] = [];

    const aiResult = await generateText({
      model: "anthropic/claude-sonnet-4",
      system: `You are an expert interview coach analyzing a candidate's interview performance. 
Generate 2-3 personalized, actionable recommendations based on their performance data. 
Focus on practical, specific improvements they can make to increase their interview readiness.
Prioritize recommendations by impact: high priority for critical gaps, medium for important skills, low for optimization.
Make recommendations data-driven and specific to their weaknesses and improvement opportunities.`,
      prompt: `Based on this interview performance data, provide personalized recommendations:\n\n${analyticsSummary}`,
      output: Output.object({ schema: recommendationSchema }),
    });

    recommendations = aiResult.output.recommendations;

    const evaluation: StudentPersonalisedAnalytics = {
      overallReadinessScore,
      totalInterviewsTaken: totalInterviewsTaken,
      averageScore,
      categoryScores: categoryAverages,
      progressTrend,
      recommendations,
      userId: userId,
    };

    // Save personalised evaluation
    await dbAdmin
      .collection(COLLECTIONS.studentPersonalisedAnalytics)
      .doc(userId)
      .set(
        {
          ...evaluation,
          updatedAt: admin.firestore.FieldValue.serverTimestamp() as Timestamp,
        } satisfies StudentPersonalisedAnalytics,
        { merge: true },
      );

    return Response.json(
      {
        data: { evaluation: evaluation },
        error: null,
      } satisfies ApiResponse<StudentPersonalisedEvaluationResponseDto>,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        data: { evaluation: null },
        error: `Evaluation failed: ${error.message}`,
      } satisfies ApiResponse<StudentPersonalisedEvaluationResponseDto>,
      { status: 500 },
    );
  }
}
