"use client";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Form,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { routes } from "@/lib/routes";
import Link from "next/link";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import { ForumPost, ForumPostAnswer } from "@/lib/types";
import { useRouter } from "next/navigation";

const AnswerSchema = z.object({
  content: z
    .string()
    .min(10, "Answer must be at least 10 characters")
    .max(1000, "Answer must be less than 1000 characters"),
});

type AnswerFormData = z.infer<typeof AnswerSchema>;

async function forumPostAnswerExists(content: string) {
  try {
    const docSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.forumPostAnswers),
        where("content", "==", content),
        limit(1),
      ),
    );
    return { ok: true, exists: !docSnap.empty };
  } catch (error) {
    return { error: error as Error };
  }
}

async function forumPostAnswerCreate({
  data,
  userId,
  postId,
}: {
  data: AnswerFormData;
  userId: string;
  postId: string;
}) {
  try {
    const { ok, error, exists } = await forumPostAnswerExists(data.content);
    if (error) return { error };

    if (ok) {
      if (exists) return { error: new Error("Answer already exists") };
    }
    const newAnswer = await addDoc(
      collection(db, COLLECTIONS.forumPostAnswers),
      {
        ...data,
        authorId: userId,
        isAccepted: false,
        isEdited: false,
        postId: postId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: null,
      } satisfies Omit<ForumPostAnswer, "id">,
    );

    await updateDoc(doc(db, COLLECTIONS.forumPosts, postId), {
      isAnswered: true,
      updatedAt: serverTimestamp() as Timestamp,
    } satisfies Partial<ForumPost>);

    return { ok: true, newAnswer };
  } catch (error) {
    return { error: error as Error };
  }
}

async function forumPostAnswerUpdate(answerId: string, content: string) {
  try {
    await updateDoc(doc(db, COLLECTIONS.forumPostAnswers, answerId), {
      content,
      isEdited: true,
      updatedAt: serverTimestamp() as Timestamp,
    } satisfies Partial<ForumPostAnswer>);

    return { ok: true };
  } catch (error) {
    return { error: error as Error };
  }
}

type Props = {
  userId: string;
  postId: string;
  answer?: ForumPostAnswer;
  onUpdate?: () => void;
  onCreate?: (answerId: string) => void;
  onCancel?: () => void;
};
export default function ForumPostAnswerForm({
  postId,
  userId,
  answer,
  onUpdate,
  onCreate,
  onCancel,
}: Props) {
  const router = useRouter();
  const [isSubmittingAnswer, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: answer?.content ?? "",
    },
  });

  const answerContent = form.watch("content");

  const onSubmit: SubmitHandler<AnswerFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      if (answer) {
        // update answer
        const { ok, error } = await forumPostAnswerUpdate(
          answer.id,
          data.content,
        );
        if (error) {
          console.error(error);
          toast.error(`Failed to update answer: ${error.message}`);
        }
        if (ok) {
          toast.success("Update successful");
          form.reset();
          onUpdate?.();
        }
        return;
      }

      //create answer
      const { error, ok, newAnswer } = await forumPostAnswerCreate({
        data,
        postId: postId,
        userId: userId,
      });
      if (error) {
        console.error(error);
        toast.error(`Failed to save answer: ${error.message}`);
      }
      if (ok) {
        toast.success("Answer saved successfully");
        form.reset();
        onCreate?.(newAnswer.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form} data-testid="answer-form">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="space-y-3 py-4 ">
                  <Textarea
                    placeholder="Enter an answer. Be helpful and polite."
                    className="min-h-20 text-sm"
                    {...field}
                  />
                  <div className="flex gap-2 justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmittingAnswer || !answerContent.trim()}
                      >
                        {isSubmittingAnswer && (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        )}
                        Answer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onCancel ? onCancel() : router.push(routes.forum())
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
