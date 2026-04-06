"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { forumCategories } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Users,
  Code2,
  Building2,
  Lightbulb,
  BookMarked,
} from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Users,
  Code2,
  Building2,
  Lightbulb,
  BookMarked,
};

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onCategoryChange("all")}
        className="rounded-full"
      >
        All Categories
      </Button>

      {forumCategories.map((category) => {
        const IconComponent = iconMap[category.icon];
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "rounded-full flex items-center gap-2",
              isSelected && "ring-2 ring-offset-2",
            )}
          >
            {IconComponent && <IconComponent className="size-4" />}
            {category.name}
          </Button>
        );
      })}
    </div>
  );
}
