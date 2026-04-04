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
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/lib/constants";
import { InterviewTip } from "@/lib/types";

const tipSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(300, "Summary must be less than 300 characters"),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters")
    .max(2000, "Content must be less than 2000 characters"),
  keyTakeaways: z
    .array(z.string().min(5, "Each takeaway must be at least 5 characters"))
    .min(1, "Add at least one key takeaway")
    .max(5, "Maximum 5 takeaways"),
  examples: z
    .array(z.string().min(10, "Each example must be at least 10 characters"))
    .default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});

type TipFormData = z.infer<typeof tipSchema>;

interface NewTipFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  tip?: InterviewTip;
}

const categories = [
  { value: "Preparation", label: "Preparation" },
  { value: "Communication", label: "Communication" },
  { value: "Technical", label: "Technical" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Body Language", label: "Body Language" },
  { value: "Follow-up", label: "Follow-up" },
  { value: "During Interview", label: "During Interview" },
  { value: "Common Questions", label: "Common Questions" },
];

async function interviewTipExists(title: string) {
  try {
    const docSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.interviewTips),
        where("title", "==", title),
        limit(1),
      ),
    );
    return { ok: true, exists: !docSnap.empty };
  } catch (error) {
    return { error: error as Error };
  }
}

async function interviewTipCreate(data: TipFormData) {
  try {
    const { ok, error, exists } = await interviewTipExists(data.title);
    if (error) return { error };

    if (ok) {
      if (exists) return { error: new Error("Tip already exists") };
    }
    const newInterviewTip = await addDoc(
      collection(db, COLLECTIONS.interviewTips),
      {
        ...data,
        createdAt: serverTimestamp() as Timestamp,
      } satisfies Omit<InterviewTip, "id">,
    );

    return { ok: true, newInterviewTip };
  } catch (error) {
    return { error: error as Error };
  }
}

async function interviewTipUpdate(tipId: string, tip: Partial<InterviewTip>) {
  try {
    await updateDoc(doc(db, COLLECTIONS.interviewTips, tipId), tip);

    return { ok: true };
  } catch (error) {
    return { error: error as Error };
  }
}

export function NewTipForm({ onClose, onSuccess, tip }: NewTipFormProps) {
  const [takeawayInput, setTakeawayInput] = useState("");
  const [exampleInput, setExampleInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      title: tip?.title ?? "",
      category: tip?.category ?? "Preparation",
      summary: tip?.summary ?? "",
      content: tip?.content ?? "",
      keyTakeaways: tip?.keyTakeaways ?? [],
      examples: tip?.examples ?? [],
      status: tip?.status ?? "draft",
    },
  });

  const handleAddTakeaway = () => {
    if (takeawayInput.trim()) {
      const currentTakeaways = form.getValues("keyTakeaways");
      if (currentTakeaways.length < 5) {
        form.setValue("keyTakeaways", [...currentTakeaways, takeawayInput]);
        setTakeawayInput("");
      } else {
        toast.error("Maximum 5 takeaways allowed");
      }
    }
  };

  const handleRemoveTakeaway = (index: number) => {
    const currentTakeaways = form.getValues("keyTakeaways");
    form.setValue(
      "keyTakeaways",
      currentTakeaways.filter((_, i) => i !== index),
    );
  };

  const handleAddExample = () => {
    if (exampleInput.trim()) {
      const currentExamples = form.getValues("examples");
      form.setValue("examples", [...currentExamples, exampleInput]);
      setExampleInput("");
    }
  };

  const handleRemoveExample = (index: number) => {
    const currentExamples = form.getValues("examples");
    form.setValue(
      "examples",
      currentExamples.filter((_, i) => i !== index),
    );
  };

  const onSubmit: SubmitHandler<TipFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      if (tip) {
        const { error, ok } = await interviewTipUpdate(tip.id, data);
        if (error) {
          console.error(error);
          toast.error(`Failed to update tip: ${error.message}`);
        } else if (ok) {
          toast.success("Tip updated successfully");
          onSuccess?.();
        }
      } else {
        const { error, ok } = await interviewTipCreate(data);
        if (error) {
          console.error(error);
          toast.error(`Failed to create tip: ${error.message}`);
        } else if (ok) {
          toast.success("Tip created successfully");
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

  const keyTakeaways = form.watch("keyTakeaways");
  const examples = form.watch("examples");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter tip title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief summary of the tip..."
                  className="min-h-16"
                  {...field}
                />
              </FormControl>
              <FormDescription>20-300 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed explanation of the tip..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>50-2000 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Key Takeaways</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a key takeaway..."
              value={takeawayInput}
              onChange={(e) => setTakeawayInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTakeaway();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddTakeaway}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {keyTakeaways.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keyTakeaways.map((takeaway, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="pl-2 whitespace-normal break-normal max-w-max"
                >
                  {takeaway}
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(idx)}
                    className="ml-1 hover:text-red-600 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {form.formState.errors.keyTakeaways && (
            <p className="text-sm text-red-600">
              {form.formState.errors.keyTakeaways.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Examples (Optional)</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add an example..."
              value={exampleInput}
              onChange={(e) => setExampleInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddExample();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddExample}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {examples.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {examples.map((example, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="pl-2 whitespace-normal break-normal max-w-max"
                >
                  {example}
                  <button
                    type="button"
                    onClick={() => handleRemoveExample(idx)}
                    className="ml-1 hover:text-red-600 cursor-pointer"
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
            {tip ? "Update Tip" : "Create Tip"}
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
