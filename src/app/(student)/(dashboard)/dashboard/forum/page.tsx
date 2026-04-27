"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/forum/category-filter";
import { useAuth } from "@/lib/context/auth-context";
import { Plus, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { routes } from "@/lib/routes";
import { useForumPosts } from "@/lib/hooks";
import PageLoading from "@/components/page-loading";
import { toast } from "sonner";
import { ForumPostSortBy } from "@/lib/types";
import ForumPostCard from "@/components/forum/ForumPostCard";
import PaginationButtons from "@/components/pagination-buttons/PaginationButtons";

export default function ForumPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<ForumPostSortBy>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    first,
    next,
    previous,
    hasNext,
    hasPrev,
    loading,
    forumPosts,
    error,
    refetch,
    search,
    reset,
  } = useForumPosts({ category: selectedCategory, sortBy: sortBy });

  const noForumPosts = forumPosts?.length === 0;

  const handleClear = () => {
    setSearchQuery("");
    reset();
    first();
  };

  useEffect(() => {
    first();
  }, []);

  useEffect(() => {
    refetch();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch posts");
    }
  }, [error]);

  return (
    <>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Browse All Discussions Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                All Discussions
              </h2>
              <p className="text-muted-foreground text-lg">
                Browse all community discussions and join the conversation
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />

                <div className="flex gap-2 flex-wrap">
                  {(["recent", "popular", "unanswered"] as const).map(
                    (sort) => (
                      <Button
                        key={sort}
                        variant={sortBy === sort ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy(sort)}
                        className="capitalize"
                      >
                        {sort}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Three Column Layout - Glassdoor Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 px-3 sm:px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Hidden on mobile, show on md and up */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:block space-y-4 md:space-y-6"
          >
            {/* Create Post Card */}
            <Card className="p-4 md:p-6 sticky top-24">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">
                    Ask for help from the community
                  </p>
                </div>

                {user && (
                  <Button
                    asChild
                    className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background text-sm py-6"
                    size="sm"
                  >
                    <Link
                      href={routes.newForumPost()}
                      className="flex items-center justify-center gap-2"
                    >
                      <span className="hidden sm:inline">Ask Question</span>
                      <span className="sm:hidden">Create</span>
                      <Plus size={30} />
                    </Link>
                  </Button>
                )}
              </div>
            </Card>

            {/* Right side content */}
          </motion.div>

          {/* Center Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 space-y-4 md:space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <Input
                placeholder="Search for questions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 text-sm rounded-full"
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
                  <XIcon />
                </button>
              )}
            </div>

            {/* Posts Feed */}
            <div className="space-y-3">
              {loading ? (
                <Card className="p-6 text-center">
                  <PageLoading />
                </Card>
              ) : noForumPosts ? (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No posts found
                  </p>
                </Card>
              ) : (
                forumPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ForumPostCard post={post} />
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination Buttons */}
            {!noForumPosts && (
              <PaginationButtons
                previous={previous}
                hasNext={hasNext}
                hasPrev={hasPrev}
                next={next}
              />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
