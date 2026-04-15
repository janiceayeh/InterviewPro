"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import { motion } from "framer-motion";
import { routes } from "@/lib/routes";

import ForumPostForm from "@/components/forum/ForumPostForm";
import TipsForGoodQuestion from "@/components/forum/TipsForGoodQuestion";
import { ArrowLeft } from "lucide-react";

export default function NewForumPostPage() {
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
              Ask a Question
            </h1>
            <p className="text-muted-foreground">
              Share your interview question with the community
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ForumPostForm />
      </motion.div>

      {/* Tips */}
      <TipsForGoodQuestion />
    </div>
  );
}
