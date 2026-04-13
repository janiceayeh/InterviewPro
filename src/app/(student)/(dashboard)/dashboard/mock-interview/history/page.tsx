"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Trophy,
  Clock,
  Calendar,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { routes } from "@/lib/routes";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { InterviewSession } from "@/lib/types";
import { toast } from "sonner";
import PageLoading from "@/components/page-loading";
import ErrorAlert from "@/components/error-alert/ErrorAlert";

const categoryColors: Record<string, { label: string; color: string }> = {
  behavioural: {
    label: "Behavioral",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  technical: {
    label: "Technical",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  situational: {
    label: "Situational",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  general: {
    label: "General",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-success/10";
  if (score >= 60) return "bg-warning/10";
  return "bg-destructive/10";
};

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function InterviewHistoryPage() {
  const { user, loading: userLoading } = useAuth();
  const [interviewSessions, setInterviewSessions] = useState<
    InterviewSession[]
  >([]);
  const [interviewSessionsLoading, setInterviewSessionsLoading] =
    useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getInterviewSessions() {
      try {
        setInterviewSessionsLoading(true);
        const interviewSessionsSnapshot = await getDocs(
          query(
            collection(db, COLLECTIONS.interviewSessions),
            where("userId", "==", user?.uid),
            where("isCompleted", "==", true),
            orderBy("createdAt"),
            //TODO: implement pagination of results
          ),
        );
        const interviewSessions = interviewSessionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InterviewSession[];
        setInterviewSessions(interviewSessions);
      } catch (error) {
        console.error(error);
        setError(error);
        toast.error("Failed to fetch interview history");
      } finally {
        setInterviewSessionsLoading(false);
      }
    }

    if (user) {
      getInterviewSessions();
    }
  }, [user]);

  if (userLoading || interviewSessionsLoading) {
    return <PageLoading />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href={routes.mockInterview()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to Mock Interviews
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="size-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            Your Performance
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Interview History
        </h1>
        <p className="text-muted-foreground">
          Review your past mock interview attempts and track your improvement
          over time.
        </p>
      </motion.div>

      {/* Error State */}
      {error && <ErrorAlert errorMessage="Failed to load interviews" />}

      {/* Empty State */}
      {!error && interviewSessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Trophy className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Interviews Yet
          </h3>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t completed any mock interviews yet. Start with a new
            interview to see your results here.
          </p>
          <Link href={routes.mockInterview()}>
            <Button>
              Start Your First Interview
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Interview Cards */}
      {interviewSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {interviewSessions?.map((interviewSession, index) => {
            const categoryInfo =
              categoryColors[interviewSession?.interviewCategory] ||
              categoryColors.general;
            return (
              <motion.div
                key={interviewSession.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-all hover:shadow-lg overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge
                          variant="secondary"
                          className={categoryInfo.color}
                        >
                          {categoryInfo.label}
                        </Badge>
                        <CardTitle className="mt-2 text-lg">
                          Score:{" "}
                          <span
                            className={getScoreColor(
                              interviewSession.totalScore,
                            )}
                          >
                            {interviewSession.totalScore}%
                          </span>
                        </CardTitle>
                      </div>
                      <div
                        className={`rounded-lg p-2 ${getScoreBgColor(interviewSession.totalScore)}`}
                      >
                        <Trophy
                          className={`size-5 ${getScoreColor(interviewSession.totalScore)}`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    {/* <p className="text-sm text-muted-foreground line-clamp-2">
                      {interviewSession.summary}
                    </p> */}

                    {/* Stats */}
                    {/* <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Questions
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {interviewSession.questionCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Completed
                        </p>
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          {
                            formatDate(interviewSession.completedAt).split(
                              ",",
                            )[0]
                          }
                        </p>
                      </div>
                    </div> */}

                    {/* View Results Button */}
                    <Link
                      href={routes.mockInterviewResults({
                        category: interviewSession.interviewCategory,
                        interviewSessionId: interviewSession.id,
                      })}
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        View Results
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Stats Summary */}
      {/* {!loading && interviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid gap-6 md:grid-cols-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{interviews.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Math.round(
                  interviews.reduce(
                    (sum, interview) => sum + interview.overallScore,
                    0,
                  ) / interviews.length,
                )}
                %
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Math.max(...interviews.map((i) => i.overallScore))}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories Attempted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(interviews.map((i) => i.category)).size}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )} */}
    </div>
  );
}
