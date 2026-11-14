"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  counts: Record<string, number>;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelectCategory,
  counts,
}: CategoryTabsProps) {
  return (
    <Tabs value={activeCategory} onValueChange={onSelectCategory}>
      <TabsList>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count = counts[cat] ?? 0;

          return (
            <TabsTrigger
              key={cat}
              value={cat}
              className={`gap-1.5 ${
                isActive
                  ? "!bg-[#4D6E56] !text-[#F4FBF4]"
                  : "!bg-card text-foreground"
              }`}
            >
              <span>{cat}</span>
              <Badge
                variant={isActive ? "forest" : "secondary"}
                size="sm"
                className="pointer-events-none"
              >
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
