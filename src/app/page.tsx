"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Share2, Check, Mail } from "lucide-react";
import { MyLinkData, LinkItem } from "@/types/mylink";
import { INITIAL_DATA } from "@/lib/constants";
import { getStoredData, incrementLinkClick } from "@/lib/storage";
import { ProfileHeader } from "@/components/profile-header";
import { CategoryTabs } from "@/components/category-tabs";
import { LinkCard } from "@/components/link-card";
import { SkillsCard } from "@/components/skills-card";
import { Toast } from "@/components/toast";
import { AdminModal } from "@/components/admin-modal";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [data, setData] = useState<MyLinkData>(INITIAL_DATA);
  const [, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // 1. 클라이언트 마운트 시 localStorage에서 데이터 복원
  useEffect(() => {
    const stored = getStoredData();
    setData(stored);
    setIsLoaded(true);
  }, []);

  // 2. 단축키(Ctrl+Shift+A / Cmd+Shift+A) 리스너로 히든 관리자 모달 호출
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 토스트 메시지 헬퍼
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // 링크 공유하기 (URL 복사)
  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        triggerToast("링크가 클립보드에 복사되었습니다!");
      }
    } catch {
      triggerToast("링크 복사에 실패했습니다.");
    }
  };

  // 링크 카드 클릭 시 클릭 수 증가 처리
  const handleLinkClick = (clickedLink: LinkItem) => {
    const updatedLinks = incrementLinkClick(clickedLink.id);
    setData((prev) => ({
      ...prev,
      links: updatedLinks,
      analytics: {
        ...prev.analytics,
        totalClicks: (prev.analytics?.totalClicks || 0) + 1,
      },
    }));
  };

  // 활성(노출) 링크만 필터링 (isVisible === true)
  const visibleLinks = useMemo(() => {
    return data.links.filter((l) => l.isVisible);
  }, [data.links]);

  // 등록된 카테고리 목록 추출
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    visibleLinks.forEach((link) => {
      if (link.category) catSet.add(link.category);
    });
    return ["전체", ...Array.from(catSet)];
  }, [visibleLinks]);

  // 카테고리별 링크 개수 계산
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      전체: visibleLinks.length,
    };
    visibleLinks.forEach((link) => {
      counts[link.category] = (counts[link.category] || 0) + 1;
    });
    return counts;
  }, [visibleLinks]);

  // 선택된 카테고리에 따른 링크 필터링
  const filteredLinks = useMemo(() => {
    if (selectedCategory === "전체") {
      return visibleLinks;
    }
    return visibleLinks.filter((l) => l.category === selectedCategory);
  }, [visibleLinks, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-[#4D6E56] selection:text-[#F4FBF4] transition-colors pb-12">
      {/* 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/80">
        <div className="max-w-[540px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* 브랜드 워드마크 */}
          <div className="flex items-center gap-1.5 select-none">
            <span className="font-extrabold text-xl tracking-tight text-[#1E3024] dark:text-white">
              MyLink
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4D6E56] animate-pulse" />
          </div>

          {/* 우측 퀵 액션 버튼들 (40x40 히트 에어리어) */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="cursor-pointer shadow-xs border-border/70 hover:bg-card active:scale-95"
              title="페이지 공유하기 (URL 복사)"
              aria-label="링크 공유하기"
            >
              {showToast ? (
                <Check className="w-4 h-4 text-[#4D6E56] stroke-[2.5]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>

            {data.profile.email && (
              <a
                href={`mailto:${data.profile.email}`}
                className="inline-flex shrink-0 items-center justify-center w-10 h-10 rounded-full border border-border/70 bg-card hover:bg-card/80 text-foreground transition-all active:scale-95 shadow-xs"
                title="이메일 보내기"
                aria-label="이메일 문의하기"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 메인 뷰포트 컨테이너 (모바일 중심 max-w-[540px]) */}
      <main className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        {/* 1. 프로필 헤더 카드 */}
        <ProfileHeader
          profile={data.profile}
          onSecretTrigger={() => setIsAdminModalOpen(true)}
        />

        {/* 2. 카테고리 탭 필터 */}
        <section aria-label="링크 카테고리 필터">
          <CategoryTabs
            categories={categories}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
          />
        </section>

        {/* 3. 링크 목록 섹션 */}
        <section className="space-y-3" aria-label="링크 카드 목록">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-[#1E3024] dark:text-[#F4FBF4] flex items-center gap-1.5">
              <span>{selectedCategory}</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({filteredLinks.length})
              </span>
            </h2>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center border border-border/80 text-muted-foreground text-sm">
              등록된 링크가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>
          )}
        </section>

        {/* 4. 프로필 스킬 & 역량 요약 카드 */}
        <SkillsCard />

        {/* 5. 보안 푸터 (관리자 버튼 완전 은닉) */}
        <footer className="text-center text-xs text-muted-foreground pt-4 pb-4 space-y-1">
          <p className="font-semibold text-[#1E3024] dark:text-[#F4FBF4]">
            © 2026 {data.profile.name} • MyLink
          </p>
          <p className="text-[11px] opacity-75">
            Designed for Developers, Creators & GIS Researchers
          </p>
        </footer>
      </main>

      {/* 시크릿 관리자 인증 모달 */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* 토스트 알림 메시지 */}
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}
