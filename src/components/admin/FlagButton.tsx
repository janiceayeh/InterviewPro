"use client";

import { useForumFlags } from "@/lib/hooks";
import { ForumFlagsOptions } from "@/lib/types";
import { Flag, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface Props extends ForumFlagsOptions {
  onClick(): void;
}

export default function FlagButton({ flagType, id, onClick }: Props) {
  const { flagsLoading, flagsGetCount, flagsCount } = useForumFlags();

  useEffect(() => {
    flagsGetCount({ flagType, id });
  }, []);

  if (flagsLoading) {
    return <Loader2 className="size-4 mr-2 animate-spin text-primary" />;
  }
  return (
    <button
      className="p-2 flex items-center cursor-pointer bg-secondary rounded"
      onClick={onClick}
    >
      <Flag className="h-4 w-4 text-destructive mr-1" />{" "}
      <span>{flagsCount}</span>
    </button>
  );
}
