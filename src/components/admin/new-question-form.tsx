"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { InterviewQuestion } from "@/lib/types";
import { useRoles } from "@/lib/hooks";
import PageLoading from "../page-loading";

const questionSchema = z.object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be less than 500 characters"),
  category: z.enum(["behavioral", "technical", "situational", "general"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeLimit: z
    .number()
    .min(30, "Minimum 30 seconds")
    .max(600, "Maximum 10 minutes")
    .default(120),
  tips: z.array(z.string()).default([]),
  roles: z.array(z.string()).min(1, "Add at least one role"),
  status: z.enum(["draft", "published"]).default("draft"),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface NewQuestionFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  question?: InterviewQuestion;
}

const categories = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "situational", label: "Situational" },
  { value: "general", label: "General" },
];

const difficulties = [
  { value: "easy", label: "Easy", color: "bg-emerald-500/20 text-emerald-700" },
  { value: "medium", label: "Medium", color: "bg-amber-500/20 text-amber-700" },
  { value: "hard", label: "Hard", color: "bg-red-500/20 text-red-700" },
];

async function interviewQuestionUpdate(
  questionId: string,
  question: Partial<InterviewQuestion>,
) {
  try {
    await updateDoc(
      doc(db, COLLECTIONS.interviewQuestions, questionId),
      question,
    );

    return { ok: true };
  } catch (error) {
    return { error: error as Error };
  }
}

async function interviewQuestionExists(question: string) {
  try {
    const docSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.interviewQuestions),
        where("question", "==", question),
        limit(1),
      ),
    );
    return { ok: true, exists: !docSnap.empty };
  } catch (error) {
    return { error: error as Error };
  }
}

async function interviewQuestionCreate(data: QuestionFormData) {
  try {
    const { ok, error, exists } = await interviewQuestionExists(data.question);
    if (error) return { error };

    if (ok) {
      if (exists) return { error: new Error("Question already exists") };
    }
    const newInterviewQuestion = await addDoc(
      collection(db, COLLECTIONS.interviewQuestions),
      {
        ...data,
        createdAt: serverTimestamp() as Timestamp,
      } satisfies Omit<InterviewQuestion, "id">,
    );

    return { ok: true, newInterviewQuestion };
  } catch (error) {
    return { error: error as Error };
  }
}

export function NewQuestionForm({
  onClose,
  onSuccess,
  question,
}: NewQuestionFormProps) {
  const [tipInput, setTipInput] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [roleSelected, setRoleSelected] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { roles: industryRoles, rolesLoading } = useRoles();

  const allRoles = industryRoles?.reduce<string[]>(
    (acc, r) => [...acc, ...r.roles],
    [],
  );

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: question?.question ?? "",
      category: question?.category ?? "behavioral",
      difficulty: question?.difficulty ?? "medium",
      timeLimit: question?.timeLimit ?? 120,
      tips: question?.tips ?? [],
      status: question?.status ?? "draft",
      roles: question?.roles ?? [],
    },
  });

  const handleAddTip = () => {
    if (tipInput.trim() && tipInput.length > 0) {
      const currentTips = form.getValues("tips");
      form.setValue("tips", [...currentTips, tipInput]);
      setTipInput("");
    }
  };

  const handleRemoveTip = (index: number) => {
    const currentTips = form.getValues("tips");
    form.setValue(
      "tips",
      currentTips.filter((_, i) => i !== index),
    );
  };

  const onSubmit: SubmitHandler<QuestionFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      if (question) {
        const { error, ok } = await interviewQuestionUpdate(question.id, data);
        if (error) {
          console.error(error);
          toast.error(`Failed to update question: ${error.message}`);
        } else if (ok) {
          toast.success("Question updated successfully");
          onSuccess?.();
        }
      } else {
        const { error, ok } = await interviewQuestionCreate(data);
        if (error) {
          console.error(error);
          toast.error(`Failed to create question: ${error.message}`);
        } else if (ok) {
          toast.success("Question created successfully");
          form.reset();
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tips = form.watch("tips");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the interview question..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="timeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Limit (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="30"
                  max="600"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Between 30 seconds and 10 minutes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Tips (Optional)</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a helpful tip..."
              value={tipInput}
              onChange={(e) => setTipInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTip();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddTip}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tips.map((tip, idx) => (
                <Badge key={idx} variant="secondary" className="pl-2">
                  {tip}
                  <button
                    type="button"
                    onClick={() => handleRemoveTip(idx)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="roles"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2">
                <label className="text-sm font-medium">Roles</label>
                <div className="flex gap-2 items-center">
                  {rolesLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Select
                      value={roleSelected}
                      onValueChange={(role) => {
                        setRoleSelected(role);
                        const newRoles = [...roles, role];
                        setRoles(newRoles);
                        field.onChange(newRoles);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTip}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role, idx) => (
                      <Badge key={idx} variant="secondary" className="pl-2">
                        {role}
                        <button
                          type="button"
                          onClick={() => {
                            const newRoles = roles.filter((r) => r !== role);
                            setRoles(newRoles);
                            field.onChange(newRoles);
                          }}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {question ? "Update Question" : "Create Question"}
          </Button>
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
