"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
  itemId: string;
  itemType: "post" | "answer";
  votes: number;
  userVote?: 1 | -1 | 0;
  onVoteChange?: (newVotes: number) => void;
}

export function VoteButton({
  itemId,
  itemType,
  votes,
  userVote = 0,
  onVoteChange,
}: VoteButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localVotes, setLocalVotes] = useState(votes);
  const [localUserVote, setLocalUserVote] = useState(userVote);

  const handleVote = async (voteType: 1 | -1) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    setIsLoading(true);
    try {
      // Calculate new vote
      const newVote = localUserVote === voteType ? 0 : voteType;
      const voteDiff = newVote - localUserVote;

      await fetch("/api/forum/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: itemType,
          itemId,
          userId: user.uid,
          voteType: newVote,
        }),
      });

      setLocalVotes((prev) => prev + voteDiff);
      setLocalUserVote(newVote);
      onVoteChange?.(localVotes + voteDiff);
    } catch (error) {
      console.error("[v0] Vote error:", error);
      toast.error("Failed to vote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote(1)}
        disabled={isLoading}
        className={cn("h-8 w-8", localUserVote === 1 && "text-primary")}
      >
        <ThumbsUp className="size-4" />
      </Button>

      <span className="text-sm font-medium text-foreground">{localVotes}</span>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
        className={cn("h-8 w-8", localUserVote === -1 && "text-destructive")}
      >
        <ThumbsDown className="size-4" />
      </Button>
    </div>
  );
}
