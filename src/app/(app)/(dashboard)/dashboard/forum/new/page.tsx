"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/context/auth-context";
import { COLLECTIONS, forumCategories } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { routes } from "@/lib/routes";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ForumPost } from "@/lib/types";
import { db } from "@/lib/firebase";

const ForumPostSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(500, "Title must be less than 500 characters"),
  content: z
    .string()
    .min(10, "Details must be at least 10 characters")
    .max(1000, "Details must be less than 1000 characters"),
  category: z.string().min(1, "Select a category"),
  tags: z.array(z.string()).default([]),
});

type ForumPostFormData = z.infer<typeof ForumPostSchema>;

function useForumPostCreate() {
  const { user } = useAuth();
  const [forumPostCreateLoading, setForumPostCreateLoading] = useState(false);
  const [formPostCreateError, setForumPostCreateError] = useState<Error | null>(
    null,
  );

  const forumPostCreate = async (data: ForumPostFormData) => {
    try {
      setForumPostCreateLoading(true);
      const newPost = await addDoc(collection(db, COLLECTIONS.forumPosts), {
        ...data,
        authorId: user?.uid,
        createdAt: serverTimestamp() as Timestamp,
        isAnswered: false,
        hasAcceptedAnswer: false,
      } satisfies Partial<ForumPost>);

      return { ok: true, newPost };
    } catch (error) {
      console.error(error);
      setForumPostCreateError(error);
      return { error: error as Error };
    } finally {
      setForumPostCreateLoading(false);
    }
  };

  return {
    forumPostCreateLoading,
    forumPostCreate,
    formPostCreateError,
  };
}

export default function NewForumPostPage() {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const { forumPostCreate, forumPostCreateLoading } = useForumPostCreate();

  const form = useForm({
    resolver: zodResolver(ForumPostSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      tags: [],
    },
  });

  const tags = form.watch("tags");

  const tagHandleAdd = () => {
    if (tagInput.trim() && tagInput.length > 0 && tagInput.length < 500) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, tagInput]);
      setTagInput("");
    } else {
      toast.error("Tag should be less than 500 characters");
    }
  };

  const tagHandleRemove = (index: number) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((_, i) => i !== index),
    );
  };

  const onSubmit: SubmitHandler<ForumPostFormData> = async (data) => {
    try {
      const { error, newPost, ok } = await forumPostCreate(data);
      if (error) {
        toast.error(`Failed to create post: ${error.message}`);
      }

      if (ok) {
        toast.success("Post created successfully");
        form.reset();
        router.push(routes.forumPost({ postId: newPost.id }));
      }
    } catch (error) {
      console.error(error);
      toast.error(`Oops! Something went wrong: ${(error as Error).message}`);
    }
  };

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
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="p-6 space-y-1">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Question Title *</FormLabel>
                    <FormControl>
                      <Input
                        name="title"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="What's your interview question?"
                        className="text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      Be specific and concise about your question
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Details *</FormLabel>
                    <FormControl>
                      <Textarea
                        name="content"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Provide more context about your question. What have you tried? What's the specific challenge?"
                        className="min-h-50 text-base"
                      />
                    </FormControl>
                    <FormDescription>
                      Include relevant details to help others provide better
                      answers
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {forumCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={(field) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a helpful tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              tagHandleAdd();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={tagHandleAdd}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="pl-2">
                            {tag}
                            <button
                              type="button"
                              onClick={() => tagHandleRemove(idx)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={forumPostCreateLoading}
                className="flex items-center gap-2"
              >
                {forumPostCreateLoading && (
                  <Loader2 className="size-5 animate-spin" />
                )}
                Post Question
              </Button>
              <Button type="button" variant="outline" size="lg" asChild>
                <Link href={routes.forum()}>Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>

      {/* Tips */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-foreground mb-3">
          Tips for a good question:
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Be specific about the company or interview type</li>
          <li>• Include what you've already tried or researched</li>
          <li>• Provide relevant context (role level, timeline, etc.)</li>
          <li>• Proofread for clarity</li>
          <li>• Avoid asking multiple questions in one post</li>
        </ul>
      </Card>
    </div>
  );
}
