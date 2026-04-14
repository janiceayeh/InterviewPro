"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/lib/routes";

import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { COLLECTIONS, forumCategories } from "@/lib/constants";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { z } from "zod";
import { ForumPost } from "@/lib/types";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

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

function useForumPostUpdate(postId: string) {
  const [forumPostUpdateLoading, setForumPostUpdateLoading] = useState(false);
  const [formPostUpdateError, setForumPostUpdateError] = useState<Error | null>(
    null,
  );

  async function forumPostUpdate(data: ForumPostFormData) {
    try {
      setForumPostUpdateLoading(true);
      await updateDoc(doc(db, COLLECTIONS.forumPosts, postId), {
        ...data,
        updatedAt: serverTimestamp() as Timestamp,
        isEdited: true,
      } satisfies Partial<ForumPost>);

      return { ok: true };
    } catch (error) {
      setForumPostUpdateError(error);
      console.error(error);
      return { error: error as Error };
    } finally {
      setForumPostUpdateLoading(false);
    }
  }

  return {
    forumPostUpdateLoading,
    forumPostUpdate,
    formPostUpdateError,
  };
}

type Props = {
  post?: ForumPost;
};
export default function ForumPostForm({ post }: Props) {
  const isEditForm = !!post;
  const router = useRouter();

  const { forumPostCreate, forumPostCreateLoading } = useForumPostCreate();
  const { forumPostUpdate, forumPostUpdateLoading } = useForumPostUpdate(
    post?.id,
  );
  const [tagInput, setTagInput] = useState("");

  const form = useForm({
    resolver: zodResolver(ForumPostSchema),
    defaultValues: {
      title: post?.title ?? "",
      content: post?.content ?? "",
      category: post?.category ?? "",
      tags: post?.tags ?? [],
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
      if (isEditForm) {
        const { error, ok } = await forumPostUpdate(data);
        if (error) {
          toast.error(`Failed to update post: ${error.message}`);
        }

        if (ok) {
          toast.success("Post updated successfully");
          form.reset();
          router.push(routes.forumPost({ postId: post.id }));
        }
        return;
      }
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
                  Include relevant details to help others provide better answers
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
                      onKeyDown={(e) => {
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
            disabled={forumPostCreateLoading || forumPostUpdateLoading}
            className="flex items-center gap-2"
          >
            {(forumPostCreateLoading || forumPostUpdateLoading) && (
              <Loader2 className="size-5 animate-spin" />
            )}
            {isEditForm ? "Update Question" : " Post Question"}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href={routes.forum()}>Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
