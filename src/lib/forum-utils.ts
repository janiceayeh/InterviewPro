import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  increment,
  QueryConstraint,
} from "firebase/firestore";
import type { ForumPost, ForumPostAnswer } from "@/lib/types";

export async function getForumPosts(filters?: {
  category?: string;
  searchQuery?: string;
  sortBy?: "recent" | "popular" | "unanswered";
}): Promise<ForumPost[]> {
  let constraints: QueryConstraint[] = [];

  if (filters?.category && filters.category !== "all") {
    constraints.push(where("category", "==", filters.category));
  }

  // Sort by different criteria
  if (filters?.sortBy === "popular") {
    constraints.push(orderBy("votes", "desc"));
  } else if (filters?.sortBy === "unanswered") {
    constraints.push(where("isAnswered", "==", false));
    constraints.push(orderBy("createdAt", "desc"));
  } else {
    constraints.push(orderBy("createdAt", "desc"));
  }

  constraints.push(limit(20));

  const q = query(collection(db, "forumPosts"), ...constraints);
  const snapshot = await getDocs(q);

  const posts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
  })) as ForumPost[];

  // Client-side search filtering if needed
  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }

  return posts;
}

export async function getForumPostById(
  postId: string,
): Promise<ForumPost | null> {
  const docRef = doc(db, "forumPosts", postId);
  const docSnapshot = await getDoc(docRef);

  if (!docSnapshot.exists()) {
    return null;
  }

  // Increment view count
  await updateDoc(docRef, {
    views: increment(1),
  });

  return {
    id: docSnapshot.id,
    ...docSnapshot.data(),
    createdAt: docSnapshot.data().createdAt?.toDate?.() || new Date(),
    updatedAt: docSnapshot.data().updatedAt?.toDate?.() || new Date(),
  } as ForumPost;
}

export async function getForumAnswers(
  postId: string,
): Promise<ForumPostAnswer[]> {
  const q = query(
    collection(db, "forumAnswers"),
    where("postId", "==", postId),
    orderBy("votes", "desc"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
  })) as ForumPostAnswer[];
}

export async function voteOnPost(
  postId: string,
  userId: string,
  voteType: 1 | -1,
): Promise<void> {
  const docRef = doc(db, "forumPosts", postId);

  // Get current vote
  const docSnapshot = await getDoc(docRef);
  const userData = docSnapshot.data()?.userVotes || {};
  const currentVote = userData[userId] || 0;

  // Calculate the difference
  const voteChange = voteType - currentVote;

  // Update vote count
  await updateDoc(docRef, {
    votes: increment(voteChange),
    [`userVotes.${userId}`]: voteType,
  });
}

export async function voteOnAnswer(
  answerId: string,
  userId: string,
  voteType: 1 | -1,
): Promise<void> {
  const docRef = doc(db, "forumAnswers", answerId);

  // Get current vote
  const docSnapshot = await getDoc(docRef);
  const userData = docSnapshot.data()?.userVotes || {};
  const currentVote = userData[userId] || 0;

  // Calculate the difference
  const voteChange = voteType - currentVote;

  // Update vote count
  await updateDoc(docRef, {
    votes: increment(voteChange),
    [`userVotes.${userId}`]: voteType,
  });
}

export async function searchForumPosts(
  searchQuery: string,
): Promise<ForumPost[]> {
  const q = query(collection(db, "forumPosts"), limit(50));
  const snapshot = await getDocs(q);

  const posts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
  })) as ForumPost[];

  const query_lower = searchQuery.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(query_lower) ||
      post.content.toLowerCase().includes(query_lower) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query_lower)),
  );
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
