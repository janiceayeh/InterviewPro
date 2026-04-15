import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { ForumPost } from "@/lib/types";
import {
  getCountFromServer,
  query,
  collection,
  where,
} from "firebase/firestore";
import { Loader2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function useForumPostAnswersCount(postId: string) {
  const [forumPostAnswersCount, setForumPostAnswersCount] = useState(0);
  const [forumPostAnswersCountLoading, setForumPostAnswersCountLoading] =
    useState(false);
  const [forumPostAnswersCountError, setForumPostAnswersCountError] =
    useState<Error | null>(null);

  useEffect(() => {
    async function getForumPostAnswersCount() {
      if (postId) {
        try {
          setForumPostAnswersCountLoading(true);
          const answersCountSnap = await getCountFromServer(
            query(
              collection(db, COLLECTIONS.forumPostAnswers),
              where("postId", "==", postId),
            ),
          );
          setForumPostAnswersCount(answersCountSnap.data().count);
        } catch (error) {
          console.error(error);
          setForumPostAnswersCountError(error);
        } finally {
          setForumPostAnswersCountLoading(false);
        }
      }
    }

    getForumPostAnswersCount();
  }, [postId]);

  return {
    forumPostAnswersCount,
    forumPostAnswersCountLoading,
    forumPostAnswersCountError,
  };
}

type Props = {
  post: ForumPost;
};
export default function ForumPostAnswersCount({ post }: Props) {
  const { forumPostAnswersCount, forumPostAnswersCountLoading } =
    useForumPostAnswersCount(post?.id);

  if (forumPostAnswersCountLoading) {
    return <Loader2 className="size-4 mr-2 animate-spin text-primary" />;
  }
  return (
    <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
      <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
      <span className="text-foreground font-medium">
        {forumPostAnswersCount}
      </span>
    </button>
  );
}
