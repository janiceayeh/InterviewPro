import {
  CircleQuestionMarkIcon,
  ThumbsUp,
  MessageCircle,
  Eye,
} from "lucide-react";
import ms from "ms";
import { Card } from "../ui/card";
import { ForumPost } from "@/lib/types";
import { ForumPostVoteButton } from "./ForumPostVoteButton";

type Props = {
  post: ForumPost;
};

export default function ForumPostCard({ post }: Props) {
  return (
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
            <ForumPostVoteButton post={post} />
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-foreground font-medium">
                {post.answers}
              </span>
            </button>
            <div className="flex items-center gap-1">
              <Eye className="size-4" />
              <span className="font-medium text-xs">{post.views}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-right shrink-0 whitespace-nowrap">
          <p>{ms(Date.now() - post.createdAt?.toMillis())} ago</p>
        </div>
      </div>
    </Card>
  );
}
