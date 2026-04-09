import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { ForumPost, ForumPostVote } from "@/lib/types";
import {
  getCountFromServer,
  query,
  collection,
  where,
} from "firebase/firestore";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function useForumPostAnswersCount(postId: string) {
  const [forumPostAnswersCount, setForumPostAnswersCount] = useState(0);

  useEffect(() => {
    async function getForumPostAnswersCount() {
      if (postId) {
        try {
          const answersCountSnap = await getCountFromServer(
            query(
              collection(db, COLLECTIONS.forumPostAnswers),
              where("postId", "==", postId),
            ),
          );
          setForumPostAnswersCount(answersCountSnap.data().count);
        } catch (error) {
          console.error(error);
        }
      }
    }

    getForumPostAnswersCount();
  }, [postId]);

  return {
    forumPostAnswersCount,
  };
}

type Props = {
  post: ForumPost;
};
export default function ForumPostAnswersCount({ post }: Props) {
  const { forumPostAnswersCount } = useForumPostAnswersCount(post?.id);
  return (
    <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
      <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
      <span className="text-foreground font-medium">
        {forumPostAnswersCount}
      </span>
    </button>
  );
}
