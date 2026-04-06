"use client";

import { motion } from "framer-motion";
import type { ForumAnswer } from "@/lib/types";
import { VoteButton } from "@/components/forum/vote-button";
import { formatDate } from "@/lib/forum-utils";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

interface AnswerItemProps {
  answer: ForumAnswer;
  onVoteChange?: (newVotes: number) => void;
}

export function AnswerItem({ answer, onVoteChange }: AnswerItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-lg p-6"
    >
      <div className="flex gap-4">
        {/* Vote sidebar */}
        <div className="shrink-0">
          <VoteButton
            itemId={answer.id}
            itemType="answer"
            votes={answer.votes}
            userVote={answer.userVote}
            onVoteChange={onVoteChange}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">
                  {answer.author.name}
                </span>
                {answer.author.isAdmin && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(answer.createdAt)}
              </p>
            </div>
          </div>

          {/* Answer content */}
          <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
            <p className="text-foreground whitespace-pre-wrap">
              {answer.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {answer.replies > 0 && (
              <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                <MessageCircle className="size-3" />
                {answer.replies} {answer.replies === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
