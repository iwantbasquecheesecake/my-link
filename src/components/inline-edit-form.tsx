"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Link as LinkIcon,
  Tag,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  X,
  Edit3,
  Clock,
} from "lucide-react";
import { LinkItem } from "@/types/mylink";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { ICON_OPTIONS, DynamicIcon } from "@/components/icon-helper";
import { cn, formatUpdatedAt, formatFullDateTime } from "@/lib/utils";
import {
  linkFormSchema,
  LinkFormValues,
  LIMITS,
  BADGE_PRESETS,
  DEFAULT_CATEGORIES,
} from "@/lib/link-schema";

interface InlineEditFormProps {
  link: LinkItem;
  existingCategories?: string[];
  onSave: (
    linkId: string,
    updates: Partial<Omit<LinkItem, "id" | "clickCount" | "createdAt">>
  ) => Promise<void> | void;
  onCancel: () => void;
}

export function InlineEditForm({
  link,
  existingCategories = [],
  onSave,
  onCancel,
}: InlineEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mergedCategories = Array.from(
    new Set([
      ...existingCategories.filter((c) => c !== "전체"),
      ...DEFAULT_CATEGORIES,
    ])
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid, isDirty },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    mode: "onChange",
    defaultValues: {
      title: link.title,
      url: link.url,
      subtitle: link.subtitle,
      category: link.category,
      iconName: link.iconName || "ExternalLink",
      badge: link.badge || "",
      isVisible: link.isVisible ?? true,
    },
  });

  const watchAll = watch();
  const currentTitle = watchAll.title || "";
  const currentSubtitle = watchAll.subtitle || "";
  const currentCategory = watchAll.category || "";
  const currentIconName = watchAll.iconName || "ExternalLink";
  const currentBadge = watchAll.badge || "";
  const currentIsVisible = watchAll.isVisible ?? true;

  const onSubmit = async (data: LinkFormValues) => {
    let finalUrl = data.url.trim();
    if (
      !finalUrl.startsWith("http://") &&
      !finalUrl.startsWith("https://") &&
      !finalUrl.startsWith("mailto:")
    ) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      setIsSubmitting(true);
      await onSave(link.id, {
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || `${data.title.trim()} 바로가기`,
        url: finalUrl,
        category: data.category.trim(),
        iconName: data.iconName || "ExternalLink",
        badge: data.badge?.trim() || undefined,
        isVisible: data.isVisible,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card className="p-4 sm:p-5 border-2 border-[#4D6E56] bg-card shadow-md rounded-[20px] transition-all">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* 인라인 편집 모드 헤더 */}
        <div className="flex items-center justify-between pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
            </span>
            <div>
              <span className="text-xs font-bold text-foreground block">
                링크 인라인 수정
              </span>
              <span
                className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5"
                title={`마지막 수정: ${formatFullDateTime(link.updatedAt || link.createdAt)}`}
              >
                <Clock className="w-3 h-3 text-[#4D6E56]" />
                <span>마지막 수정: {formatUpdatedAt(link.updatedAt || link.createdAt)}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>닫기</span>
          </button>
        </div>

        {/* 1. 링크 제목 (필수, 2~40자) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1E3024] dark:text-[#F4FBF4] flex items-center gap-1">
              <span>제목</span>
              <span className="text-red-500">*</span>
            </label>
            <span
              className={cn(
                "text-[10px] tabular-nums font-medium",
                currentTitle.length > LIMITS.TITLE_MAX
                  ? "text-red-500 font-bold"
                  : "text-muted-foreground"
              )}
            >
              {currentTitle.length} / {LIMITS.TITLE_MAX}자
            </span>
          </div>
          <Input
            type="text"
            placeholder="링크 제목 입력"
            {...register("title")}
            className={cn(
              "h-9 text-xs sm:text-sm",
              errors.title && "border-red-500 focus-visible:ring-red-400 bg-red-50/20"
            )}
          />
          {errors.title && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 pl-1 pt-0.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.title.message}</span>
            </p>
          )}
        </div>

        {/* 2. 목적지 URL (필수, 유효성 검증) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1E3024] dark:text-[#F4FBF4] flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-[#4D6E56]" />
              <span>목적지 URL</span>
              <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-muted-foreground">https:// 자동 보정</span>
          </div>
          <Input
            type="text"
            placeholder="https://..."
            {...register("url")}
            className={cn(
              "h-9 text-xs sm:text-sm",
              errors.url && "border-red-500 focus-visible:ring-red-400 bg-red-50/20"
            )}
          />
          {errors.url && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 pl-1 pt-0.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.url.message}</span>
            </p>
          )}
        </div>

        {/* 3. 상세 설명 (최대 80자) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <span>상세 설명 (부제목)</span>
            </label>
            <span
              className={cn(
                "text-[10px] tabular-nums font-medium",
                currentSubtitle.length > LIMITS.SUBTITLE_MAX
                  ? "text-red-500 font-bold"
                  : "text-muted-foreground"
              )}
            >
              {currentSubtitle.length} / {LIMITS.SUBTITLE_MAX}자
            </span>
          </div>
          <Textarea
            rows={2}
            placeholder="링크 설명 입력"
            {...register("subtitle")}
            className={cn(
              "text-xs sm:text-sm",
              errors.subtitle && "border-red-500 focus-visible:ring-red-400 bg-red-50/20"
            )}
          />
          {errors.subtitle && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 pl-1 pt-0.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.subtitle.message}</span>
            </p>
          )}
        </div>

        {/* 4. 카테고리 (필수, 최대 15자) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#4D6E56]" />
              <span>카테고리</span>
              <span className="text-red-500">*</span>
            </label>
            <span
              className={cn(
                "text-[10px] tabular-nums font-medium",
                currentCategory.length > LIMITS.CATEGORY_MAX
                  ? "text-red-500 font-bold"
                  : "text-muted-foreground"
              )}
            >
              {currentCategory.length} / {LIMITS.CATEGORY_MAX}자
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {mergedCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setValue("category", cat, { shouldValidate: true })}
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer font-medium active:scale-95",
                  currentCategory === cat
                    ? "bg-[#4D6E56] text-[#F4FBF4] border-[#4D6E56] shadow-xs"
                    : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <Input
            type="text"
            placeholder="카테고리 직접 입력"
            {...register("category")}
            className={cn(
              "h-9 text-xs",
              errors.category && "border-red-500 focus-visible:ring-red-400 bg-red-50/20"
            )}
          />
          {errors.category && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 pl-1 pt-0.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.category.message}</span>
            </p>
          )}
        </div>

        {/* 5. 대표 아이콘 선택 */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
            <span>대표 아이콘</span>
            <span className="text-[11px] text-[#4D6E56] font-medium">
              선택됨: {currentIconName}
            </span>
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl border border-border/70 bg-muted/30">
            {ICON_OPTIONS.map((item) => {
              const isSelected = currentIconName.toLowerCase() === item.name.toLowerCase();
              return (
                <button
                  key={item.name}
                  type="button"
                  title={item.label}
                  onClick={() => setValue("iconName", item.name, { shouldValidate: true })}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#4D6E56] text-[#F4FBF4] ring-2 ring-[#4D6E56] shadow-xs scale-105"
                      : "bg-card text-foreground hover:bg-muted border border-border/60"
                  )}
                >
                  <DynamicIcon name={item.name} className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. 강조 뱃지 (선택, 최대 10자) */}
        <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#4D6E56]" />
              <span>강조 뱃지 (선택)</span>
            </label>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] tabular-nums font-medium",
                  currentBadge.length > LIMITS.BADGE_MAX
                    ? "text-red-500 font-bold"
                    : "text-muted-foreground"
                )}
              >
                {currentBadge.length} / {LIMITS.BADGE_MAX}자
              </span>
              {currentBadge && (
                <button
                  type="button"
                  onClick={() => setValue("badge", "", { shouldValidate: true })}
                  className="text-[10px] text-muted-foreground hover:text-red-500 underline cursor-pointer"
                >
                  삭제
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {BADGE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue("badge", preset, { shouldValidate: true })}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer font-medium active:scale-95",
                  currentBadge === preset
                    ? "bg-[#4D6E56] text-[#F4FBF4] border-[#4D6E56] shadow-xs"
                    : "bg-card text-muted-foreground border-border hover:bg-muted"
                )}
              >
                {preset}
              </button>
            ))}
          </div>

          <Input
            type="text"
            placeholder="뱃지 문구 (예: HOT, NEW)"
            {...register("badge")}
            className={cn(
              "h-8 text-xs",
              errors.badge && "border-red-500 focus-visible:ring-red-400 bg-red-50/20"
            )}
          />
          {errors.badge && (
            <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 pl-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.badge.message}</span>
            </p>
          )}
        </div>

        {/* 7. 공개 상태 토글 */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/70">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground block">
              링크 공개 상태
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {currentIsVisible ? "메인 목록에 공개 중" : "비공개로 전환"}
            </span>
          </div>
          <Controller
            control={control}
            name="isVisible"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* 8. 저장 / 취소 액션 버튼 */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 px-3.5 text-xs font-semibold rounded-xl cursor-pointer"
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={(hasErrors && isDirty) || isSubmitting}
            className="h-9 px-4 bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>저장 중...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>수정 완료</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
