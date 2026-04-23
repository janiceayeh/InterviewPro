"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ForumPost, ForumPostVote } from "@/lib/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import {
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  query,
  collection,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

function useForumPostVote({ post }: { post: ForumPost }) {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState({ upvote: 0, downvote: 0 });
  const [voteLoading, setVoteLoading] = useState(true);
  const [voteCountLoading, setVoteCountLoading] = useState(true);
  const [vote, setVote] = useState<ForumPostVote | null>(null);

  async function doVote(voteType: ForumPostVote["voteType"]) {
    try {
      if (vote?.voteType === voteType) {
        return;
      }

      // Deterministic upvote
      if (voteType === "upvote") {
        setVoteCount((prev) => ({
          upvote: prev.upvote + 1,
          downvote: prev.downvote > 0 ? prev.downvote - 1 : 0,
        }));
      } else {
        setVoteCount((prev) => ({
          upvote: prev.upvote > 0 ? prev.upvote - 1 : 0,
          downvote: prev.downvote + 1,
        }));
      }
      // deterministic doc id ensures single doc per (post,user)
      const deterministicId = `${post.id}_${user.uid}`;
      const ref = doc(db, COLLECTIONS.forumPostVotes, deterministicId);
      // Use merge so it creates if missing, updates otherwise.

      const newVote: ForumPostVote = {
        id: deterministicId,
        postId: post.id,
        userId: user?.uid,
        voteType: voteType,
        createdAt: post.createdAt ?? (serverTimestamp() as Timestamp),
      };

      // set optimistic vote
      setVote(newVote);

      await setDoc(ref, newVote, { merge: true });
      toast.success(
        `${voteType === "upvote" ? "Upvote" : "Downvote"} successful`,
      );
    } catch (error) {
      console.error(error);
      toast.error("Vote failed");
      setVoteCount(voteCount);
      setVote(vote);
    }
  }

  useEffect(() => {
    async function getVote() {
      if (user && post) {
        try {
          const deterministicId = `${post.id}_${user.uid}`;
          const voteSnap = await getDoc(
            doc(db, COLLECTIONS.forumPostVotes, deterministicId),
          );
          const vote = voteSnap.data() as ForumPostVote;
          setVote(vote ?? null);
          setVoteLoading(false);
        } catch (error) {
          console.error(error);
        }
      }
    }
    getVote();
  }, [post, user]);

  useEffect(() => {
    async function getVoteCount() {
      if (post) {
        try {
          const upVoteSnap = await getCountFromServer(
            query(
              collection(db, COLLECTIONS.forumPostVotes),
              where("postId", "==", post.id),
              where(
                "voteType",
                "==",
                "upvote" satisfies ForumPostVote["voteType"],
              ),
            ),
          );
          const downVoteSnap = await getCountFromServer(
            query(
              collection(db, COLLECTIONS.forumPostVotes),
              where("postId", "==", post.id),
              where(
                "voteType",
                "==",
                "downvote" satisfies ForumPostVote["voteType"],
              ),
            ),
          );

          setVoteCount({
            upvote: upVoteSnap.data().count,
            downvote: downVoteSnap.data().count,
          });
          setVoteCountLoading(false);
        } catch (error) {
          console.error(error);
        }
      }
    }
    getVoteCount();
  }, [post]);

  return {
    doVote,
    voteCount: voteCount,
    voteLoading: voteLoading || voteCountLoading,
    vote: vote,
  };
}

interface Props {
  post: ForumPost;
}

export function ForumPostVoteButton({ post }: Props) {
  const { doVote, vote, voteCount } = useForumPostVote({ post });

  return (
    <div
      className="flex items-center gap-2"
      data-testid="forum-post-vote-button"
    >
      <button
        className={cn(
          "flex items-center gap-1 hover:text-primary transition-colors cursor-pointer",
          {
            "text-primary": vote?.voteType === "upvote",
          },
        )}
        disabled={vote?.voteType === "upvote"}
        onClick={() => doVote("upvote")}
      >
        <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
        <span className="text-foreground font-medium">
          {voteCount?.upvote ?? 0}
        </span>
      </button>

      <button
        className={cn(
          "flex items-center gap-1 hover:text-primary transition-colors cursor-pointer",
          {
            "text-primary": vote?.voteType === "downvote",
          },
        )}
        disabled={vote?.voteType === "downvote"}
        onClick={() => doVote("downvote")}
      >
        <ThumbsDown className="w-3 h-3 md:w-4 md:h-4" />
        <span className="text-foreground font-medium">
          {voteCount?.downvote ?? 0}
        </span>
      </button>
    </div>
  );
}
