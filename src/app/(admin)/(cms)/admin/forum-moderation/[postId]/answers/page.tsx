"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import PaginationButtons from "@/components/pagination-buttons/PaginationButtons";
import { useForumPostAnswers } from "@/lib/hooks";
import {
  Check,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageLoading from "@/components/page-loading";
import ms from "ms";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { routes } from "@/lib/routes";
import Link from "next/link";
import { ForumFlagsSheet } from "@/components/admin/ForumFlagsSheet";
import { ForumPostAnswer } from "@/lib/types";
import FlagButton from "@/components/admin/FlagButton";
import PostAuthorName from "@/components/admin/PostAuthorName";
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
import { doc, deleteDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";

export default function ForumPostAnswersPage() {
  const [openAnswersSheet, setOpenAnswersSheet] = useState(false);
  const params = useParams() as { postId: string };
  const postId = params.postId;
  const {
    error,
    first,
    forumPostAnswers,
    hasNext,
    hasPrev,
    loading,
    next,
    previous,
    refetch,
    search,
    reset,
  } = useForumPostAnswers(postId);

  const noForumPostAnswers = forumPostAnswers?.length === 0;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<ForumPostAnswer | null>(
    null,
  );
  const [answerConfirmDelete, setAnswerConfirmDelete] = useState(false);
  const [answerDeleting, setAnswerDeleting] = useState(false);

  const handleClear = () => {
    setSearchQuery("");
    reset();
    first();
  };

  async function deleteAnswer(answerId: string) {
    try {
      setAnswerDeleting(true);
      await deleteDoc(doc(db, COLLECTIONS.forumPostAnswers, answerId));
      refetch();
      setAnswerConfirmDelete(false);
      toast.success("Answer deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete answer: ${(error as Error).message}`);
    } finally {
      setAnswerDeleting(false);
    }
  }

  useEffect(() => {
    first();
  }, []);

  useEffect(() => {
    if (!loading && error) {
      console.error(error);
      toast.error(`Failed to load forum post answers:  ${error}`);
    }
  }, [loading, error]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Link href={routes.adminForumModeration()}>
          <Button
            variant="link"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors p-0!"
          >
            <ChevronRight className="size-4 rotate-180" />
            Back to posts
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Forum Post Answers
            </h1>
            <p className="text-muted-foreground">
              Review and moderate forum post answers
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forum post answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search({ searchTerm: searchQuery });
              }
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <XIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Table */}
        <Card className="border-border/50 overflow-hidden p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 bg-muted/30">
                <TableHead className="text-foreground">Content</TableHead>
                <TableHead className="text-foreground">Author</TableHead>
                <TableHead className="text-foreground">Created</TableHead>
                <TableHead className="text-foreground">Accepted</TableHead>
                <TableHead className="text-foreground">Edited</TableHead>
                <TableHead className="text-foreground">Flags</TableHead>
                <TableHead className="text-right text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forumPostAnswers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No answers found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                forumPostAnswers?.map((answer) => (
                  <TableRow
                    key={answer.id}
                    className="border-border/30 hover:bg-muted/50"
                  >
                    <TableCell className="font-medium text-foreground max-w-md truncate">
                      {answer.content}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <PostAuthorName authorId={answer.authorId} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ms(Date.now() - answer?.createdAt?.toMillis())} ago{" "}
                    </TableCell>
                    <TableCell>
                      {answer?.isAccepted && (
                        <div className="" title="Accepted answer">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {answer?.isEdited && (
                        <span className="text-xs text-muted-foreground">
                          Edited
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <FlagButton
                        flagType="answer"
                        id={answer.id}
                        onClick={() => {
                          setSelectedAnswer(answer);
                          setOpenAnswersSheet(true);
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedAnswer(answer);
                          setAnswerConfirmDelete(true);
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
          {!noForumPostAnswers && (
            <PaginationButtons
              hasNext={hasNext}
              hasPrev={hasPrev}
              next={next}
              previous={previous}
            />
          )}
        </Card>
      </div>

      {selectedAnswer && (
        <ForumFlagsSheet
          open={openAnswersSheet}
          onOpenChange={setOpenAnswersSheet}
          flagType="answer"
          id={selectedAnswer?.id}
        />
      )}

      {/* Confirm Delete Answer */}
      <AlertDialog
        open={answerConfirmDelete}
        onOpenChange={setAnswerConfirmDelete}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Answer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this answer. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={answerDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteAnswer(selectedAnswer.id)}
              disabled={answerDeleting}
            >
              {answerDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
