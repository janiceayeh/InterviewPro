"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Search } from "lucide-react";
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
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  where,
} from "firebase/firestore";
import { InterviewQuestion, PaginatedDocsResult } from "@/lib/types";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import PageLoading from "@/components/page-loading";

async function interviewQuestionsFetchPaginated({
  pageSize = 5,
  cursor,
}: {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot;
}): Promise<PaginatedDocsResult<InterviewQuestion>> {
  const colRef = collection(db, COLLECTIONS.interviewQuestions);
  const q = query(
    colRef,
    // where("category", "==", category),
    orderBy("createdAt"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize),
  );

  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<InterviewQuestion, "id">),
  }));
  const nextCursor =
    snap.docs.length === 0 ? null : snap.docs[snap.docs.length - 1];
  return { items, nextCursor };
}

export default function InterviewQuestionsPage() {
  const [{ items: questions = [], nextCursor } = {}, setPaginatedResult] =
    useState<PaginatedDocsResult<InterviewQuestion>>();
  const [interviewQuestionsLoading, setInterviewQuestionsLoading] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchQuestions = async () => {
    try {
      setInterviewQuestionsLoading(true);
      const paginatedResult = await interviewQuestionsFetchPaginated({
        cursor: nextCursor,
      });
      setPaginatedResult(paginatedResult);
    } catch (error) {
      console.error("Failed to fetch interview questions questions:", error);
      toast.error("Failed to fetch interview questions");
    } finally {
      setInterviewQuestionsLoading(false);
    }
  };
  useEffect(() => {
    fetchQuestions();
  }, []);

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

  if (interviewQuestionsLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
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
          onClick={() => setIsFormOpen(true)}
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
      <Card className="border-border/50 overflow-hidden">
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
            {filteredQuestions.length === 0 ? (
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              // Refetch questions
              fetchQuestions();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
