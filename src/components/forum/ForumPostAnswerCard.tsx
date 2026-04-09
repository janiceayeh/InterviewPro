import { Loader2, User, Check, DotIcon } from "lucide-react";
import { ForumPost, ForumPostAnswer } from "@/lib/types";
import ms from "ms";
import { useUserProfile } from "@/lib/hooks";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import {
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDocs,
  collection,
  limit,
  query,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ForumPostAnswerForm from "./ForumPostAnswerForm";

async function acceptAnswer(answer: ForumPostAnswer) {
  try {
    const prevAcceptedAnswersSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.forumPostAnswers),
        where("isAccepted", "==", true),
        limit(1),
      ),
    );

    if (!prevAcceptedAnswersSnap.empty) {
      const answerAcceptedPrev = prevAcceptedAnswersSnap.docs.at(0);
      await updateDoc(
        doc(db, COLLECTIONS.forumPostAnswers, answerAcceptedPrev.id),
        {
          isAccepted: false,
          updatedAt: serverTimestamp() as Timestamp,
        } satisfies Partial<ForumPostAnswer>,
      );
    }
    await updateDoc(doc(db, COLLECTIONS.forumPostAnswers, answer.id), {
      isAccepted: true,
      updatedAt: serverTimestamp() as Timestamp,
    } satisfies Partial<ForumPostAnswer>);

    await updateDoc(doc(db, COLLECTIONS.forumPosts, answer.postId), {
      hasAcceptedAnswer: true,
      updatedAt: serverTimestamp() as Timestamp,
    } satisfies Partial<ForumPost>);

    return { ok: true };
  } catch (error) {
    return { error: error as Error };
  }
}

type Props = {
  answer: ForumPostAnswer;
  post: ForumPost;
  userId: string;
  onAcceptAnswer: () => void;
  refetchAnswers: () => void;
};
export default function ForumPostAnswerCard({
  answer,
  userId,
  post,
  onAcceptAnswer,
  refetchAnswers,
}: Props) {
  const { userProfile: author, userProfileLoading: authorLoading } =
    useUserProfile(answer?.authorId);
  const [isAcceptingAnswer, setIsAcceptingAnswer] = useState(false);
  const isAnswerAuthor = userId === answer?.authorId;
  const isPostAuthor = userId === post?.authorId;
  const [isEditingAnswer, setIsEditingAnswer] = useState<boolean>(false);

  async function handleAcceptAnswer() {
    try {
      setIsAcceptingAnswer(true);
      const { error, ok } = await acceptAnswer(answer);
      if (error) {
        console.error(error);
        toast.error(`Accept answer failed": ${error.message}`);
      }
      if (ok) {
        toast.success("Answer accepted");
        onAcceptAnswer();
      }
    } catch (error) {
      console.error(error);
      toast.error("Accept answer failed");
    } finally {
      setIsAcceptingAnswer(false);
    }
  }

  if (isEditingAnswer) {
    return (
      <ForumPostAnswerForm
        postId={post?.id}
        userId={userId}
        answer={answer}
        onUpdate={() => {
          setIsEditingAnswer(false);
          refetchAnswers();
        }}
        onCancel={() => setIsEditingAnswer(false)}
      />
    );
  }

  return (
    <div key={answer.id} className="border-t border-border pt-4">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              {authorLoading ? (
                <Loader2 className="size-4 mr-2 animate-spin text-primary" />
              ) : (
                <>
                  <h4 className="font-semibold text-foreground text-sm">
                    {author?.firstname}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {author?.role}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">
                {ms(Date.now() - answer?.createdAt?.toMillis())} ago{" "}
                {answer?.isEdited && (
                  <span className="text-xs text-muted-foreground">
                    <DotIcon className="inline" /> Edited
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-2">
            <p
              className={cn(
                "text-xs text-foreground mt-2 leading-relaxed col-span-12",
                {
                  "col-span-11": answer?.isAccepted,
                },
              )}
            >
              {answer.content}
            </p>
            {answer?.isAccepted && (
              <div className="" title="Accepted answer">
                <Check className="h-10 w-10 text-green-500" strokeWidth={2} />
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <button className="hover:text-primary transition-colors">
              Like
            </button>
            <button className="hover:text-primary transition-colors">
              Reply
            </button>
            <button className="hover:text-primary transition-colors">
              Share
            </button>
            {isPostAuthor && (
              <button
                className="hover:text-primary transition-colors cursor-pointer flex items-center"
                onClick={handleAcceptAnswer}
                disabled={isAcceptingAnswer}
              >
                {isAcceptingAnswer && (
                  <Loader2 className="size-4 mr-2 animate-spin text-primary" />
                )}
                {isAcceptingAnswer ? "Accepting..." : "Accept answer"}
              </button>
            )}
            {isAnswerAuthor && (
              <button
                className="hover:text-primary transition-colors cursor-pointer"
                onClick={() => setIsEditingAnswer(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
