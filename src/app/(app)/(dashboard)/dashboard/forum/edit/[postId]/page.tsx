"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { routes } from "@/lib/routes";

import ForumPostForm from "@/components/forum/ForumPostForm";
import TipsForGoodQuestion from "@/components/forum/TipsForGoodQuestion";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import PageLoading from "@/components/page-loading";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { ForumPost } from "@/lib/types";
import { getDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function EditForumPostPage() {
  const params = useParams();
  const postId = params.postId as string;

  const [forumPost, setForumPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getForumPost() {
      if (postId) {
        try {
          const postSnap = await getDoc(
            doc(db, COLLECTIONS.forumPosts, postId),
          );
          const post = postSnap.data() as ForumPost;
          setForumPost({ id: postSnap.id, ...post });
        } catch (error) {
          console.error(error);
          toast.error("Failed to load question");
        } finally {
          setLoading(false);
        }
      }
    }

    getForumPost();
  }, [postId]);

  if (loading) return <PageLoading />;
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={routes.forum()}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edit Question
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ForumPostForm post={forumPost} />
      </motion.div>

      {/* Tips */}
      <TipsForGoodQuestion />
    </div>
  );
}
