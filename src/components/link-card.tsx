"use client";

import React, { useState } from "react";
import { ArrowUpRight, Eye, Pencil, Trash2, Clock } from "lucide-react";
import { LinkItem } from "@/types/mylink";
import { DynamicIcon } from "./icon-helper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineEditForm } from "./inline-edit-form";
import { formatUpdatedAt, formatFullDateTime } from "@/lib/utils";

interface LinkCardProps {
  link: LinkItem;
  onLinkClick: (link: LinkItem) => void;
  onUpdateLink?: (
    linkId: string,
    updates: Partial<Omit<LinkItem, "id" | "clickCount" | "createdAt">>
  ) => Promise<void> | void;
  onDeleteClick?: (link: LinkItem) => void;
  existingCategories?: string[];
  isEditable?: boolean;
}

export function LinkCard({
  link,
  onLinkClick,
  onUpdateLink,
  onDeleteClick,
  existingCategories = [],
  isEditable = true,
}: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // 인라인 수정 모드일 때 인라인 폼 컴포넌트 렌더링
  if (isEditing) {
    return (
      <InlineEditForm
        link={link}
        existingCategories={existingCategories}
        onSave={async (linkId, updates) => {
          if (onUpdateLink) {
            await onUpdateLink(linkId, updates);
          }
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  const handleLinkOpen = () => {
    onLinkClick(link);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteClick?.(link);
  };

  return (
    <Card className="p-4 sm:p-5 hover:border-[#4D6E56] hover:-translate-y-0.5 bg-card transition-all rounded-[20px] shadow-xs group">
      {/* 1. 링크 본문 이동 영역 */}
      <a
        href={link.url}
        target={link.url.startsWith("mailto:") ? undefined : "_blank"}
        rel={link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
        onClick={handleLinkOpen}
        className="block focus:outline-none"
      >
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
            <h3 className="text-base font-bold text-foreground group-hover:text-[#4D6E56] dark:group-hover:text-[#8FA594] transition-colors line-clamp-1 leading-snug">
              {link.title}
            </h3>

            {/* 서브타이틀 */}
            <p className="text-xs sm:text-[13px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed break-keep">
              {link.subtitle}
            </p>
          </div>

          {/* 우측 바로가기 화살표 */}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-[#F4FBF4] group-hover:bg-[#4D6E56] transition-all duration-200 shrink-0 ml-1">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </a>

      {/* 2. 하단 메타 & 항상 표시되는 관리 버튼 영역 (수정/삭제) */}
      <div className="mt-3.5 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-y-2 gap-x-2">
        {/* 메타 정보: 조회수 & 수정 시각 (Updated At) */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-[#4D6E56]" />
            <span>조회수 {link.clickCount.toLocaleString()}회</span>
          </div>

          <span className="text-border/70 select-none">•</span>

          <div
            className="flex items-center gap-1 text-[11px] text-muted-foreground"
            title={`마지막 수정: ${formatFullDateTime(link.updatedAt || link.createdAt)}`}
          >
            <Clock className="w-3.5 h-3.5 text-[#4D6E56]" />
            <span>수정 {formatUpdatedAt(link.updatedAt || link.createdAt)}</span>
          </div>
        </div>

        {/* 항상 표시되는 액션 버튼들 (수정 / 삭제) - 편집 가능 모드일 때만 노출 */}
        {isEditable && (
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 수정 버튼 */}
            {onUpdateLink && (
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold text-[#4D6E56] bg-[#4D6E56]/10 hover:bg-[#4D6E56] hover:text-[#F4FBF4] border border-[#4D6E56]/25 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="링크 수정 (인라인 편집)"
                aria-label={`${link.title} 수정`}
              >
                <Pencil className="w-3 h-3 stroke-[2.2]" />
                <span>수정</span>
              </button>
            )}

            {/* 삭제 버튼 */}
            {onDeleteClick && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-600 hover:text-white border border-red-200 dark:border-red-900/50 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="링크 삭제"
                aria-label={`${link.title} 삭제`}
              >
                <Trash2 className="w-3 h-3 stroke-[2.2]" />
                <span>삭제</span>
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
