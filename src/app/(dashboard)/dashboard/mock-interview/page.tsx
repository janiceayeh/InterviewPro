"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  Briefcase,
  Code,
  Users,
  Target,
  Lightbulb,
} from "lucide-react";

// defines the available interview categories data
const categories = [
  {
    id: "behavioural",
    title: "Behavioral",
    description:
      "Questions about your past experiences and how you handled situations",
    icon: Users,
    questionCount: 10,
    duration: "15 min",
    color: "from-primary to-accent",
  },
  {
    id: "technical",
    title: "Technical",
    description:
      "Assess your technical knowledge and problem-solving abilities",
    icon: Code,
    questionCount: 8,
    duration: "20 min",
    color: "from-accent to-chart-3",
  },
  {
    id: "situational",
    title: "Situational",
    description:
      "Hypothetical scenarios to evaluate your decision-making skills",
    icon: Target,
    questionCount: 8,
    duration: "15 min",
    color: "from-chart-3 to-chart-5",
  },
  {
    id: "general",
    title: "General",
    description:
      "Common interview questions every candidate should prepare for",
    icon: Briefcase,
    questionCount: 12,
    duration: "20 min",
    color: "from-chart-5 to-primary",
  },
];

// highlights currently selected category card and navigates user to the selected category page
export default function MockInterviewPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="size-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            Mock Interview Prep
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Choose Your Interview Type
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Select a category to begin your timed mock interview. Each question
          has a countdown timer to simulate real interview pressure.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <AnimatePresence>
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg ${
                    selectedCategory === category.id
                      ? "border-primary ring-2 ring-primary/20"
                      : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br ${category.color}`}
                      >
                        <Icon className="size-6 text-primary-foreground" />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {category.duration}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="mt-4">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {category.questionCount} questions
                      </span>
                      {selectedCategory === category.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="size-6 rounded-full bg-primary flex items-center justify-center"
                        >
                          <svg
                            className="size-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-center"
      >
        <Link
          href={
            selectedCategory
              ? `/dashboard/mock-interview/${selectedCategory}`
              : "#"
          }
          className={!selectedCategory ? "pointer-events-none" : ""}
        >
          <Button size="lg" disabled={!selectedCategory} className="h-12 px-8">
            Start Interview
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          How it works
        </h3>
        <ol className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
              1
            </span>
            <span>
              Select a category that matches your interview preparation needs
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
              2
            </span>
            <span>
              Answer each question within the time limit - the timer simulates
              real pressure
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
              3
            </span>
            <span>
              Our AI analyzes your responses and provides detailed feedback
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
              4
            </span>
            <span>
              Review your performance report with personalized improvement tips
            </span>
          </li>
        </ol>
      </motion.div>
    </div>
  );
}
