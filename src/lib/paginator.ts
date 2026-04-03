import {
  collection,
  getDocs,
  Query,
  CollectionReference,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export const PAGE_SIZE = 5;

export type QueryBuilder = (
  colRef: CollectionReference<DocumentData>,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
) => Query<DocumentData>;

export class Paginator<D> {
  private pageSize: number;
  private collectionPath: string;
  private pageSnapshots: (QueryDocumentSnapshot<DocumentData> | null)[] = [];
  private pageCache: D[][] = [];
  private currentPage = 0;
  private buildQuery: QueryBuilder;

  constructor(
    collectionPath: string,
    buildQuery: QueryBuilder,
    pageSize = PAGE_SIZE,
  ) {
    this.collectionPath = collectionPath;
    this.buildQuery = buildQuery;
    this.pageSize = pageSize;
    this.pageSnapshots = [null];
    this.pageCache = [];
  }

  private getColRef() {
    return collection(db, this.collectionPath);
  }

  async fetchPage(
    pageIndex: number,
  ): Promise<{ items: D[]; hasNext: boolean; hasPrev: boolean }> {
    if (this.pageCache[pageIndex]) {
      this.currentPage = pageIndex;
      const cached = this.pageCache[pageIndex];
      const hasNext =
        (this.pageSnapshots[pageIndex + 1] ?? null) !== undefined &&
        this.pageSnapshots[pageIndex + 1] !== null;
      const prevIndex = this.currentPage - 1;
      return { items: cached, hasNext, hasPrev: prevIndex > 0 };
    }

    const startCursor = this.pageSnapshots[pageIndex] ?? null;
    const colRef = this.getColRef();
    const q = this.buildQuery(colRef, startCursor);
    const snap = await getDocs(q);

    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as D),
    }));
    this.pageCache[pageIndex] = items;
    const lastSnap = snap.docs[snap.docs.length - 1] ?? null;
    this.pageSnapshots[pageIndex + 1] = lastSnap;
    this.currentPage = pageIndex;

    const hasNext = snap.docs.length === this.pageSize;
    const prevIndex = this.currentPage - 1;

    return { items, hasNext, hasPrev: prevIndex > 0 };
  }

  async next(): Promise<{
    items: D[];
    hasNext: boolean;
    hasPrev: boolean;
  } | null> {
    const nextIndex = this.currentPage + 1;
    const currentCached = this.pageCache[this.currentPage];
    if (
      currentCached &&
      currentCached.length < this.pageSize &&
      !this.pageSnapshots[nextIndex]
    )
      return null;
    return this.fetchPage(nextIndex);
  }

  async previous(): Promise<{
    items: D[];
    hasPrev: boolean;
    hasNext: boolean;
  } | null> {
    if (this.currentPage === 0) return null;
    const prevIndex = this.currentPage - 1;
    return this.fetchPage(prevIndex);
  }

  reset(): void {
    this.pageSnapshots = [null];
    this.pageCache = [];
    this.currentPage = 0;
  }

  getCurrentPageIndex(): number {
    return this.currentPage;
  }
}
