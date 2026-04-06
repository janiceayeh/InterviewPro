"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { MoreVertical, Pin, Lock, Trash2 } from "lucide-react";

interface ModerationActionsProps {
  postId: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isAdmin?: boolean;
  onModerate?: () => void;
}

// This would typically check against a Firebase admin role
const ADMIN_EMAILS = ["admin@interviewpro.com"];

export function ModerationActions({
  postId,
  isPinned = false,
  isLocked = false,
  isAdmin = false,
  onModerate,
}: ModerationActionsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is admin
  const userIsAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (!userIsAdmin) {
    return null;
  }

  const handleModerate = async (
    action: "pin" | "lock" | "delete",
    value?: boolean,
  ) => {
    setIsLoading(true);
    try {
      if (action === "delete") {
        await fetch(`/api/forum/posts/${postId}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete" }),
        });
        toast.success("Post deleted");
      } else {
        await fetch("/api/forum/moderation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId,
            action,
            ...(action === "pin" && { isPinned: !isPinned }),
            ...(action === "lock" && { isLocked: !isLocked }),
          }),
        });
        toast.success(
          `Post ${action === "pin" ? (isPinned ? "unpinned" : "pinned") : isLocked ? "unlocked" : "locked"}`,
        );
      }
      onModerate?.();
    } catch (error) {
      console.error("[v0] Moderation error:", error);
      toast.error("Failed to moderate post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleModerate("pin")}
          className="flex items-center gap-2"
        >
          <Pin className="size-4" />
          {isPinned ? "Unpin" : "Pin"} Post
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleModerate("lock")}
          className="flex items-center gap-2"
        >
          <Lock className="size-4" />
          {isLocked ? "Unlock" : "Lock"} Post
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleModerate("delete")}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="size-4" />
          Delete Post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
