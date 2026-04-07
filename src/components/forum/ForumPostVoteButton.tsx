"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ForumPost } from "@/lib/types";

interface Props {
  post: ForumPost;
}

export function ForumPostVoteButton({ post }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
        <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
        <span className="text-foreground font-medium">{post.votes ?? 0}</span>
      </button>

      <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
        <ThumbsDown className="w-3 h-3 md:w-4 md:h-4" />
        <span className="text-foreground font-medium">{post.votes ?? 0}</span>
      </button>
    </div>
  );
}
