"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { routes } from "@/lib/routes";
import { useAuth } from "@/lib/context/auth-context";
import { COLLECTIONS, TInterviewSessionEvaluation } from "@/lib/constants";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ApiResponse,
  InterviewSession,
  StudentPersonalisedEvaluationResponseDto,
} from "@/lib/types";
import { getIdToken } from "firebase/auth";

interface QuestionScore {
  questionId: string;
  score: number;
  feedback: string;
  keyPoints: string[];
}

type QuestionScoreWithQuestion = QuestionScore & {
  question: string;
  answer: string;
};

const getStudentPersonalisedAnalytics = async ({
  userId,
  idToken,
}: {
  userId: string;
  idToken: string;
}) => {
  try {
    const response = await fetch(routes.api.studentPersonalisedAnalytics(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        uid: userId,
        authorization: idToken,
      },
    });

    const data: ApiResponse<StudentPersonalisedEvaluationResponseDto> =
      await response?.json();

    return { ok: true, data };
  } catch (err) {
    console.error(err);
    return { error: err as Error };
  }
};

export default function ResultsPage() {
  const { user, loading: userLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const interviewSessionId = params.session_id as string;

  const [evaluation, setEvaluation] =
    useState<TInterviewSessionEvaluation | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  async function getInterviewSession(interviewSessionId: string) {
    try {
      const interviewSessionSnapshot = await getDoc(
        doc(db, COLLECTIONS.interviewSessions, interviewSessionId),
      );

      return {
        ok: true,
        interviewSession: interviewSessionSnapshot.data() as InterviewSession,
      };
    } catch (error) {
      return { error: error as Error };
    }
  }

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setEvaluationLoading(true);

        // Load interview session and check whether it has already been evaluated
        const { error, ok, interviewSession } =
          await getInterviewSession(interviewSessionId);
        if (error) {
          setError(`Failed to load interview session: ${error.message}`);
        } else if (ok) {
          if (interviewSession?.evaluation) {
            return setEvaluation(interviewSession.evaluation);
          }

          const response = await fetch(
            routes.api.evaluateInterview({ category, interviewSessionId }),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user?.uid }),
            },
          );

          if (!response.ok) {
            throw new Error("Failed to evaluate interview session");
          }

          const result: TInterviewSessionEvaluation = await response.json();

          setEvaluation(result);

          // Fire student personalised analytics action
          const res = await getStudentPersonalisedAnalytics({
            userId: user?.uid,
            idToken: await getIdToken(user),
          });
        }
      } catch (error) {
        console.error(error);
        const errorMessage =
          "Failed to generate evaluation?. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setEvaluationLoading(false);
      }
    };

    fetchEvaluation();
  }, [user, interviewSessionId]);

  if (evaluationLoading || userLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Loader2 className="size-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Analyzing Your Responses
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Our AI is evaluating your interview performance. This may take a
          moment...
        </p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <AlertCircle className="size-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Something Went Wrong
        </h2>
        <p className="text-muted-foreground text-center mb-6">{error}</p>
        <Button onClick={() => router.push(routes.mockInterviewHistory())}>
          <ChevronLeft className="size-4 mr-2" />
          Back to history
        </Button>
      </div>
    );
  }

  const radarData = [
    {
      subject: "Communication",
      value: evaluation?.categoryBreakdown?.communication,
    },
    { subject: "Relevance", value: evaluation?.categoryBreakdown?.relevance },
    { subject: "Structure", value: evaluation?.categoryBreakdown?.structure },
    { subject: "Depth", value: evaluation?.categoryBreakdown?.depth },
    { subject: "Confidence", value: evaluation?.categoryBreakdown?.confidence },
  ];

  const barData = evaluation?.questionScores.map((qs, index) => ({
    name: `Q${index + 1}`,
    score: qs.score,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Needs Improvement";
    return "Keep Practicing";
  };

  // Colors for Recharts (not CSS variables)
  const primaryColor = "#4f6bed";
  const accentColor = "#38bdf8";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-4">
          <Trophy className="size-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Interview Results
        </h1>
        <p className="text-muted-foreground capitalize">
          {category} Interview Evaluation
        </p>
      </motion.div>

      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-8 overflow-hidden p-0">
          <div className="bg-linear-to-r from-primary/10 to-accent/10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${getScoreColor(evaluation?.overallScore)} mb-2`}
                >
                  {evaluation?.overallScore}
                </div>
                <div className="text-lg font-medium text-foreground">
                  {getScoreLabel(evaluation?.overallScore)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Score
                </div>
              </div>
              <div className="flex-1">
                <p className="text-foreground leading-relaxed">
                  {evaluation?.summary}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Skills Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke={primaryColor}
                    fill={primaryColor}
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Question Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    fill={accentColor}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {evaluation?.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-success mt-2 shrink-0" />
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <TrendingUp className="size-5" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {evaluation?.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-warning mt-2 shrink-0" />
                    <span className="text-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Question Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluation?.questionScores.map(
                (qs: QuestionScoreWithQuestion, index) => (
                  <div
                    key={String(index)}
                    className="rounded-lg border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === qs.questionId
                          ? null
                          : qs.questionId,
                      )
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        Question {index + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold ${getScoreColor(qs.score)}`}
                        >
                          {qs.score}/100
                        </span>
                        <Progress value={qs.score} className="w-24 h-2" />
                      </div>
                    </div>
                    {expandedQuestion === qs.questionId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <p className="mb-3">Question: {qs.question}</p>
                        <p className="mb-3">Answer: {qs.answer}</p>
                        <p className="text-muted-foreground mb-3">
                          {qs.feedback}
                        </p>
                        {qs.keyPoints.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">
                              Key Points:
                            </p>
                            <ul className="space-y-1">
                              {qs.keyPoints.map((point, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-muted-foreground flex gap-2"
                                >
                                  <span className="text-primary">•</span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluation?.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/mock-interview")}
        >
          <ChevronLeft className="size-4 mr-2" />
          Start New Interview
        </Button>
        {/* <Button
          onClick={() => router.push(`/dashboard/mock-interview/${category}`)}
        >
          <RotateCcw className="size-4 mr-2" />
          Try Again
        </Button> */}
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/mock-interview/history")}
        >
          <Trophy className="size-4 mr-2" />
          View History
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/copilot")}
        >
          Practice with Copilot
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
