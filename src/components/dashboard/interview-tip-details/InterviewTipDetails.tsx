"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  MessageCircle,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewTip, InterviewTipHelpful } from "@/lib/types";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { COLLECTIONS } from "@/lib/constants";
import PageLoading from "@/components/page-loading";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";

type Props = {
  tip: InterviewTip;
};

async function tipGetHelpful({
  tipId,
  userId,
}: {
  tipId: string;
  userId: string;
}) {
  try {
    const docSnap = await getDocs(
      query(
        collection(db, COLLECTIONS.interviewTipHelpfuls),
        where("userId", "==", userId),
        where("tipId", "==", tipId),
        limit(1),
      ),
    );
    return {
      ok: true,
      tipHelpful: docSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        ?.at(0) as InterviewTipHelpful,
      tipExists: !docSnap.empty,
    };
  } catch (error) {
    return { error: error as Error };
  }
}

export default function InterviewTipDetails({ tip }: Props) {
  const { user, loading: userLoading } = useAuth();
  const [tipHelpful, setTipHelpful] = useState<InterviewTipHelpful | null>(
    null,
  );
  const [tipHelpfulLoading, setTipIsHelpfulLoading] = useState<boolean>(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  async function tipHelpfulSave({
    newState,
    prevState,
  }: {
    prevState: boolean | null;
    newState: boolean | null;
  }) {
    if (!user) {
      toast.error("Must be signed in");
      return;
    }
    try {
      // optimistic update
      setIsHelpful(newState);

      // deterministic doc id ensures single doc per (tip,user)
      const deterministicId = `${tip.id}_${user.uid}`;
      const ref = doc(db, COLLECTIONS.interviewTipHelpfuls, deterministicId);

      // Use merge so it creates if missing, updates otherwise.
      await setDoc(
        ref,
        {
          tipId: tip.id,
          userId: user.uid,
          isHelpful: newState,
          ...(tipHelpful?.createdAt
            ? {}
            : { createdAt: serverTimestamp() as Timestamp }),
        } satisfies Omit<Partial<InterviewTipHelpful>, "id">,
        { merge: true },
      );

      // update local state with the deterministic id and new values
      setTipHelpful({
        id: deterministicId,
        tipId: tip.id,
        userId: user.uid,
        isHelpful: newState,
        createdAt: tipHelpful?.createdAt ?? null,
      });

      if (newState !== null) toast.success("Thanks for your feedback!");
    } catch (error: any) {
      console.error(error);
      // optimistic rollback
      setIsHelpful(prevState);
      toast.error(`Oops! Something went wrong: ${error?.message ?? error}`);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setTipIsHelpfulLoading(true);
        if (user) {
          const { error, ok, tipHelpful } = await tipGetHelpful({
            tipId: tip.id,
            userId: user.uid,
          });

          if (error) {
            console.error(error);
          } else if (ok) {
            setTipHelpful(tipHelpful ?? null);
            setIsHelpful(tipHelpful?.isHelpful ?? null);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setTipIsHelpfulLoading(false);
      }
    })();
  }, [user?.uid, tip.id]);

  if (tipHelpfulLoading || userLoading) return <PageLoading />;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
          {tip.category}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-4">{tip.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{tip.summary}</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            Full Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none">
            {tip.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-success" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {tip.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="size-1.5 rounded-full bg-success mt-2 shrink-0" />
                <span className="text-foreground">{takeaway}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {tip.examples && tip.examples.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="size-5 text-accent" />
              Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {tip.examples.map((example, index) => (
                <li
                  key={index}
                  className="rounded-lg bg-muted/50 p-4 text-foreground italic"
                >
                  {example}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20 ">
        <CardContent className=" ">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-foreground mb-1">
              Do you find this tip helpful?
            </h3>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const prevState = isHelpful;
                  const newState = prevState === true ? null : true;
                  tipHelpfulSave({
                    prevState,
                    newState,
                  });
                }}
              >
                <ThumbsUpIcon
                  className={cn({ "text-primary": isHelpful === true })}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const prevState = isHelpful;
                  let newState = prevState === false ? null : false;
                  tipHelpfulSave({
                    prevState,
                    newState,
                  });
                }}
              >
                <ThumbsDownIcon
                  className={cn({ "text-primary": isHelpful === false })}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
