"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Search, Trash2Icon, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewQuestionForm } from "@/components/admin/new-question-form";

import { InterviewQuestion } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import PageLoading from "@/components/page-loading";
import { useInterviewQuestions } from "@/lib/hooks";
import { Alert } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDoc, doc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function InterviewQuestionsPage() {
  const {
    error,
    loading,
    questions,
    previous,
    next,
    reset,
    first,
    hasNext,
    hasPrev,
    refetch,
  } = useInterviewQuestions();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [questionConfirmDeleteOpen, setQuestionConfirmDeleteOpen] =
    useState(false);
  const [interviewQuestionSelected, setInterviewQuestionSelected] =
    useState<InterviewQuestion | null>(null);
  const [questionDeleting, setQuestionDeleting] = useState(false);

  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const difficultyColor = {
    easy: "bg-emerald-500/20 text-emerald-700",
    medium: "bg-amber-500/20 text-amber-700",
    hard: "bg-red-500/20 text-red-700",
  };

  const noQuestionsFound = filteredQuestions.length === 0;

  async function deleteQuestion(questionId: string) {
    try {
      setQuestionDeleting(true);
      await deleteDoc(doc(db, COLLECTIONS.interviewQuestions, questionId));
      refetch();
      setQuestionConfirmDeleteOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete question: ${(error as Error).message}`);
    } finally {
      setQuestionDeleting(false);
    }
  }

  useEffect(() => {
    first();
  }, []);

  if (loading) return <PageLoading />;
  return (
    <div className="space-y-6">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Interview Questions
          </h1>
          <p className="text-muted-foreground">
            Manage interview questions library
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => {
            setInterviewQuestionSelected(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 bg-muted/30">
              <TableHead className="text-foreground">Question</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">Difficulty</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="text-right text-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {noQuestionsFound ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-muted-foreground">
                    No questions found
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((question) => (
                <TableRow
                  key={question.id}
                  className="border-border/30 hover:bg-muted/50"
                >
                  <TableCell className="font-medium text-foreground max-w-xs whitespace-normal break-normal">
                    {question.question}
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">
                    {question.category}
                  </TableCell>
                  <TableCell>
                    <Badge className={difficultyColor[question.difficulty]}>
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        question.status === "published" ? "default" : "outline"
                      }
                      className={
                        question.status === "published"
                          ? "bg-emerald-500/20 text-emerald-700"
                          : ""
                      }
                    >
                      {question.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setInterviewQuestionSelected(question);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        setInterviewQuestionSelected(question);
                        setQuestionConfirmDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!noQuestionsFound && (
          <div className="w-full flex justify-center items-center">
            <div className="flex gap-2">
              <Button variant="outline" disabled={!hasPrev} onClick={previous}>
                Previous
              </Button>
              <Button disabled={!hasNext} onClick={next}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* New Question Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Interview Question</DialogTitle>
            <DialogDescription>
              Create a new interview question to add to the library
            </DialogDescription>
          </DialogHeader>
          <NewQuestionForm
            question={interviewQuestionSelected}
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              // Refetch questions
              if (interviewQuestionSelected) {
                // Updated question. Refetch current page
                refetch();
              } else {
                // New question. Fetch first page
                reset();
                first();
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Question Alert Dialog */}
      <AlertDialog
        open={questionConfirmDeleteOpen}
        onOpenChange={setQuestionConfirmDeleteOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={questionDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteQuestion(interviewQuestionSelected.id)}
              disabled={questionDeleting}
            >
              {questionDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
