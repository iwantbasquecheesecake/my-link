"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusCircle,
  Link as LinkIcon,
  Tag,
  Sparkles,
  Eye,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { LinkItem } from "@/types/mylink";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ICON_OPTIONS, DynamicIcon } from "@/components/icon-helper";
import { cn } from "@/lib/utils";
import {
  linkFormSchema,
  LinkFormValues,
  LIMITS,
  BADGE_PRESETS,
  DEFAULT_CATEGORIES,
} from "@/lib/link-schema";

interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (
    newLink: Omit<LinkItem, "id" | "clickCount" | "createdAt" | "updatedAt" | "order">
  ) => Promise<void> | void;
  existingCategories?: string[];
}

export function AddLinkDialog({
  isOpen,
  onClose,
  onAddLink,
  existingCategories = [],
}: AddLinkDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 브랜드 고정 뱃지 컬러 (세이지 그린 통일)
  const badgeBgColor = "#4D6E56";
  const badgeTextColor = "#F4FBF4";

  const mergedCategories = Array.from(
    new Set([...existingCategories.filter((c) => c !== "전체"), ...DEFAULT_CATEGORIES])
  );

  // 2. React Hook Form (RHF) 초기화 및 Zod Resolver 바인딩
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isValid, isDirty, touchedFields },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    mode: "onChange", // 실시간 입력 검증 활성화
    defaultValues: {
      title: "",
      url: "",
      subtitle: "",
      category: existingCategories[0] || "코드 저장소",
      iconName: "ExternalLink",
      badge: "",
      isVisible: true,
    },
  });

  // 실시간 입력값 감시 (실시간 미리보기 및 글자수 카운터에 바인딩)
  const watchAll = watch();
  const currentTitle = watchAll.title || "";
  const currentUrl = watchAll.url || "";
  const currentSubtitle = watchAll.subtitle || "";
  const currentCategory = watchAll.category || "";
  const currentIconName = watchAll.iconName || "ExternalLink";
  const currentBadge = watchAll.badge || "";
  const currentIsVisible = watchAll.isVisible ?? true;

  // 모달이 닫힐 때 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      reset({
        title: "",
        url: "",
        subtitle: "",
        category: existingCategories[0] || "코드 저장소",
        iconName: "ExternalLink",
        badge: "",
        isVisible: true,
      });
    }
  }, [isOpen, reset, existingCategories]);

  // 폼 제출 핸들러 (Zod 검증 통과 후 실행)
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
      await onAddLink({
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || `${data.title.trim()} 바로가기`,
        url: finalUrl,
        category: data.category.trim(),
        iconName: data.iconName || "ExternalLink",
        badge: data.badge?.trim() || undefined,
        badgeBgColor,
        badgeTextColor,
        isVisible: data.isVisible,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="sm:max-w-[500px]">
        {/* 다이얼로그 헤더 */}
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center shrink-0 shadow-xs">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#1E3024] dark:text-[#F4FBF4]">
                새 링크 추가
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                React Hook Form & Zod 스키마 검증 기반의 안전한 링크 등록
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 pt-1">
          {/* 1. 링크 제목 (필수, Zod: 2~40자) */}
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
              placeholder="예: GitHub 리포지토리, 개인 블로그, 포트폴리오"
              {...register("title")}
              className={cn(
                errors.title && "border-red-500 focus-visible:ring-red-400 bg-red-50/20"
              )}
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 pl-1 pt-0.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title.message}</span>
              </p>
            )}
          </div>

          {/* 2. 목적지 URL (필수, Zod 정규식 검증) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1E3024] dark:text-[#F4FBF4] flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>목적지 URL</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-muted-foreground">https:// 자동 지원</span>
            </div>
            <Input
              type="text"
              placeholder="https://github.com/my-profile 또는 mailto:..."
              {...register("url")}
              className={cn(
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

          {/* 3. 설명 (선택, Zod: 최대 80자) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#4D6E56]" />
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
              placeholder="링크에 대한 간단한 설명을 입력하세요. (미입력 시 기본 안내 문구 적용)"
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

          {/* 4. 카테고리 (필수, Zod: 최대 15자) */}
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

            {/* 빠른 추천 카테고리 칩 */}
            <div className="flex flex-wrap gap-1.5">
              {mergedCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue("category", cat, { shouldValidate: true })}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium active:scale-95",
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

          {/* 5. 아이콘 선택 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>대표 아이콘 선택</span>
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
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer relative",
                      isSelected
                        ? "bg-[#4D6E56] text-[#F4FBF4] ring-2 ring-[#4D6E56] shadow-xs scale-105"
                        : "bg-card text-foreground hover:bg-muted border border-border/60 hover:scale-105"
                    )}
                  >
                    <DynamicIcon name={item.name} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. 강조 뱃지 (선택, Zod: 최대 10자) */}
          <div className="space-y-2 p-3 rounded-2xl bg-muted/40 border border-border/60">
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

            {/* 추천 뱃지 문구 칩 */}
            <div className="flex flex-wrap gap-1.5">
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

            <div>
              <Input
                type="text"
                placeholder="뱃지 문구 직접 입력 (예: 실시간 커밋, NEW)"
                {...register("badge")}
                className={cn(
                  "h-9 text-xs",
                  errors.badge && "border-red-500 focus-visible:ring-red-400 bg-red-50/20"
                )}
              />
              {errors.badge ? (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 pl-1 pt-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.badge.message}</span>
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground mt-1">
                  ✦ 마이링크 시그니처 뱃지 컬러(세이지 그린)로 자동 통일 적용됩니다.
                </p>
              )}
            </div>
          </div>

          {/* 7. 노출 여부 스위치 (Controller 연동) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                링크 공개 상태
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {currentIsVisible
                  ? "등록 즉시 메인 페이지에 노출됩니다."
                  : "비공개 상태로 저장되며 언제든 노출할 수 있습니다."}
              </span>
            </div>
            <Controller
              control={control}
              name="isVisible"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* 8. 실시간 카드 미리보기 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#4D6E56]" />
                <span>실시간 미리보기</span>
              </span>
              {hasErrors ? (
                <span className="text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>입력 오류를 확인해주세요</span>
                </span>
              ) : !currentIsVisible ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  (비공개 예정)
                </span>
              ) : (
                <span className="text-[#4D6E56] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>정상 입력됨</span>
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center shrink-0">
                  <DynamicIcon name={currentIconName} className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {currentCategory.trim() || "카테고리"}
                    </span>
                    {currentBadge.trim() && (
                      <Badge
                        size="sm"
                        style={{
                          backgroundColor: badgeBgColor,
                          color: badgeTextColor,
                        }}
                        className="text-[10px] px-1.5 py-0 border-transparent font-bold"
                      >
                        {currentBadge.trim()}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {currentTitle.trim() || "링크 제목이 여기에 표시됩니다"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {currentSubtitle.trim() ||
                      (currentTitle.trim()
                        ? `${currentTitle.trim()} 바로가기`
                        : "링크 상세 설명이 여기에 표시됩니다.")}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-xs font-semibold rounded-xl cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={(hasErrors && isDirty) || isSubmitting}
              className="h-10 px-5 bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Firebase 저장 중...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-1.5 stroke-[2.2]" />
                  <span>링크 추가하기</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
