import { useState, useMemo } from "react";
import { COLLECTIONS } from "@/lib/constants";
import { limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { InterviewQuestion, InterviewTip } from "./types";
import { PAGE_SIZE, Paginator, QueryBuilder } from "./paginator";

export function useInterviewQuestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  const paginator = useMemo(() => {
    const builder: QueryBuilder = (colRef, cursor) => {
      const clauses = [
        // where("category", "==", "algorithms"),
        orderBy("createdAt", "desc"),
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
