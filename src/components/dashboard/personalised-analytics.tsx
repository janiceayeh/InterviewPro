"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
  Clock,
  BookOpen,
  ArrowRight,
  Award,
  Lightbulb,
  DotIcon,
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { routes } from "@/lib/routes";
import { useStudentPersonalisedAnalytics } from "@/lib/hooks";

const priorityConfig = {
  high: { color: "destructive", icon: Zap, label: "Priority" },
  medium: { color: "warning", icon: Zap, label: "Important" },
  low: { color: "secondary", icon: CheckCircle2, label: "Suggestion" },
};

function secondsToHMS(seconds: number) {
  const sign = seconds < 0 ? -1 : 1;
  seconds = Math.abs(Math.floor(seconds));
  const h = Math.floor(seconds / 3600) * sign;
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { hours: h, minutes: m, seconds: s };
}

export function PersonalisedAnalytics() {
  const { user, userProfile, loading: userLoading } = useAuth();
  const { analytics, analyticsError, analyticsLoading, fetchAnalytics } =
    useStudentPersonalisedAnalytics();
  const practiseTime = secondsToHMS(userProfile?.totalPractiseTime ?? 0);

  useEffect(() => {
    if (user) {
      fetchAnalytics({ userId: user.uid });
    }
  }, [user]);

  if (userLoading || analyticsLoading) {
    return (
      <div
        data-testid="personalised-analytics-loading-skeleton"
        className="space-y-6"
      >
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!analyticsLoading && analyticsError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="size-5" />
            <p> "Failed to load analytics: {analyticsError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryChartData = analytics?.categoryScores
    ? Object.entries(analytics?.categoryScores)?.map(([category, score]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        score: score.average,
      }))
    : [];

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Overall Readiness Card */}
      <motion.div variants={item}>
        <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 to-accent/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20" />
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  Interview Readiness Score
                </CardTitle>
                <CardDescription className="mt-2">
                  Your overall preparation level for interviews
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Display */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg
                    className="w-32 h-32 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - analytics?.overallReadinessScore / 100)}`}
                      className={`text-primary transition-all duration-1000 ${getReadinessColor(analytics?.overallReadinessScore)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${getReadinessColor(analytics?.overallReadinessScore)}`}
                      >
                        {analytics?.overallReadinessScore}
                      </div>
                      <div className="text-sm text-muted-foreground">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Interviews Taken
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {analytics?.totalInterviewsTaken}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      (analytics?.totalInterviewsTaken / 10) * 100,
                    )}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Average Score
                    </span>
                    <span
                      className={`text-2xl font-bold ${getReadinessColor(analytics?.averageScore)}`}
                    >
                      {analytics?.averageScore}%
                    </span>
                  </div>
                  <Progress value={analytics?.averageScore} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Categories Covered
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {analytics?.categoryScores
                        ? Object.keys(analytics?.categoryScores).length
                        : 0}
                    </span>
                  </div>
                  <Progress
                    value={
                      analytics?.categoryScores
                        ? (Object.keys(analytics?.categoryScores).length / 4) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Practice Time
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-12 rounded-lg bg-accent/20">
                      <Clock className="size-6 text-accent" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {practiseTime.hours}h:{practiseTime.minutes}m:
                      {practiseTime.seconds}s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Progress Over Time
              </CardTitle>
              <CardDescription>Your interview score trends</CardDescription>
            </CardHeader>
            <CardContent>
              {(analytics?.progressTrend?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics?.progressTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-muted-foreground"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--primary)", r: 5 }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={true}
                      name="Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No progress data yet. Take your first interview to start
                  tracking progress.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Performance */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Skills Breakdown
              </CardTitle>
              <CardDescription>
                Performance by interview category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="currentColor"
                      className="text-muted-foreground"
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-muted-foreground"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                    <Bar
                      dataKey="score"
                      fill="var(--chart-2)"
                      name="Average Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No category data yet. Start practicing to build your skills
                  profile.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Personalized Recommendations */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-5 text-primary" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription>
              Based on your interview performance and practice patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recommendations?.map((rec, index) => {
                const config = priorityConfig[rec.priority];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={index}
                    variants={item}
                    className="border border-border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className={`size-5 text-${config.color} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {rec.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Items */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
                        Action Items
                      </p>
                      <ul className="space-y-1">
                        {rec.actionItems.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="text-primary">
                              <DotIcon />
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Interview History Snapshot */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                Recent Interviews
              </CardTitle>
              <CardDescription className="mt-2">
                Your latest interview sessions
              </CardDescription>
            </div>
            <Button variant="default" asChild>
              <Link
                href={routes.mockInterviewHistory()}
                className="flex items-center gap-2"
              >
                View all
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have completed{" "}
              <span className="font-semibold text-foreground">
                {analytics?.totalInterviewsTaken}
              </span>{" "}
              interviews so far.
            </p>
            {(analytics?.progressTrend?.length ?? 0) > 0 && (
              <div className="grid gap-2">
                {analytics?.progressTrend?.slice(0, 3)?.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm text-muted-foreground">
                      {point.date}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress value={point.score} className="w-24 h-1.5" />
                      <span
                        className={`text-sm font-semibold ${getReadinessColor(point.score)}`}
                      >
                        {point.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild className="h-auto py-4 flex-col" variant="outline">
            <Link
              href="/dashboard/mock-interview"
              className="flex flex-col items-center gap-2"
            >
              <BookOpen className="size-5 text-primary" />
              <div>
                <div className="font-semibold">Take Interview</div>
                <div className="text-xs text-muted-foreground">
                  Practice new questions
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild className="h-auto py-4 flex-col" variant="outline">
            <Link
              href="/dashboard/copilot"
              className="flex flex-col items-center gap-2"
            >
              <Zap className="size-5 text-primary" />
              <div>
                <div className="font-semibold">AI Copilot</div>
                <div className="text-xs text-muted-foreground">
                  Get instant feedback
                </div>
              </div>
            </Link>
          </Button>

          <Button asChild className="h-auto py-4 flex-col" variant="outline">
            <Link
              href="/dashboard/tips"
              className="flex flex-col items-center gap-2"
            >
              <Lightbulb className="size-5 text-primary" />
              <div>
                <div className="font-semibold">Interview Tips</div>
                <div className="text-xs text-muted-foreground">
                  Learn best practices
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
