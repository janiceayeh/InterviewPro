import { useState, useMemo, useEffect } from "react";
import {
  COLLECTIONS,
  DEFAULT_STUDENT_PERSONALISED_ANALYTICS,
  NUMBER_OF_QUESTIONS_PER_INTERVIEW_SESSION,
} from "@/lib/constants";
import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
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
  ForumPostFlag,
  ForumPostAnswerFlag,
  ForumFlagsOptions,
  StudentPersonalisedAnalytics,
  InterviewSession,
  UserLastAnsweredInterviewQuestion,
} from "./types";
import { PAGE_SIZE, Paginator, QueryBuilder } from "./paginator";
import { db } from "./firebase";
import { toast } from "sonner";

export function useInterviewQuestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const pageSize = 50;
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        orderBy("createdAt", "desc"),
        // orderBy("category", "asc"),
        cursor ? startAfter(cursor) : undefined,
        limit(pageSize),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<InterviewQuestion>(
      COLLECTIONS.interviewQuestions,
      builder,
      pageSize,
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
          const deterministicId = `${userProfile.id}_${questionCategory}`;
          const lastAnsweredSnap = await getDoc(
            doc(
              db,
              COLLECTIONS.userLastAnsweredInterviewQuestions,
              deterministicId,
            ),
          );

          const lastAnswered = lastAnsweredSnap.exists()
            ? ({
                id: lastAnsweredSnap.id,
                ...lastAnsweredSnap.data(),
              } as UserLastAnsweredInterviewQuestion)
            : null;

          const lastAnsweredQuestion = lastAnswered
            ? await getDoc(
                doc(
                  db,
                  COLLECTIONS.interviewQuestions,
                  lastAnswered.questionId,
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
                ...(lastAnsweredQuestion
                  ? [startAfter(lastAnsweredQuestion)]
                  : []),
                limit(NUMBER_OF_QUESTIONS_PER_INTERVIEW_SESSION),
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
    const pageSize = 5;
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
        limit(pageSize),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<ForumPost>(COLLECTIONS.forumPosts, builder, pageSize);
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
    const pageSize = 5;
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        where("postId", "==", postId),
        options?.sortBy === "recent" ? orderBy("createdAt", "desc") : undefined,
        options?.sortBy === "accepted"
          ? orderBy("isAccepted", "desc")
          : undefined,
        cursor ? startAfter(cursor) : undefined,
        limit(pageSize),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };
    return new Paginator<ForumPostAnswer>(
      COLLECTIONS.forumPostAnswers,
      builder,
      pageSize,
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

export function useForumFlags() {
  const [flags, setFlags] = useState<(ForumPostFlag | ForumPostAnswerFlag)[]>(
    [],
  );
  const [flagsLoading, setFlagsLoading] = useState(false);
  const [flagsError, setFlagsError] = useState<Error | null>(null);
  const [flagsCount, setFlagsCount] = useState(0);

  async function flagsGetAll(options: ForumFlagsOptions) {
    try {
      setFlagsLoading(true);
      const isPostFlag = options.flagType === "post";

      const flagsSnap = await getDocs(
        query(
          collection(
            db,
            isPostFlag
              ? COLLECTIONS.forumPostFlags
              : COLLECTIONS.forumPostAnswerFlags,
          ),
          where(isPostFlag ? "postId" : "answerId", "==", options.id),
          orderBy("createdAt", "desc"),
        ),
      );
      const flags = flagsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ForumPostFlag[];

      setFlags(flags);
    } catch (error) {
      console.error(error);
      setFlagsError(error as Error);
    } finally {
      setFlagsLoading(false);
    }
  }

  async function flagsGetCount(options: ForumFlagsOptions) {
    try {
      setFlagsLoading(true);
      const isPostFlag = options.flagType === "post";
      const countSnap = await getCountFromServer(
        query(
          collection(
            db,
            isPostFlag
              ? COLLECTIONS.forumPostFlags
              : COLLECTIONS.forumPostAnswerFlags,
          ),
          where(isPostFlag ? "postId" : "answerId", "==", options.id),
        ),
      );
      setFlagsCount(countSnap.data().count ?? 0);
    } catch (error) {
      console.error(error);
      setFlagsError(error);
    } finally {
      setFlagsLoading(false);
    }
  }

  return {
    flags,
    flagsLoading,
    flagsGetAll,
    flagsError,
    flagsGetCount,
    flagsCount,
  };
}

export function useFlagPost() {
  const [isFlaggingPost, setIsFlaggingPost] = useState(false);
  const [flagPostError, setFlagPostError] = useState<Error | null>(null);

  async function flagPost(
    options: ForumFlagsOptions & {
      flagCategory: string;
      flagValue: string;
      id: string;
      userId: string;
    },
  ) {
    try {
      setIsFlaggingPost(true);
      const isQuestion = options.flagType === "post";
      const newFlag = await addDoc(
        collection(
          db,
          isQuestion
            ? COLLECTIONS.forumPostFlags
            : COLLECTIONS.forumPostAnswerFlags,
        ),

        {
          flagCategory: options.flagCategory,
          flagValue: options.flagValue,
          [isQuestion ? "postId" : "answerId"]: options.id,
          userId: options.userId,
          createdAt: serverTimestamp() as Timestamp,
        } satisfies Omit<ForumPostFlag | ForumPostAnswerFlag, "id">,
      );

      return { ok: true, newFlag };
    } catch (error) {
      console.error(error);
      setFlagPostError(error);
      return { error: error as Error };
    } finally {
      setIsFlaggingPost(false);
    }
  }

  return {
    isFlaggingPost,
    flagPostError,
    flagPost,
  };
}

export function useStudentPersonalisedAnalytics() {
  const [analytics, setAnalytics] =
    useState<StudentPersonalisedAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = async (options: { userId: string }) => {
    try {
      setAnalyticsLoading(true);
      const snap = await getDoc(
        doc(db, COLLECTIONS.studentPersonalisedAnalytics, options.userId),
      );

      if (snap.exists()) {
        setAnalytics({
          id: snap.id,
          ...(snap.data() as StudentPersonalisedAnalytics),
        });
      } else {
        setAnalytics(DEFAULT_STUDENT_PERSONALISED_ANALYTICS);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return {
    fetchAnalytics,
    analytics,
    analyticsLoading,
    analyticsError,
  };
}

export function useInterviewSessions({ userId }: { userId: string }) {
  const [interviewSessionsLoading, setInterviewSessionsLoading] =
    useState(false);
  const [interviewSessionsError, setInterviewSessionsError] = useState<
    string | null
  >(null);
  const [interviewSessions, setInterviewSessions] = useState<
    InterviewSession[]
  >([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const pageSize = 50;
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        where("userId", "==", userId),
        where("isCompleted", "==", true),
        orderBy("createdAt", "desc"),
        cursor ? startAfter(cursor) : undefined,
        limit(pageSize),
      ].filter(Boolean) as any[];
      return query(colRef, ...clauses);
    };

    return new Paginator<InterviewSession>(
      COLLECTIONS.interviewSessions,
      builder,
      pageSize,
    );
  }, [userId]);

  async function next() {
    try {
      setInterviewSessionsLoading(true);
      setInterviewSessionsError(null);

      const res = await paginator.next();
      if (res) {
        const { hasNext, hasPrev, items } = res;
        setHasNext(hasNext);
        setHasPrev(hasPrev);
        setInterviewSessions(items);
      }
    } catch (error) {
      setInterviewSessionsError((error as Error).message);
    } finally {
      setInterviewSessionsLoading(false);
    }
  }

  async function previous() {
    try {
      setInterviewSessionsLoading(true);
      setInterviewSessionsError(null);

      const res = await paginator.previous();
      if (res) {
        const { hasPrev, hasNext, items } = res;
        setHasPrev(hasPrev);
        setHasNext(hasNext);
        setInterviewSessions(items);
      }
    } catch (error) {
      setInterviewSessionsError((error as Error).message);
    } finally {
      setInterviewSessionsLoading(false);
    }
  }

  async function first() {
    try {
      setInterviewSessionsLoading(true);
      setInterviewSessionsError(null);

      const { hasNext, hasPrev, items } = await paginator.fetchPage(0);
      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setInterviewSessions(items);
    } catch (error) {
      setInterviewSessionsError((error as Error).message);
    } finally {
      setInterviewSessionsLoading(false);
    }
  }

  async function refetch() {
    try {
      setInterviewSessionsLoading(true);
      setInterviewSessionsError(null);

      const currentPage = paginator.getCurrentPageIndex();
      const { hasNext, hasPrev, items } =
        await paginator.fetchPage(currentPage);

      setHasNext(hasNext);
      setHasPrev(hasPrev);
      setInterviewSessions(items);
    } catch (error) {
      setInterviewSessionsError((error as Error).message);
    } finally {
      setInterviewSessionsLoading(false);
    }
  }

  return {
    interviewSessionsLoading,
    interviewSessionsError,
    interviewSessions,
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

export function useTotalUsers() {
  const [totalUsersLoading, setTotalUsersLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUsersError, setTotalUsersError] = useState<Error | null>(null);

  async function getTotalUsers() {
    try {
      setTotalUsersLoading(true);
      const countSnap = await getCountFromServer(
        query(collection(db, COLLECTIONS.users)),
      );
      const totalUsers = countSnap.data().count ?? 0;
      setTotalUsers(totalUsers);
      return { ok: true, totalUsers };
    } catch (error) {
      console.error(error);
      setTotalUsersError(error);
      return { error: error as Error };
    } finally {
      setTotalUsersLoading(false);
    }
  }

  useEffect(() => {
    getTotalUsers();
  }, []);

  return {
    getTotalUsers,
    totalUsersLoading,
    totalUsers,
    totalUsersError,
  };
}

export function useTotalInterviews() {
  const [totalInterviewsLoading, setTotalInterviewsLoading] = useState(false);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [totalInterviewsError, setTotalInterviewsError] =
    useState<Error | null>(null);

  async function getTotalInterviews() {
    try {
      setTotalInterviewsLoading(true);
      const countSnap = await getCountFromServer(
        query(collection(db, COLLECTIONS.interviewSessions)),
      );
      const totalInterviews = countSnap.data().count ?? 0;
      setTotalInterviews(totalInterviews);
      return { ok: true, totalInterviews };
    } catch (error) {
      console.error(error);
      setTotalInterviewsError(error);
      return { error: error as Error };
    } finally {
      setTotalInterviewsLoading(false);
    }
  }

  useEffect(() => {
    getTotalInterviews();
  }, []);

  return {
    getTotalInterviews,
    totalInterviewsLoading,
    totalInterviews,
    totalInterviewsError,
  };
}

export function useInterviewCompletionRate() {
  const [interviewCompletionRateLoading, setInterviewCompletionRateLoading] =
    useState(false);
  const [interviewCompletionRate, setInterviewCompletionRate] = useState(0);
  const [interviewCompletionRateError, setInterviewCompletionRateError] =
    useState<Error | null>(null);

  const { getTotalInterviews } = useTotalInterviews();

  async function getInterviewCompletionRate() {
    try {
      setInterviewCompletionRateLoading(true);
      const countSnap = await getCountFromServer(
        query(
          collection(db, COLLECTIONS.interviewSessions),
          where("isCompleted", "==", true),
        ),
      );
      const completedInterviews = countSnap.data().count ?? 0;
      const { ok, error, totalInterviews } = await getTotalInterviews();
      if (error) {
        setInterviewCompletionRateError(error);
        return { error };
      }
      if (ok) {
        const completionRate = Math.round(
          (completedInterviews / totalInterviews) * 100,
        );
        setInterviewCompletionRate(completionRate);
        return { ok: true, completionRate };
      }
    } catch (error) {
      console.error(error);
      setInterviewCompletionRateError(error);
      return { error: error as Error };
    } finally {
      setInterviewCompletionRateLoading(false);
    }
  }

  useEffect(() => {
    getInterviewCompletionRate();
  }, []);

  return {
    getInterviewCompletionRate,
    interviewCompletionRateLoading,
    interviewCompletionRate,
    interviewCompletionRateError,
  };
}

export function useTotalForumPosts() {
  const [totalForumPostsLoading, setTotalForumPostsLoading] = useState(false);
  const [totalForumPosts, setTotalForumPosts] = useState(0);
  const [totalForumPostsError, setTotalForumPostsError] =
    useState<Error | null>(null);

  async function getTotalForumPosts() {
    try {
      setTotalForumPostsLoading(true);
      const countSnap = await getCountFromServer(
        query(collection(db, COLLECTIONS.forumPosts)),
      );
      const totalForumPosts = countSnap.data().count ?? 0;
      setTotalForumPosts(totalForumPosts);
      return { ok: true, totalForumPosts };
    } catch (error) {
      console.error(error);
      setTotalForumPostsError(error);
      return { error: error as Error };
    } finally {
      setTotalForumPostsLoading(false);
    }
  }

  useEffect(() => {
    getTotalForumPosts();
  }, []);

  return {
    getTotalForumPosts,
    totalForumPostsLoading,
    totalForumPosts,
    totalForumPostsError,
  };
}

export function useTotalQuestions() {
  const [totalQuestionsLoading, setTotalQuestionsLoading] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalQuestionsError, setTotalQuestionsError] = useState<Error | null>(
    null,
  );

  async function getTotalQuestions() {
    try {
      setTotalQuestionsLoading(true);
      const countSnap = await getCountFromServer(
        query(collection(db, COLLECTIONS.interviewQuestions)),
      );
      const totalQuestions = countSnap.data().count ?? 0;
      setTotalQuestions(totalQuestions);
      return { ok: true, totalQuestions };
    } catch (error) {
      console.error(error);
      setTotalQuestionsError(error);
      return { error: error as Error };
    } finally {
      setTotalQuestionsLoading(false);
    }
  }

  useEffect(() => {
    getTotalQuestions();
  }, []);

  return {
    getTotalQuestions,
    totalQuestionsLoading,
    totalQuestions,
    totalQuestionsError,
  };
}

type MonthlyUsers = { month: string; count: number };
export function useMonthlyUserCounts() {
  const [monthlyUsersLoading, setMonthlyUsersLoading] = useState(true);
  const [monthlyUsersError, setMonthlyUsersError] = useState<string | null>(
    null,
  );
  const [monthlyUsers, setMonthlyUsers] = useState<MonthlyUsers[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      setMonthlyUsersLoading(true);
      setMonthlyUsersError(null);

      try {
        const now = new Date();
        // build 6 month buckets including current month
        const buckets: { start: Date; end: Date; key: string }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
          const end = new Date(
            d.getFullYear(),
            d.getMonth() + 1,
            1,
            0,
            0,
            0,
            0,
          );
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
          buckets.push({ start, end, key });
        }

        // run count queries sequentially to avoid hitting quotas; parallel is possible
        const results: MonthlyUsers[] = [];
        for (const b of buckets) {
          const q = query(
            collection(db, COLLECTIONS.users),
            where("createdAt", ">=", Timestamp.fromDate(b.start)),
            where("createdAt", "<", Timestamp.fromDate(b.end)),
          );
          const aggregate = await getCountFromServer(q);
          results.push({ month: b.key, count: aggregate.data().count });
        }

        if (!mounted) return;
        setMonthlyUsers(results);
      } catch (err) {
        if (!mounted) return;
        setMonthlyUsersError((err as Error).message);
      } finally {
        if (!mounted) return;
        setMonthlyUsersLoading(false);
      }
    }

    fetchCounts();
    return () => {
      mounted = false;
    };
  }, []);

  return { monthlyUsersLoading, monthlyUsersError, monthlyUsers }; // data ordered oldest -> newest (6 months)
}

type InterviewsByCategory = {
  category: InterviewQuestion["category"];
  count: number;
};
export function useCompletedInterviewsByCategoryCount() {
  const [
    completedInterviewsByCategoryLoading,
    setCompletedInterviewsByCategoryLoading,
  ] = useState(false);
  const [
    completedInterviewsByCategoryError,
    setCompletedInterviewsByCategoryError,
  ] = useState<Error | null>(null);
  const [completedInterviewsByCategory, setCompletedInterviewsByCategory] =
    useState<InterviewsByCategory[]>([]);

  async function getCompletedInterviewsByCategory() {
    try {
      setCompletedInterviewsByCategoryLoading(true);
      const categories = ["technical", "situational", "general", "behavioral"];
      const result: InterviewsByCategory[] = [];
      for (const category of categories) {
        const countSnap = await getCountFromServer(
          query(
            collection(db, COLLECTIONS.interviewSessions),
            where("isCompleted", "==", true),
            where("interviewCategory", "==", category),
          ),
        );

        result.push({
          category: category as InterviewsByCategory["category"],
          count: countSnap.data().count ?? 0,
        });
      }

      setCompletedInterviewsByCategory(result);

      return { ok: true, completedInterviewsByCategory: result };
    } catch (error) {
      console.error(error);
      setCompletedInterviewsByCategoryError(error);
      return { error: error as Error };
    } finally {
      setCompletedInterviewsByCategoryLoading(false);
    }
  }

  useEffect(() => {
    getCompletedInterviewsByCategory();
  }, []);

  return {
    completedInterviewsByCategoryLoading,
    completedInterviewsByCategoryError,
    completedInterviewsByCategory,
    getCompletedInterviewsByCategory,
  };
}
