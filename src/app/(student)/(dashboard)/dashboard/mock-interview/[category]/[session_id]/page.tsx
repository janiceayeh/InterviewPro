"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import {
  InterviewAnswer,
  InterviewSession,
  InterviewQuestion,
  UserProfile,
} from "@/lib/types";
import { useAuth } from "@/lib/context/auth-context";

import {
  addDoc,
  collection,
  doc,
  DocumentData,
  documentId,
  DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  startAfter,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  COLLECTIONS,
  NUMBER_OF_QUESTIONS_PER_INTERVIEW_SESSION,
} from "@/lib/constants";
import { toast } from "sonner";
import PageLoading from "@/components/page-loading";
import { routes } from "@/lib/routes";
import ErrorAlert from "@/components/error-alert/ErrorAlert";
import { useMockInterviewQuestions } from "@/lib/hooks";

interface Answer {
  questionId: string;
  answer: string;
  timeSpent: number;
}

// displays the questions and provides the text area for the answer with a countdown timer
export default function InterviewSessionPage() {
  // Reads category and loads questions
  const params = useParams();
  const router = useRouter();
  const { userProfile, loading: userProfileLoading, user } = useAuth();
  const category = params.category as string; // category url parameter
  const interviewSessionId = params.session_id as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAnswerSaving, setCurrentAnswerSaving] = useState(false);
  const [interviewMetadataSaving, setInterviewMetadataSaving] = useState(false);
  const [interviewSessionTotalTimeSpent, setInterviewSessionTotalTimeSpent] =
    useState(0);
  const [interviewSessionLoading, setInterviewSessionLoading] = useState(false);
  const [interviewSession, setInterviewSession] = useState<
    InterviewSession | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const { questions, questionsLoading } = useMockInterviewQuestions({
    userProfile: userProfile,
    questionCategory: category,
    startFetch: userProfile && !isStarted,
  });
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 120);

  const currentQuestion: InterviewQuestion | undefined =
    questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100; // derived/ computed state

  async function saveAnswer({
    timeSpentOnQuestion,
  }: {
    timeSpentOnQuestion: number;
  }) {
    try {
      setCurrentAnswerSaving(true);
      if (interviewSession) {
        const newAnswer = await addDoc(
          collection(db, COLLECTIONS.interviewAnswers),
          {
            answer: currentAnswer,
            interviewCategory: category,
            questionId: currentQuestion.id,
            userId: user?.uid,
            timeSpent: timeSpentOnQuestion,
            interviewSessionId: interviewSessionId,
            createdAt: serverTimestamp() as Timestamp,
          } satisfies Omit<InterviewAnswer, "id">,
        );
        return newAnswer;
      } else {
        setError("Cannot save answer: No interview session found.");
      }
    } catch (error) {
      toast.error("Failed to save answer.");
    } finally {
      setCurrentAnswerSaving(false);
    }
  }

  async function saveInterviewMetaData({
    lastAnsweredQuestionId,
  }: {
    lastAnsweredQuestionId: string;
  }) {
    try {
      setInterviewMetadataSaving(true);

      const interviewSessionsCompleted = userProfile?.interviewSessionsCompleted
        ? (userProfile.interviewSessionsCompleted ?? 0) + 1
        : 1;

      const totalPractiseTime = userProfile?.totalPractiseTime
        ? (userProfile.totalPractiseTime ?? 0) + interviewSessionTotalTimeSpent
        : interviewSessionTotalTimeSpent;

      // update user profile with metadata
      updateDoc(doc(db, COLLECTIONS.users, user.uid), {
        lastAnsweredQuestionId: lastAnsweredQuestionId,
        interviewSessionsCompleted: interviewSessionsCompleted,
        totalPractiseTime: totalPractiseTime,
      } satisfies Partial<UserProfile>);

      return "ok";
    } catch (error) {
      toast.error("Failed to save interview metadata");
    } finally {
      setInterviewMetadataSaving(false);
    }
  }

  async function updateInterviewSession({ timeSpent }: { timeSpent: number }) {
    try {
      setInterviewSessionLoading(true);
      return updateDoc(
        doc(db, COLLECTIONS.interviewSessions, interviewSessionId),
        {
          totalTimeSpent: timeSpent,
          isCompleted: true,
        } satisfies Partial<InterviewSession>,
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to create new interview session. Try again.");
    } finally {
      setInterviewSessionLoading(false);
    }
  }

  // handles next question
  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      timeSpent: currentQuestion.timeLimit - timeLeft,
    };
    // updates by adding users new answer to current answers list
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // Save answer to interview-answers collection
    const timeSpentOnQuestion = (currentQuestion.timeLimit || 120) - timeLeft;
    setInterviewSessionTotalTimeSpent((t) => t + timeSpentOnQuestion);
    await saveAnswer({ timeSpentOnQuestion });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswer("");
      setTimeLeft(questions[currentIndex + 1].timeLimit);
      setShowTips(false);
    } else {
      // saves to database and navigate to results
      setIsSubmitting(true);

      // create interview session
      await updateInterviewSession({
        timeSpent: interviewSessionTotalTimeSpent,
      });

      // Save interview metadata to database
      const lastAnsweredQuestionId = questions[questions.length - 1].id;
      await saveInterviewMetaData({ lastAnsweredQuestionId });

      //TODO:
      //3. Send Question and responses to AI for grading and results
      router.push(
        routes.mockInterviewResults({
          category,
          interviewSessionId,
        }),
      );
    }
  }, [
    currentQuestion,
    currentAnswer,
    timeLeft,
    answers,
    currentIndex,
    questions,
    category,
    router,
  ]);

  useEffect(() => {
    if (!isStarted || !currentQuestion || isSubmitting) return;

    // handles timer by reducing time left by each second
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // in milliseconds

    return () => clearInterval(timer);
  }, [isStarted, currentQuestion, isSubmitting]); // if any of these values(state) change, run useEffect again

  // automatically moves to the next question when the time runs out
  useEffect(() => {
    if (timeLeft === 0 && isStarted && !isSubmitting) {
      handleNext();
    }
  }, [timeLeft, isStarted, isSubmitting, handleNext]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // choose timer text/icon colour based on time remaining percentage
  const getTimeColor = () => {
    if (!currentQuestion) return "text-foreground";
    const percentage = timeLeft / currentQuestion.timeLimit;
    if (percentage > 0.5) return "text-success";
    if (percentage > 0.25) return "text-warning";
    return "text-destructive";
  };

  // get inteview session from database to ensure it exists
  useEffect(() => {
    async function getInterviewSession() {
      try {
        setInterviewSessionLoading(true);
        const interviewSessionDoc = await getDoc(
          doc(db, COLLECTIONS.interviewSessions, interviewSessionId),
        );
        const interviewSession = interviewSessionDoc.data() as InterviewSession;
        setInterviewSession(interviewSession);
      } catch (error) {
        const errorMessage = "Failed to load interview";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(error);
      } finally {
        setInterviewSessionLoading(false);
      }
    }
    if (interviewSessionId) {
      getInterviewSession();
    }
  }, [interviewSessionId]);

  if (questionsLoading || userProfileLoading || interviewSessionLoading) {
    return <PageLoading />;
  }

  // error ui for invalid category
  if ((!questionsLoading && !currentQuestion) || questions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <AlertCircle className="size-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">No questions available</h1>
        <p className="text-muted-foreground mb-6">
          There are no questions available for the selected category. Check
          again soon.
        </p>
        <Button onClick={() => router.push(routes.mockInterview())}>
          <ChevronLeft className="size-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  // instructions page before the interview begins
  if (!isStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-2xl px-4 py-12"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-6">
            <Clock className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Ready to Begin?
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            You will answer {questions.length} questions in the {category}{" "}
            category. Each question has a timer. When time runs out, you will
            automatically move to the next question.
          </p>

          <div className="rounded-xl border border-border bg-card p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-3">Quick Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Take a moment to organize your thoughts before answering
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use specific examples from your experience
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {
                  "Don't worry if time runs out - partial answers are still evaluated"
                }
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(routes.mockInterview())}
            >
              <ChevronLeft className="size-4 mr-2" />
              Go Back
            </Button>
            <Button size="lg" onClick={() => setIsStarted(true)}>
              Start Interview
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // display of each interview question for selected category
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {error && <ErrorAlert errorMessage={error} />}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-muted-foreground capitalize">
            {category} Interview
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Timer */}
          <div className="flex items-center justify-center mb-8">
            <div
              className={`flex items-center gap-2 px-6 py-3 rounded-full border ${
                timeLeft < 30
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
              <Clock className={`size-5 ${getTimeColor()}`} />
              <span
                className={`text-2xl font-mono font-bold ${getTimeColor()}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-relaxed text-balance">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Tips Toggle */}
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 text-sm text-primary mb-4 hover:underline"
          >
            <Lightbulb className="size-4" />
            {showTips ? "Hide tips" : "Show tips"}
          </button>

          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4"
              >
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {currentQuestion.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer Input */}
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-50 text-base resize-none mb-6"
          />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {currentAnswer.length > 0
                ? `${currentAnswer.split(" ").filter(Boolean).length} words`
                : "Start typing your answer"}
            </p>
            <Button onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ||
              currentAnswerSaving ||
              interviewMetadataSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="size-4 ml-2" />
                </>
              ) : (
                <>
                  Finish Interview
                  <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
function startAfterDocument(
  lastDocSnap: DocumentSnapshot<DocumentData, DocumentData>,
): import("@firebase/firestore").QueryConstraint {
  throw new Error("Function not implemented.");
}
