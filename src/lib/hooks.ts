import { useState, useMemo, useEffect } from "react";
import {
  COLLECTIONS,
  NUMBER_OF_QUESTIONS_PER_INTERVIEW_SESSION,
} from "@/lib/constants";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import {
  InterviewQuestion,
  InterviewTip,
  IndustryRole,
  UserProfile,
  ForumPost,
  ForumPostSortBy,
  ForumPostAnswer,
  ForumPostAnswerSortBy,
} from "./types";
import { PAGE_SIZE, Paginator, QueryBuilder } from "./paginator";
import { db } from "./firebase";
import { toast } from "sonner";
import { useAuth } from "./context/auth-context";

export function useInterviewQuestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        orderBy("createdAt", "desc"),
        // orderBy("category", "asc"),
        cursor ? startAfter(cursor) : undefined,
        limit(PAGE_SIZE),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<InterviewQuestion>(
      COLLECTIONS.interviewQuestions,
      builder,
    );
  }, []);

  async function next() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.next();
      if (res) {
        const { hasNext, hasPrev, items } = res;
        setHasNext(hasNext);
        setHasPrev(hasPrev);
        setQuestions(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function previous() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.previous();
      if (res) {
        const { hasPrev, hasNext, items } = res;
        setHasPrev(hasPrev);
        setHasNext(hasNext);
        setQuestions(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function first() {
    try {
      setLoading(true);
      setError(null);

      const { hasNext, hasPrev, items } = await paginator.fetchPage(0);
      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setQuestions(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function refetch() {
    try {
      setLoading(true);
      setError(null);

      const currentPage = paginator.getCurrentPageIndex();
      const { hasNext, hasPrev, items } =
        await paginator.fetchPage(currentPage);

      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setQuestions(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    questions,
    next,
    previous,
    first,
    refetch,
    reset: () => paginator.reset(),
    pageIndex: paginator.getCurrentPageIndex(),
    hasPrev,
    hasNext,
  };
}

export function useInterviewTips(options?: { hideDraft: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<InterviewTip[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        options?.hideDraft
          ? where("status", "==", "published" satisfies InterviewTip["status"])
          : undefined,
        orderBy("createdAt", "desc"),
        cursor ? startAfter(cursor) : undefined,
        limit(PAGE_SIZE),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<InterviewTip>(COLLECTIONS.interviewTips, builder);
  }, []);

  async function next() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.next();
      if (res) {
        const { hasNext, hasPrev, items } = res;
        setHasNext(hasNext);
        setHasPrev(hasPrev);
        setTips(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function previous() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.previous();
      if (res) {
        const { hasPrev, hasNext, items } = res;
        setHasPrev(hasPrev);
        setHasNext(hasNext);
        setTips(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function first() {
    try {
      setLoading(true);
      setError(null);

      const { hasNext, hasPrev, items } = await paginator.fetchPage(0);
      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setTips(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function refetch() {
    try {
      setLoading(true);
      setError(null);

      const currentPage = paginator.getCurrentPageIndex();
      const { hasNext, hasPrev, items } =
        await paginator.fetchPage(currentPage);

      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setTips(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    tips,
    next,
    previous,
    first,
    refetch,
    reset: () => paginator.reset(),
    pageIndex: paginator.getCurrentPageIndex(),
    hasPrev,
    hasNext,
  };
}

export function useUserProfiles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        orderBy("createdAt", "desc"),
        cursor ? startAfter(cursor) : undefined,
        limit(PAGE_SIZE),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<UserProfile>(COLLECTIONS.users, builder);
  }, []);

  async function next() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.next();
      if (res) {
        const { hasNext, hasPrev, items } = res;
        setHasNext(hasNext);
        setHasPrev(hasPrev);
        setUserProfiles(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function previous() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.previous();
      if (res) {
        const { hasPrev, hasNext, items } = res;
        setHasPrev(hasPrev);
        setHasNext(hasNext);
        setUserProfiles(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function first() {
    try {
      setLoading(true);
      setError(null);

      const { hasNext, hasPrev, items } = await paginator.fetchPage(0);
      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setUserProfiles(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function refetch() {
    try {
      setLoading(true);
      setError(null);

      const currentPage = paginator.getCurrentPageIndex();
      const { hasNext, hasPrev, items } =
        await paginator.fetchPage(currentPage);

      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setUserProfiles(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    userProfiles,
    next,
    previous,
    first,
    refetch,
    reset: () => paginator.reset(),
    pageIndex: paginator.getCurrentPageIndex(),
    hasPrev,
    hasNext,
  };
}

export function useRoles() {
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roles, setRoles] = useState<IndustryRole[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setRolesLoading(true);
        const rolesSnapshot = await getDocs(
          query(collection(db, COLLECTIONS.roles)),
        );
        const roles = rolesSnapshot.docs.map((doc) =>
          doc.data(),
        ) as IndustryRole[];

        setRoles(roles);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load roles");
      } finally {
        setRolesLoading(false);
      }
    })();
  }, []);

  return {
    rolesLoading,
    roles,
  };
}

export function useMockInterviewQuestions({
  startFetch,
  userProfile,
  questionCategory,
}: {
  userProfile: UserProfile;
  startFetch: boolean;
  questionCategory: string;
}) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(true);

  // fetch interview questions from the COLLECTIONS.interviewQuesions collection
  useEffect(() => {
    if (startFetch) {
      setQuestionsLoading(true);
      (async () => {
        try {
          const lastQuestionDocSnap = userProfile.lastAnsweredQuestionId
            ? await getDoc(
                doc(
                  db,
                  COLLECTIONS.interviewQuestions,
                  userProfile.lastAnsweredQuestionId,
                ),
              )
            : null;

          const questionsSnapshot = await getDocs(
            query(
              collection(db, COLLECTIONS.interviewQuestions),
              ...[
                where("category", "==", questionCategory),
                where("roles", "array-contains", userProfile?.role),
                where(
                  "status",
                  "==",
                  "published" satisfies InterviewQuestion["status"],
                ),
                orderBy("createdAt", "desc"),
                ...(lastQuestionDocSnap
                  ? [startAfter(lastQuestionDocSnap)]
                  : []),
                limit(NUMBER_OF_QUESTIONS_PER_INTERVIEW_SESSION), // TODO: change me to the desired number of questions for each session.
              ],
            ),
          );

          const questions = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as InterviewQuestion[];
          setQuestions(questions);
        } catch (error) {
          console.error(error);
          toast.error("Failed to fetch questions. Try again");
        } finally {
          setQuestionsLoading(false);
        }
      })();
    }
  }, [userProfile, startFetch, questionCategory]);

  return {
    questions,
    questionsLoading,
  };
}

export function useForumPosts(options?: {
  category: string;
  sortBy: ForumPostSortBy;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        options?.category && options.category !== "all"
          ? where("category", "==", options.category)
          : undefined,
        options?.sortBy === "recent" ? orderBy("createdAt", "desc") : undefined,
        options?.sortBy === "popular" ? orderBy("views", "desc") : undefined,
        options?.sortBy === "unanswered"
          ? orderBy("answers", "asc")
          : undefined,
        cursor ? startAfter(cursor) : undefined,
        limit(5),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<ForumPost>(COLLECTIONS.forumPosts, builder);
  }, [options]);

  async function next() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.next();
      if (res) {
        const { hasNext, hasPrev, items } = res;
        setHasNext(hasNext);
        setHasPrev(hasPrev);
        setForumPosts(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function previous() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.previous();
      if (res) {
        const { hasPrev, hasNext, items } = res;
        setHasPrev(hasPrev);
        setHasNext(hasNext);
        setForumPosts(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function first() {
    try {
      setLoading(true);
      setError(null);

      const { hasNext, hasPrev, items } = await paginator.fetchPage(0);
      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setForumPosts(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function refetch() {
    try {
      setLoading(true);
      setError(null);

      const currentPage = paginator.getCurrentPageIndex();
      const { hasNext, hasPrev, items } =
        await paginator.fetchPage(currentPage);

      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setForumPosts(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    forumPosts,
    next,
    previous,
    first,
    refetch,
    reset: () => paginator.reset(),
    pageIndex: paginator.getCurrentPageIndex(),
    hasPrev,
    hasNext,
  };
}

export function useForumPostAnswers(
  postId: string,
  options?: {
    sortBy: ForumPostAnswerSortBy;
  },
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forumPostAnswers, setForumPostAnswers] = useState<ForumPostAnswer[]>(
    [],
  );
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        where("postId", "==", postId),
        options?.sortBy === "recent" ? orderBy("createdAt", "desc") : undefined,
        options?.sortBy === "accepted"
          ? orderBy("isAccepted", "desc")
          : undefined,
        cursor ? startAfter(cursor) : undefined,
        limit(5),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<ForumPostAnswer>(
      COLLECTIONS.forumPostAnswers,
      builder,
    );
  }, [options]);

  async function next() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.next();
      if (res) {
        const { hasNext, hasPrev, items } = res;
        setHasNext(hasNext);
        setHasPrev(hasPrev);
        setForumPostAnswers(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function previous() {
    try {
      setLoading(true);
      setError(null);

      const res = await paginator.previous();
      if (res) {
        const { hasPrev, hasNext, items } = res;
        setHasPrev(hasPrev);
        setHasNext(hasNext);
        setForumPostAnswers(items);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function first() {
    try {
      setLoading(true);
      setError(null);

      const { hasNext, hasPrev, items } = await paginator.fetchPage(0);
      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setForumPostAnswers(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function refetch() {
    try {
      setLoading(true);
      setError(null);

      const currentPage = paginator.getCurrentPageIndex();
      const { hasNext, hasPrev, items } =
        await paginator.fetchPage(currentPage);

      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setForumPostAnswers(items);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    forumPostAnswers,
    next,
    previous,
    first,
    refetch,
    reset: () => paginator.reset(),
    pageIndex: paginator.getCurrentPageIndex(),
    hasPrev,
    hasNext,
  };
}

export function useUserProfile(userId: string) {
  const [userProfileLoading, setUserProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProfileError, setUserProfileError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUserProfile() {
      if (userId) {
        try {
          const userProfileSnap = await getDoc(
            doc(db, COLLECTIONS.users, userId),
          );
          const author = userProfileSnap.data() as UserProfile;
          setUserProfile({ id: userProfileSnap.id, ...author });
        } catch (error) {
          console.error(error);
          setUserProfileError(error);
        } finally {
          setUserProfileLoading(false);
        }
      }
    }

    getUserProfile();
  }, [userId]);

  return {
    userProfile,
    userProfileLoading,
    userProfileError,
  };
}
