"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/context/auth-context";
import type { ForumPost, UserProfile, ForumPostView } from "@/lib/types";
import { toast } from "sonner";
import { ChevronRight, Loader2, User, DotIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import PageLoading from "@/components/page-loading";
import { routes } from "@/lib/routes";
import ms from "ms";
import { ForumPostVoteButton } from "@/components/forum/ForumPostVoteButton";
import ForumPostViewCount from "@/components/forum/ForumPostViewCount";
import ForumPostAnswersCount, {
  useForumPostAnswersCount,
} from "@/components/forum/ForumPostAnswersCount";
import ForumPostAnswerForm from "@/components/forum/ForumPostAnswerForm";
import ForumPostAnswerCard from "@/components/forum/ForumPostAnswerCard";
import { useForumPostAnswers } from "@/lib/hooks";
import PaginationButtons from "@/components/pagination-buttons/PaginationButtons";
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

function useForumPost({ postId }: { postId: string }) {
  const [forumPostLoading, setForumPostLoading] = useState(false);
  const [forumPost, setForumPost] = useState<ForumPost | null>(null);
  const [forumPostAuthor, setForumPostAuthor] = useState<UserProfile | null>(
    null,
  );

  async function forumPostGet(postId: string) {
    try {
      if (postId) {
        setForumPostLoading(true);
        const postSnap = await getDoc(doc(db, COLLECTIONS.forumPosts, postId));
        const post = postSnap.data() as ForumPost;
        setForumPost({ id: postSnap.id, ...post });

        if (post) {
          const authorSnap = await getDoc(
            doc(db, COLLECTIONS.users, post.authorId),
          );
          const author = authorSnap.data() as UserProfile;
          setForumPostAuthor({ id: authorSnap.id, ...author });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load post");
    } finally {
      setForumPostLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await forumPostGet(postId);
    })();
  }, [postId]);

  return {
    forumPostLoading,
    forumPost,
    forumPostAuthor,
    forumPostGet,
  };
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const postId = params.postId as string;

  const { forumPost, forumPostLoading, forumPostAuthor, forumPostGet } =
    useForumPost({
      postId,
    });

  const {
    first,
    forumPostAnswers,
    hasNext,
    hasPrev,
    loading: forumPostAnswersLoading,
    next,
    previous,
    refetch,
  } = useForumPostAnswers(postId);

  const [postConfirmDelete, setPostConfirmDelete] = useState(false);
  const [postDeleting, setPostDeleting] = useState(false);

  const { forumPostAnswersCount } = useForumPostAnswersCount(postId);

  const isPostAuthor = user?.uid === forumPost?.authorId;

  async function deletePost(postId: string) {
    try {
      setPostDeleting(true);
      await deleteDoc(doc(db, COLLECTIONS.forumPosts, postId));
      toast.success("Post deleted successfully");
      router.push(routes.forum());
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete post: ${(error as Error).message}`);
    } finally {
      setPostDeleting(false);
    }
  }

  // Upsert post views record
  useEffect(() => {
    async function increasePostViewCount() {
      if (forumPost && user) {
        try {
          // deterministic doc id ensures single doc per (post,user)
          const deterministicId = `${forumPost?.id}_${user?.uid}`;
          const ref = doc(db, COLLECTIONS.forumPostViews, deterministicId);
          await setDoc(
            ref,
            {
              postId: forumPost?.id,
              userId: user?.uid,
              createdAt: serverTimestamp() as Timestamp,
            } satisfies Omit<ForumPostView, "id">,
            { merge: true },
          );
        } catch (error) {
          console.error(error);
        }
      }
    }

    increasePostViewCount();
  }, [forumPost, user]);

  useEffect(() => {
    first();
  }, []);

  if (!forumPostLoading && !forumPost) {
    return (
      <div className="flex justify-center py-10">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Post not found</p>
        </Card>
      </div>
    );
  }

  if (forumPostLoading) return <PageLoading />;

  return (
    <>
      <div className="flex justify-center   py-10 w-full">
        <div className="min-w-lg max-w-lg">
          <Link href={routes.forum()}>
            <Button
              variant="link"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors p-0!"
            >
              <ChevronRight className="size-4 rotate-180" />
              Back to posts
            </Button>
          </Link>

          {/* Post Content */}
          <div className="space-y-4">
            {/* Author and metadata */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">
                    {forumPostAuthor?.firstname}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {forumPostAuthor?.role}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {ms(Date.now() - forumPost.createdAt?.toMillis())} ago{" "}
                {forumPost?.isEdited && (
                  <span className="text-xs text-muted-foreground">
                    <DotIcon className="inline" /> Edited
                  </span>
                )}
              </div>
            </div>

            {/* Post Title and Content */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                {forumPost.title}
              </h2>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {forumPost.content}
              </p>
            </div>

            {/* Engagement Metrics */}
            <div className="flex items-center gap-4 py-3 border-y border-border text-xs ">
              <ForumPostVoteButton post={forumPost} />
              <Link href="#post_answers">
                <ForumPostAnswersCount post={forumPost} />
              </Link>
              <ForumPostViewCount post={forumPost} />
              {isPostAuthor && (
                <Link href={routes.editForumPost({ postId: forumPost?.id })}>
                  <button className="hover:text-primary transition-colors cursor-pointer">
                    Edit
                  </button>
                </Link>
              )}
              {isPostAuthor && (
                <button
                  className="hover:text-primary transition-colors cursor-pointer text-destructive"
                  onClick={() => setPostConfirmDelete(true)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Answer Form */}
          {user && (
            <ForumPostAnswerForm
              postId={postId}
              userId={user?.uid}
              onCreate={first}
              onUpdate={refetch}
            />
          )}

          {/* Post tags */}
          <div className="py-2 flex gap-2 flex-wrap">
            {forumPost.tags?.length > 0 &&
              forumPost.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
          </div>

          {/* Answers Section */}
          <div
            id="post_answers"
            className="space-y-4 py-4 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">
                {forumPostAnswersCount}{" "}
                {forumPostAnswersCount === 1 ? "Comment" : "Comments"}
              </h3>
              {/* TODO: Sort answers */}
              {/* <Button variant="ghost" size="sm" className="text-xs h-7">
              Popular ▼
            </Button> */}
            </div>

            {forumPostAnswersLoading ? (
              <div className="h-4 flex justify-center items-center">
                {" "}
                <Loader2 className="size-4 mr-2 animate-spin text-primary" />
              </div>
            ) : forumPostAnswers.length > 0 ? (
              <div className="space-y-4">
                {forumPostAnswers.map((answer) => (
                  <ForumPostAnswerCard
                    key={answer.id}
                    answer={answer}
                    userId={user?.uid}
                    post={forumPost}
                    onAcceptAnswer={() => {
                      refetch();
                      forumPostGet(postId);
                    }}
                    refetchAnswers={refetch}
                  />
                ))}

                {/* Pagination Buttons */}
                {forumPostAnswers.length !== 0 && (
                  <PaginationButtons
                    previous={previous}
                    hasNext={hasNext}
                    hasPrev={hasPrev}
                    next={next}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  No comments yet. Be the first to contribute!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Answer */}
      <AlertDialog open={postConfirmDelete} onOpenChange={setPostConfirmDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this post. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={postDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deletePost(forumPost?.id)}
              disabled={postDeleting}
            >
              {postDeleting && (
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
