"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/forum/category-filter";
import { useAuth } from "@/lib/context/auth-context";
import {
  Plus,
  MessageCircle,
  ThumbsUp,
  CircleQuestionMarkIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { routes } from "@/lib/routes";
import { useForumPosts } from "@/lib/hooks";
import PageLoading from "@/components/page-loading";
import ms from "ms";
import { toast } from "sonner";
import { ForumPostSortBy } from "@/lib/types";

export default function ForumPage() {
  const { user } = useAuth();
  const router = useRouter();
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
  } = useForumPosts({ category: selectedCategory, sortBy: sortBy });

  const noForumPosts = forumPosts?.length === 0;

  const handleSearch = async (query: string) => {};

  const handleClear = () => {
    setSearchQuery("");
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

  console.log(error);

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
            className="hidden md:block space-y-4 md:space-y-6"
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

            {/* My Bowls Card */}
            {/* <Card className="p-4 md:p-6">
              <h3 className="font-semibold text-foreground text-sm mb-4">
                My Bowls
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium">
                    Career Advice
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full text-xs md:text-sm h-8 md:h-10"
                asChild
              >
                <Link
                  href="/dashboard/forum"
                  className="flex items-center justify-center gap-1 md:gap-2"
                >
                  <Compass className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Explore Bowls</span>
                  <span className="sm:hidden">Explore</span>
                </Link>
              </Button>
            </Card> */}
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
                placeholder="Search for Bowls or conversations"
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-4 text-sm rounded-full"
              />
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
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(routes.forumPost({ postId: post.id }))
                    }
                  >
                    <Card className="p-3 md:p-4 hover:shadow-md transition-all hover:border-primary/30">
                      <div className="flex gap-3 md:gap-4">
                        {/* Author Avatar */}
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <CircleQuestionMarkIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm md:text-base">
                            {post.title}
                          </h3>
                          <p className="text-xs md:text-sm text-foreground mb-2 line-clamp-2">
                            {post.content}
                          </p>

                          {/* Engagement Metrics */}
                          <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground flex-wrap">
                            <button className="flex items-center gap-1 hover:text-primary transition-colors">
                              <ThumbsUp className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="text-foreground font-medium">
                                {post.votes ?? 0}
                              </span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-primary transition-colors">
                              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="text-foreground font-medium">
                                {post.answers}
                              </span>
                            </button>
                            {/* <div className="flex items-center gap-1">
                              <span className="text-xs">😊😍😢</span>
                              <span className="text-foreground font-medium text-xs md:text-sm">
                                {post.votes ?? 0}
                              </span>
                            </div> */}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground text-right shrink-0 whitespace-nowrap">
                          <p>
                            {ms(Date.now() - post.createdAt?.toMillis())} ago
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {!noForumPosts && (
              <div className="w-full flex justify-center items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!hasPrev}
                    onClick={previous}
                  >
                    Previous
                  </Button>
                  <Button disabled={!hasNext} onClick={next}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Sidebar - Bowls/Communities - Hidden on mobile */}
          {/* <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block space-y-4 md:space-y-6"
          >
            <Card className="p-4 md:p-6 sticky top-24"></Card>
          </motion.div> */}
        </div>
      </div>
    </>
  );
}
