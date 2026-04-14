"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { motion } from "framer-motion";
import {
  Mic,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";
import PageLoading from "@/components/page-loading";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { PersonalisedAnalytics } from "@/components/dashboard/personalised-analytics";

const features = [
  {
    title: "Mock Interview Prep",
    description:
      "Practice with timed interview questions and get AI-powered feedback on your responses.",
    icon: Mic,
    href: routes.mockInterview(),
    gradient: "from-primary to-accent",
    // stats: [
    //   { label: 'Questions', value: '50+' },
    //   { label: 'Categories', value: '8' },
    // ],
  },
  {
    title: "Interview Copilot",
    description:
      "Chat with our AI interviewer for real-time practice and personalized recommendations.",
    icon: MessageSquare,
    href: routes.copilot(),
    gradient: "from-accent to-chart-3",
    // stats: [
    //   { label: 'Real-time', value: 'AI' },
    //   { label: 'Feedback', value: 'Instant' },
    // ],
  },
  {
    title: "Interview Tips",
    description:
      "Access curated tips and ask questions to deepen your understanding.",
    icon: Lightbulb,
    href: routes.tips(),
    gradient: "from-chart-3 to-chart-5",
    // stats: [
    //   { label: 'Tips', value: '100+' },
    //   { label: 'Topics', value: '15' },
    // ],
  },
];

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

export default function DashboardPage() {
  const { user, userProfile, loading: userLoading, getUserProfile } = useAuth();
  const firstName = userProfile?.firstname || user.displayName.split(" ")[0];

  //TODO:
  // 1. Display average scores

  useEffect(() => {
    if (!userLoading) getUserProfile();
  }, [userLoading]);

  if (userLoading) {
    return <PageLoading />;
  }
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-5 text-primary" />
          <span className="text-sm font-medium text-primary">Welcome back</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 text-balance">
          Hello, {firstName}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Choose how you want to prepare for your next interview. Each tool is
          designed to help you succeed.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-3"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} variants={item}>
              <Link href={feature.href} className="block group h-full">
                <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center size-14 rounded-xl bg-linear-to-br ${feature.gradient} mb-6`}
                  >
                    <Icon className="size-7 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <h2 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <span>Get started</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Stats */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 grid gap-4 sm:grid-cols-3"
      >
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10">
            <Target className="size-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {userProfile?.interviewSessionsCompleted ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Interviews Completed
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-center size-12 rounded-lg bg-accent/20">
            <Clock className="size-6 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {practiseTime.hours}h:{practiseTime.minutes}m:
              {practiseTime.seconds}s
            </div>
            <div className="text-sm text-muted-foreground">Practice Time</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-center size-12 rounded-lg bg-chart-3/20">
            <Sparkles className="size-6 text-chart-3" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">--</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </div>
        </div>
      </motion.div> */}

      {/* Personalized Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <PersonalisedAnalytics />
      </motion.div>
    </div>
  );
}
