"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/context/auth-context";
import type { ForumPost, ForumAnswer, UserProfile } from "@/lib/types";
import { toast } from "sonner";
import {
  MessageCircle,
  Loader2,
  CircleQuestionMarkIcon,
  ChevronRight,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import PageLoading from "@/components/page-loading";
import { routes } from "@/lib/routes";
import ms from "ms";
import { ForumPostVoteButton } from "@/components/forum/ForumPostVoteButton";

function useForumPost({ postId }: { postId: string }) {
  const [forumPostLoading, setForumPostLoading] = useState(false);
  const [forumPost, setForumPost] = useState<ForumPost | null>(null);
  const [forumPostAuthor, setForumPostAuthor] = useState<UserProfile | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      try {
        if (postId) {
          setForumPostLoading(true);
          const postSnap = await getDoc(
            doc(db, COLLECTIONS.forumPosts, postId),
          );
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
    })();
  }, [postId]);

  return {
    forumPostLoading,
    forumPost,
    forumPostAuthor,
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const postId = params.postId as string;

  const [answers, setAnswers] = useState<ForumAnswer[]>([]);
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmittingAnswer, setIsSubmitting] = useState(false);

  const { forumPost, forumPostLoading, forumPostAuthor } = useForumPost({
    postId,
  });

  const handlePostAnswer = async (e: React.FormEvent) => {};

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/forum/posts/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

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
                <CircleQuestionMarkIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {forumPostAuthor?.firstname}
                </h3>
                <p className="text-xs text-muted-foreground">
                  First time poster
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <span>
                {ms(Date.now() - forumPost.createdAt?.toMillis())} ago
              </span>
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
          <div className="flex items-center gap-4 py-3 border-y border-border">
            <ForumPostVoteButton post={forumPost} />
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="text-foreground font-medium">
                {forumPost.answers}
              </span>
            </button>
          </div>
        </div>

        {/* Comment Form */}
        {user && (
          <div className="space-y-3 py-4 ">
            <Textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder=""
              className="min-h-20 text-sm"
            />
            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={isSubmittingAnswer || !answerContent.trim()}
                  onClick={handlePostAnswer}
                >
                  {isSubmittingAnswer && (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  )}
                  Comment
                </Button>
                <Link href={routes.forum()}>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Post tags */}
        <div className="py-2">
          {forumPost.tags?.length > 0 &&
            forumPost.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>

        {/* Answers/Comments Section */}
        <div className="space-y-4 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">
              {forumPost.answers}{" "}
              {forumPost.answers === 1 ? "Comment" : "Comments"}
            </h3>
            {/* TODO: Sort comments/answers */}
            {/* <Button variant="ghost" size="sm" className="text-xs h-7">
              Popular ▼
            </Button> */}
          </div>

          {answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((answer) => (
                <div key={answer.id} className="border-t border-border pt-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CircleQuestionMarkIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">
                            {"answer.author.name"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {ms(Date.now() - answer?.createdAt?.toMillis())} ago
                          </p>
                        </div>
                        <span className="text-xs cursor-pointer hover:text-foreground transition-colors">
                          ···
                        </span>
                      </div>
                      <p className="text-xs text-foreground mt-2 leading-relaxed">
                        {answer.content}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <button className="hover:text-primary transition-colors">
                          Like
                        </button>
                        <button className="hover:text-primary transition-colors">
                          Reply
                        </button>
                        <button className="hover:text-primary transition-colors">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
  );
}
