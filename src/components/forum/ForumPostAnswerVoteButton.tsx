"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ForumPostAnswer, ForumPostAnswerVote } from "@/lib/types";
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

function useForumPostAnswerVote({ answer }: { answer: ForumPostAnswer }) {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState({ upvote: 0, downvote: 0 });
  const [voteLoading, setVoteLoading] = useState(true);
  const [voteCountLoading, setVoteCountLoading] = useState(true);
  const [vote, setVote] = useState<ForumPostAnswerVote | null>(null);

  async function doVote(voteType: ForumPostAnswerVote["voteType"]) {
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
      const deterministicId = `${answer.id}_${user.uid}`;
      const ref = doc(db, COLLECTIONS.forumPostAnswerVotes, deterministicId);
      // Use merge so it creates if missing, updates otherwise.

      const newVote: ForumPostAnswerVote = {
        id: deterministicId,
        answerId: answer.id,
        userId: user?.uid,
        voteType: voteType,
        createdAt: answer.createdAt ?? (serverTimestamp() as Timestamp),
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
      if (user && answer) {
        try {
          const deterministicId = `${answer.id}_${user.uid}`;
          const voteSnap = await getDoc(
            doc(db, COLLECTIONS.forumPostAnswerVotes, deterministicId),
          );
          const vote = voteSnap.data() as ForumPostAnswerVote;
          setVote(vote ?? null);
          setVoteLoading(false);
        } catch (error) {
          console.error(error);
        }
      }
    }
    getVote();
  }, [answer, user]);

  useEffect(() => {
    async function getVoteCount() {
      if (answer) {
        try {
          const upVoteSnap = await getCountFromServer(
            query(
              collection(db, COLLECTIONS.forumPostAnswerVotes),
              where("answerId", "==", answer.id),
              where(
                "voteType",
                "==",
                "upvote" satisfies ForumPostAnswerVote["voteType"],
              ),
            ),
          );
          const downVoteSnap = await getCountFromServer(
            query(
              collection(db, COLLECTIONS.forumPostAnswerVotes),
              where("answerId", "==", answer.id),
              where(
                "voteType",
                "==",
                "downvote" satisfies ForumPostAnswerVote["voteType"],
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
  }, [answer]);

  return {
    doVote,
    voteCount: voteCount,
    voteLoading: voteLoading || voteCountLoading,
    vote: vote,
  };
}

interface Props {
  answer: ForumPostAnswer;
}

export function ForumPostAnswerVoteButton({ answer }: Props) {
  const { doVote, vote, voteCount } = useForumPostAnswerVote({ answer });

  return (
    <div className="flex items-center gap-2">
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
