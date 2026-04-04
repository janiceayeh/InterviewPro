"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Lightbulb,
  Search,
  MessageCircle,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PageLoading from "@/components/page-loading";
import { useInterviewTips } from "@/lib/hooks";
import { InterviewTip } from "@/lib/types";
import { Alert } from "@/components/ui/alert";
import { INTERVIEW_TIP_CATEGORIES } from "@/lib/constants";

export const tipCategories = [
  { id: "all", label: "All Tips" },
  ...INTERVIEW_TIP_CATEGORIES.map(({ value, label }) => ({ id: value, label })),
];

// displays tips with optional search and filter
export default function TipsPage() {
  const { error, loading, tips, previous, next, first, hasNext, hasPrev } =
    useInterviewTips({ hideDraft: true });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTip, setSelectedTip] = useState<InterviewTip | null>(null);

  // filters cards based on currently selected tip category and search input
  const filteredTips = tips.filter((tip) => {
    const matchesCategory =
      selectedCategory === "all" || tip.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const noTipsFound = filteredTips.length === 0;

  useEffect(() => {
    first();
  }, []);

  // displays full tips guide details for the current tip card selected
  if (selectedTip) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => setSelectedTip(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronRight className="size-4 rotate-180" />
            Back to all tips
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
              {selectedTip.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">
            {selectedTip.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {selectedTip.summary}
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Full Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                {selectedTip.content.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-foreground leading-relaxed mb-4"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-success" />
                Key Takeaways
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {selectedTip.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="size-1.5 rounded-full bg-success mt-2 shrink-0" />
                    <span className="text-foreground">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {selectedTip.examples && selectedTip.examples.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="size-5 text-accent" />
                  Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {selectedTip.examples.map((example, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-muted/50 p-4 text-foreground italic"
                    >
                      {example}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-foreground mb-1">
                    Have questions about this tip?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ask our AI for more details or personalized advice
                  </p>
                </div>
                <Link href={`/dashboard/tips/${selectedTip.id}/chat`}>
                  <Button>
                    <MessageCircle className="size-4 mr-2" />
                    Ask Questions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card> */}
        </motion.div>
      </div>
    );
  }

  if (loading) return <PageLoading />;

  // displays all the tip cards, search and tip categories
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Error Alert */}
      {error && (
        <Alert
          className="mb-6 border-destructive/50 bg-destructive/10"
          variant="destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <div className="ml-3">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </Alert>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="size-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            Interview Tips
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Expert Interview Advice
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse curated tips from industry professionals. Click on any tip to
          learn more or ask questions.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tipCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                selectedCategory === category.id
                  ? ""
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
              )}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Tips List */}
      <AnimatePresence mode="wait">
        {filteredTips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Search className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No tips found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {filteredTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem
                    value={tip.id}
                    className="border rounded-xl px-6 bg-card hover:border-primary/30 transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-start gap-4 text-left">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                          <Lightbulb className="size-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {tip.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground">
                            {tip.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tip.summary}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="pl-14">
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {tip.content.split("\n\n")[0]}
                        </p>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTip(tip)}
                          >
                            Read full guide
                            <ChevronRight className="size-4 ml-1" />
                          </Button>
                          {/* <Link href={`/dashboard/tips/${tip.id}/chat`}>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="size-4 mr-2" />
                              Ask questions
                            </Button>
                          </Link> */}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            {!noTipsFound && (
              <div className="w-full flex justify-center items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!hasPrev}
                    onClick={previous}
                  >
                    Previous
                  </Button>
                  <Button disabled={!hasNext} onClick={next}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        {/* <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="py-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10">
                <MessageCircle className="size-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Need Personalized Advice?
                </h3>
                <p className="text-muted-foreground">
                  Chat with our AI interview coach for real-time practice and customized feedback.
                </p>
              </div>
              <Link href="/dashboard/copilot">
                <Button size="lg">
                  Try Interview Copilot
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card> */}
      </motion.div>
    </div>
  );
}
