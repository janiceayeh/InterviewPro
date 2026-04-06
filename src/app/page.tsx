"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Mic,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Users,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Mock Interview Prep",
    description:
      "Timed practice sessions with AI-powered feedback and detailed performance reports.",
  },
  {
    icon: MessageSquare,
    title: "Interview Copilot",
    description:
      "Real-time AI chatbot that simulates actual interview conversations.",
  },
  {
    icon: Lightbulb,
    title: "Expert Tips",
    description:
      "Curated advice from industry professionals with interactive Q&A.",
  },
];

const benefits = [
  "AI-powered answer evaluation",
  "Personalized improvement recommendations",
  "Real-time feedback and coaching",
  "Comprehensive performance analytics",
  "Practice at your own pace",
  "Industry-specific question banks",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  IP
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                InterviewPro
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                AI-Powered Interview Prep
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
              Master Your Interviews with{" "}
              <span className="text-primary">AI-Powered Practice</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Prepare for your dream job with realistic mock interviews,
              real-time coaching, and expert tips. Get personalized feedback to
              improve your interview skills.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base bg-transparent"
                >
                  I already have an account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
