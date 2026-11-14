"use client";

import React from "react";
import { ArrowUpRight, Eye } from "lucide-react";
import { LinkItem } from "@/types/mylink";
import { DynamicIcon } from "./icon-helper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LinkCardProps {
  link: LinkItem;
  onLinkClick: (link: LinkItem) => void;
}

export function LinkCard({ link, onLinkClick }: LinkCardProps) {
  const handleClick = () => {
    onLinkClick(link);
  };

  return (
    <a
      href={link.url}
      target={link.url.startsWith("mailto:") ? undefined : "_blank"}
      rel={link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      onClick={handleClick}
      className="group block focus:outline-none focus:ring-2 focus:ring-[#4D6E56] rounded-[20px]"
    >
      <Card className="p-4 sm:p-5 hover:border-[#4D6E56] hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer bg-card transition-all">
        <div className="flex items-start gap-3.5">
          {/* 링크 대표 아이콘 컨테이너 */}
          <div className="w-12 h-12 rounded-2xl bg-[#D6E1D8]/60 dark:bg-[#1E3024] group-hover:bg-[#4D6E56] text-[#1E3024] dark:text-[#F4FBF4] group-hover:text-[#F4FBF4] flex items-center justify-center shrink-0 transition-colors duration-200 shadow-xs">
            <DynamicIcon name={link.iconName} className="w-5 h-5 stroke-[2.2]" />
          </div>

          {/* 텍스트 & 메타 정보 */}
          <div className="flex-1 min-w-0">
            {/* 상단: 카테고리 태그 및 커스텀 강조 뱃지 */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                {link.category}
              </span>

              {link.badge && (
                <Badge
                  style={{
                    backgroundColor: "#4D6E56",
                    color: "#F4FBF4",
                  }}
                  size="sm"
                  className="border-transparent font-bold tracking-tight shadow-2xs"
                >
                  {link.badge}
                </Badge>
              )}
            </div>

            {/* 타이틀 */}
            <h2 className="text-base font-bold text-foreground group-hover:text-[#4D6E56] dark:group-hover:text-[#8FA594] transition-colors line-clamp-1 leading-snug">
              {link.title}
            </h2>

            {/* 서브타이틀 */}
            <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed break-keep">
              {link.subtitle}
            </p>

            {/* 하단 메타: 클릭수(조회수) */}
            <div className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              <Eye className="w-3.5 h-3.5 text-[#4D6E56]" />
              <span>조회수 {link.clickCount.toLocaleString()}회</span>
            </div>
          </div>

          {/* 우측 이동 화살표 */}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-[#F4FBF4] group-hover:bg-[#4D6E56] transition-all duration-200 shrink-0 ml-1">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Card>
    </a>
  );
}
