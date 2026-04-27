"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Eye, Trash2Icon, Loader2, XIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useForumPosts } from "@/lib/hooks";
import PageLoading from "@/components/page-loading";
import PaginationButtons from "@/components/pagination-buttons/PaginationButtons";
import { toast } from "sonner";
import Link from "next/link";
import { routes } from "@/lib/routes";
import PostAuthorName from "@/components/admin/PostAuthorName";
import FlagButton from "@/components/admin/FlagButton";
import { ForumPost } from "@/lib/types";
import { ForumFlagsSheet } from "@/components/admin/ForumFlagsSheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDoc, doc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/constants";
import { db } from "@/lib/firebase";
import ForumPostAnswersCount from "@/components/forum/ForumPostAnswersCount";

export default function ForumModerationPage() {
  const {
    forumPosts,
    loading,
    hasNext,
    hasPrev,
    next,
    previous,
    refetch,
    first,
    search,
    error,
    reset,
  } = useForumPosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [openPostsSheet, setOpenPostsSheet] = useState(false);
  const [postConfirmDelete, setPostConfirmDelete] = useState(false);
  const [postDeleting, setPostDeleting] = useState(false);

  const noForumPosts = forumPosts?.length === 0;

  const handleClear = () => {
    setSearchQuery("");
    reset();
    first();
  };

  async function deletePost(postId: string) {
    try {
      setPostDeleting(true);
      await deleteDoc(doc(db, COLLECTIONS.forumPosts, postId));
      refetch();
      setPostConfirmDelete(false);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete post: ${(error as Error).message}`);
    } finally {
      setPostDeleting(false);
    }
  }

  useEffect(() => {
    first();
  }, []);

  useEffect(() => {
    if (!loading && error) {
      console.error(error);
      toast.error(`Failed to load forum posts:  ${error}`);
    }
  }, [loading, error]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Forum Moderation
            </h1>
            <p className="text-muted-foreground">
              Review and moderate forum posts
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forum posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search({ searchTerm: searchQuery });
              }
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
            >
              <XIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Table */}
        <Card className="border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 bg-muted/30">
                <TableHead className="text-foreground">Title</TableHead>
                <TableHead className="text-foreground">Author</TableHead>
                <TableHead className="text-foreground">Category</TableHead>
                <TableHead className="text-foreground">Answers</TableHead>
                <TableHead className="text-foreground">Flags</TableHead>
                <TableHead className="text-right text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forumPosts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">No posts found</div>
                  </TableCell>
                </TableRow>
              ) : (
                forumPosts?.map((post) => (
                  <TableRow
                    key={post.id}
                    className="border-border/30 hover:bg-muted/50"
                  >
                    <TableCell className="font-medium text-foreground max-w-md truncate">
                      <Link
                        href={routes.adminForumPostAnswers({ postId: post.id })}
                      >
                        <Button variant="link"> {post.title}</Button>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <PostAuthorName authorId={post.authorId} />
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {post.category}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <ForumPostAnswersCount post={post} />
                    </TableCell>
                    <TableCell>
                      <FlagButton
                        flagType="post"
                        id={post.id}
                        onClick={() => {
                          setSelectedPost(post);
                          setOpenPostsSheet(true);
                        }}
                      />
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedPost(post);
                          setPostConfirmDelete(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!noForumPosts && (
            <PaginationButtons
              hasNext={hasNext}
              hasPrev={hasPrev}
              next={next}
              previous={previous}
            />
          )}
        </Card>
      </div>

      {selectedPost && (
        <ForumFlagsSheet
          open={openPostsSheet}
          onOpenChange={setOpenPostsSheet}
          flagType="post"
          id={selectedPost?.id}
        />
      )}

      {/* Confirm Delete Post */}
      <AlertDialog open={postConfirmDelete} onOpenChange={setPostConfirmDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this post. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={postDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deletePost(selectedPost.id)}
              disabled={postDeleting}
            >
              {postDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
