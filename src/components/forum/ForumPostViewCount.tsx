import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { ForumPost } from "@/lib/types";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

function usePostViewCounts(postId: string) {
  const [loading, setLoading] = useState(true);
  const [postViews, setPostViews] = useState(0);

  useEffect(() => {
    async function getPostViews() {
      try {
        const viewsSnap = await getCountFromServer(
          query(
            collection(db, COLLECTIONS.forumPostViews),
            where("postId", "==", postId),
          ),
        );
        setPostViews(viewsSnap.data().count);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    getPostViews();
  }, [postId]);

  return {
    loading,
    postViews,
  };
}

type Props = {
  post: ForumPost;
};

export default function ForumPostViewCount({ post }: Props) {
  const { postViews } = usePostViewCounts(post.id);
  return (
    <div className="flex items-center gap-1">
      <Eye className="w-3 h-3 md:w-4 md:h-4" />
      <span className="font-medium text-xs">{postViews}</span>
    </div>
  );
}
