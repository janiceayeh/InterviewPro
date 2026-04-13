"use client";

import { useUserProfile } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

type Props = {
  authorId: string;
};

export default function PostAuthorName({ authorId }: Props) {
  const { userProfile, userProfileLoading } = useUserProfile(authorId);

  if (userProfileLoading) {
    return <Loader2 className="size-4 mr-2 animate-spin text-primary" />;
  }

  return (
    <>
      {userProfile?.firstname} {userProfile?.lastname}
    </>
  );
}
