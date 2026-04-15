import {
  collection,
  getDocs,
  Query,
  CollectionReference,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export const PAGE_SIZE = 15;

export type QueryBuilder = (
  colRef: CollectionReference<DocumentData>,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
) => Query<DocumentData>;

export class Paginator<D> {
  private pageSize: number;
  private collectionPath: string;
  private pageSnapshots: (QueryDocumentSnapshot<DocumentData> | null)[] = [];
  private currentPage = 0;
  public buildQuery: QueryBuilder;

  constructor(
    collectionPath: string,
    buildQuery: QueryBuilder,
    pageSize = PAGE_SIZE,
  ) {
    this.collectionPath = collectionPath;
    this.buildQuery = buildQuery;
    this.pageSize = pageSize;
    this.pageSnapshots = [null];
  }

  private getColRef() {
    return collection(db, this.collectionPath);
  }

  async fetchPage(
    pageIndex: number,
  ): Promise<{ items: D[]; hasNext: boolean; hasPrev: boolean }> {
    const startCursor = this.pageSnapshots[pageIndex] ?? null;
    const colRef = this.getColRef();
    const q = this.buildQuery(colRef, startCursor);
    const snap = await getDocs(q);

    const items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as D),
    }));
    const lastSnap = snap.docs[snap.docs.length - 1] ?? null;

    this.pageSnapshots[pageIndex + 1] = lastSnap;
    this.currentPage = pageIndex;

    const hasNext = snap.docs.length === this.pageSize;

    return { items, hasNext, hasPrev: this.currentPage > 0 };
  }

  async next(): Promise<{
    items: D[];
    hasNext: boolean;
    hasPrev: boolean;
  } | null> {
    const nextIndex = this.currentPage + 1;
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
    this.currentPage = 0;
  }

  getCurrentPageIndex(): number {
    return this.currentPage;
  }
}
