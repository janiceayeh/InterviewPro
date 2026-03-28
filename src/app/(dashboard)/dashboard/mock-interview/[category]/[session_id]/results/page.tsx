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
  RotateCcw,
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

interface QuestionScore {
  questionId: string;
  score: number;
  feedback: string;
  keyPoints: string[];
}

interface Evaluation {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  questionScores: QuestionScore[];
  categoryBreakdown: {
    communication: number;
    relevance: number;
    structure: number;
    depth: number;
    confidence: number;
  };
  recommendations: string[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const stored = sessionStorage.getItem("interviewAnswers");
        if (!stored) {
          router.push(routes.mockInterview());
          return;
        }

        const { category, answers, questions } = JSON.parse(stored);

        const response = await fetch("/api/evaluate-interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, answers, questions }),
        });

        if (!response.ok) throw new Error("Failed to evaluate");

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        setEvaluation(result);
      } catch {
        setError("Failed to generate evaluation. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [router]);

  if (loading) {
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
        <Button onClick={() => router.push("/dashboard/mock-interview")}>
          <ChevronLeft className="size-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  const radarData = [
    {
      subject: "Communication",
      value: evaluation.categoryBreakdown.communication,
    },
    { subject: "Relevance", value: evaluation.categoryBreakdown.relevance },
    { subject: "Structure", value: evaluation.categoryBreakdown.structure },
    { subject: "Depth", value: evaluation.categoryBreakdown.depth },
    { subject: "Confidence", value: evaluation.categoryBreakdown.confidence },
  ];

  const barData = evaluation.questionScores.map((qs, index) => ({
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
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${getScoreColor(evaluation.overallScore)} mb-2`}
                >
                  {evaluation.overallScore}
                </div>
                <div className="text-lg font-medium text-foreground">
                  {getScoreLabel(evaluation.overallScore)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Score
                </div>
              </div>
              <div className="flex-1">
                <p className="text-foreground leading-relaxed">
                  {evaluation.summary}
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
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
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
                {evaluation.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
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
              {evaluation.questionScores.map((qs, index) => (
                <div
                  key={qs.questionId}
                  className="rounded-lg border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === qs.questionId ? null : qs.questionId,
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">
                      Question {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${getScoreColor(qs.score)}`}>
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
              ))}
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
              {evaluation.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
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
          onClick={() => router.push(routes.mockInterview())}
        >
          <ChevronLeft className="size-4 mr-2" />
          Back to Categories
        </Button>
        <Button onClick={() => router.push(routes.mockInterview())}>
          <RotateCcw className="size-4 mr-2" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(routes.mockInterviewHistory())}
        >
          <Trophy className="size-4 mr-2" />
          View History
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push(routes.copilot())}
        >
          Practice with Copilot
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
