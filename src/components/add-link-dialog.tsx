"use client";

import React, { useState } from "react";
import {
  PlusCircle,
  Link as LinkIcon,
  Tag,
  Sparkles,
  Eye,
  Check,
  ExternalLink,
  Info,
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

interface AddLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (
    newLink: Omit<LinkItem, "id" | "clickCount" | "createdAt" | "updatedAt" | "order">
  ) => void;
  existingCategories?: string[];
}

// 뱃지 추천 프리셋
const BADGE_PRESETS = [
  "실시간 커밋",
  "인터랙티브",
  "대표 프로젝트",
  "스터디 노트",
  "커피챗 환영",
  "NEW",
  "HOT",
];

export function AddLinkDialog({
  isOpen,
  onClose,
  onAddLink,
  existingCategories = [],
}: AddLinkDialogProps) {
  // 폼 입력 상태
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("코드 저장소");
  const [iconName, setIconName] = useState("ExternalLink");
  const [badge, setBadge] = useState("");
  const badgeBgColor = "#4D6E56"; // 브랜드 시그니처 세이지 그린으로 통일
  const badgeTextColor = "#F4FBF4";
  const [isVisible, setIsVisible] = useState(true);

  // 에러 상태
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  // 폼 초기화 헬퍼
  const resetForm = () => {
    setTitle("");
    setUrl("");
    setSubtitle("");
    setCategory(existingCategories[0] || "코드 저장소");
    setIconName("ExternalLink");
    setBadge("");
    setIsVisible(true);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // URL 유효성 보정 및 검사
  const sanitizeUrl = (inputUrl: string): string => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return "";
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("mailto:")
    ) {
      return trimmed;
    }
    // 접두사가 없으면 기본 https:// 부여
    return `https://${trimmed}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; url?: string } = {};

    if (!title.trim()) {
      newErrors.title = "링크 제목을 입력해주세요.";
    }

    if (!url.trim()) {
      newErrors.url = "목적지 URL을 입력해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalUrl = sanitizeUrl(url);

    onAddLink({
      title: title.trim(),
      subtitle: subtitle.trim() || `${title.trim()} 바로가기`,
      url: finalUrl,
      category: category.trim() || "기타",
      iconName: iconName || "ExternalLink",
      badge: badge.trim() || undefined,
      badgeBgColor: badge.trim() ? badgeBgColor : undefined,
      badgeTextColor: badge.trim() ? badgeTextColor : undefined,
      isVisible,
    });

    handleClose();
  };

  // 추천 카테고리 목록 (기존 등록 카테고리 + 기본값)
  const defaultCategories = [
    "코드 저장소",
    "지도 연구",
    "포트폴리오",
    "개발 일지",
    "협업 문의",
  ];
  const mergedCategories = Array.from(
    new Set([...existingCategories.filter((c) => c !== "전체"), ...defaultCategories])
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent onClose={handleClose} className="sm:max-w-[480px]">
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
                내 프로필 페이지에 노출될 새로운 링크 카드를 등록합니다.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* 1. 링크 제목 (필수) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E3024] dark:text-[#F4FBF4] flex items-center gap-1">
              <span>제목</span>
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="예: GitHub 리포지토리, GIS 웹 지도 연구소"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={cn(errors.title && "border-red-500 focus-visible:ring-red-400")}
              autoFocus
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 font-medium pl-1">{errors.title}</p>
            )}
          </div>

          {/* 2. 목적지 URL (필수) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1E3024] dark:text-[#F4FBF4] flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-[#4D6E56]" />
              <span>목적지 URL</span>
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="https://github.com/my-profile 또는 mailto:..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
              }}
              className={cn(errors.url && "border-red-500 focus-visible:ring-red-400")}
            />
            {errors.url && (
              <p className="text-[11px] text-red-500 font-medium pl-1">{errors.url}</p>
            )}
          </div>

          {/* 3. 설명 (선택) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#4D6E56]" />
              <span>상세 설명 (부제목)</span>
            </label>
            <Textarea
              rows={2}
              placeholder="링크에 대한 간단한 설명을 입력하세요. (미입력 시 기본 안내 문구 적용)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="text-xs sm:text-sm"
            />
          </div>

          {/* 4. 카테고리 선택 및 입력 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>카테고리</span>
              </label>
              <span className="text-[11px] text-muted-foreground">태그 클릭 또는 직접 입력</span>
            </div>

            {/* 빠른 추천 카테고리 칩 */}
            <div className="flex flex-wrap gap-1.5">
              {mergedCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium active:scale-95",
                    category === cat
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* 5. 아이콘 선택 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>대표 아이콘 선택</span>
              <span className="text-[11px] text-[#4D6E56] font-medium">
                선택됨: {iconName}
              </span>
            </label>

            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-xl border border-border/70 bg-muted/30">
              {ICON_OPTIONS.map((item) => {
                const isSelected = iconName.toLowerCase() === item.name.toLowerCase();
                return (
                  <button
                    key={item.name}
                    type="button"
                    title={item.label}
                    onClick={() => setIconName(item.name)}
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

          {/* 6. 강조 뱃지 설정 (선택) */}
          <div className="space-y-2.5 p-3 rounded-2xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>강조 뱃지 (선택)</span>
              </label>
              {badge && (
                <button
                  type="button"
                  onClick={() => setBadge("")}
                  className="text-[10px] text-muted-foreground hover:text-red-500 underline cursor-pointer"
                >
                  뱃지 제거
                </button>
              )}
            </div>

            {/* 추천 뱃지 문구 칩 */}
            <div className="flex flex-wrap gap-1.5">
              {BADGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBadge(preset)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer font-medium active:scale-95",
                    badge === preset
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
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                <span>✦ 마이링크 시그니처 뱃지 컬러(세이지 그린)로 자동 통일됩니다.</span>
              </p>
            </div>
          </div>

          {/* 7. 노출 여부 스위치 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                링크 공개 상태
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {isVisible
                  ? "등록 즉시 메인 페이지에 노출됩니다."
                  : "비공개 상태로 저장되며 언제든 노출할 수 있습니다."}
              </span>
            </div>
            <Switch checked={isVisible} onCheckedChange={setIsVisible} />
          </div>

          {/* 8. 실시간 카드 미리보기 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#4D6E56]" />
                <span>실시간 미리보기</span>
              </span>
              {!isVisible && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  (비공개 예정)
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center shrink-0">
                  <DynamicIcon name={iconName} className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {category || "카테고리"}
                    </span>
                    {badge && (
                      <Badge
                        size="sm"
                        style={{
                          backgroundColor: badgeBgColor,
                          color: badgeTextColor,
                        }}
                        className="text-[10px] px-1.5 py-0 border-transparent font-bold"
                      >
                        {badge}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {title || "링크 제목이 여기에 표시됩니다"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {subtitle || "링크 상세 설명이 여기에 표시됩니다."}
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
              onClick={handleClose}
              className="h-10 px-4 text-xs font-semibold rounded-xl"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="h-10 px-5 bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 mr-1.5 stroke-[2.2]" />
              <span>링크 추가하기</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
