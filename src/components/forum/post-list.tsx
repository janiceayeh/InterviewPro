"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ForumPost } from "@/lib/types";
import { formatDate } from "@/lib/forum-utils";
import { ThumbsUp, MessageCircle, Eye, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PostListProps {
  posts: ForumPost[];
  isLoading?: boolean;
}

export function PostList({ posts, isLoading }: PostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="size-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No posts found
        </h3>
        <p className="text-muted-foreground">
          Be the first to start a discussion!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link href={`/dashboard/forum/posts/${post.id}`}>
            <div
              className={cn(
                "border rounded-lg hover:border-primary/30 hover:bg-muted/50 transition-all p-4 cursor-pointer group",
                post.isPinned
                  ? "border-primary/40 bg-primary/5"
                  : "border-border",
              )}
            >
              <div className="flex gap-4">
                {/* Vote sidebar */}
                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="size-4" />
                    <span className="font-medium">{post.votes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="size-4" />
                    <span className="font-medium">{post.answers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="size-4" />
                    <span className="font-medium text-xs">{post.views}</span>
                  </div>
                </div>

                {/* Post content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-balance mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.isPinned && (
                      <Badge className="bg-primary/20 text-primary border-0 text-xs flex items-center gap-1">
                        <Pin className="size-3" />
                        Pinned
                      </Badge>
                    )}
                    {post.tags.length > 0 &&
                      post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>by {post.author.name}</span>
                    <span>{formatDate(post.createdAt)}</span>
                    {post.isAnswered && (
                      <span className="bg-green-500/10 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                        Has answers
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
