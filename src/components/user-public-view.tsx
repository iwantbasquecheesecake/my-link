"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Share2, Check, ExternalLink, Sparkles, Home } from "lucide-react";
import { LinkItem, ProfileConfig } from "@/types/mylink";
import { INITIAL_DATA } from "@/lib/constants";
import { UserProfile } from "@/lib/firebase-auth";
import { useLinksQuery, useIncrementClickMutation } from "@/hooks/use-links-query";
import { useProfileQuery } from "@/hooks/use-profile-query";
import { ProfileHeader } from "@/components/profile-header";
import { CategoryTabs } from "@/components/category-tabs";
import { LinkCard } from "@/components/link-card";
import { SkillsCard } from "@/components/skills-card";
import { Toast } from "@/components/toast";
import { Button } from "@/components/ui/button";

interface UserPublicViewProps {
  initialUser: UserProfile;
  initialLinks: LinkItem[];
}

export function UserPublicView({ initialUser, initialLinks }: UserPublicViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);
  const toastTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // TanStack Query로 실시간 링크 및 프로필 동기화 (초기값 initialData 제공)
  const { data: links = initialLinks } = useLinksQuery(initialUser.uid);
  const { data: userProfile = initialUser } = useProfileQuery(initialUser.uid);
  const incrementClickMutation = useIncrementClickMutation(initialUser.uid);

  const activeUser = userProfile || initialUser;

  // 브라우저 탭 타이틀 동적 설정 (예: "임나린 (@narin31005) | MyLink")
  useEffect(() => {
    if (typeof document !== "undefined") {
      const name = activeUser.username || activeUser.name;
      const id = activeUser.displayName ? `@${activeUser.displayName}` : "";
      const displayTitle = name && id ? `${name} (${id})` : name || id || "프로필";
      document.title = `${displayTitle} | MyLink`;
    }
  }, [activeUser]);

  // 토스트 알림 표시 헬퍼
  const triggerToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3500);
  }, []);

  // 링크 클릭 핸들러 (새 탭 열기 & 조회수 증가)
  const handleLinkClick = useCallback(
    (link: LinkItem) => {
      // 1. 조회수 증가 뮤테이션 호출 (낙관적 UI 업데이트 포함)
      incrementClickMutation.mutate(link.id);

      // 2. 새 탭으로 URL 열기
      if (typeof window !== "undefined" && link.url) {
        let targetUrl = link.url.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `https://${targetUrl}`;
        }
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      }
    },
    [incrementClickMutation]
  );

  // 프로필 공유하기 (현재 URL 복사)
  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${activeUser.username || activeUser.displayName}님의 MyLink`,
          text: activeUser.bio || "MyLink에서 링크들을 확인해보세요!",
          url: currentUrl,
        });
        return;
      }
    } catch {
      // 공유 취소 등 무시
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      triggerToast("프로필 링크가 클립보드에 복사되었습니다!");
    } catch {
      triggerToast("링크 복사에 실패했습니다.");
    }
  };

  // 카테고리 목록 및 카운트 계산
  const { categories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = { 전체: links.length };
    links.forEach((l) => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });

    const definedCategories = [
      "전체",
      "블로그",
      "개발",
      "소셜",
      "포트폴리오",
      "소개",
      "채용",
      "기타",
    ];

    const presentCategories = Array.from(new Set(links.map((l) => l.category)));
    const allUniqueCategories = Array.from(
      new Set([...definedCategories, ...presentCategories])
    );

    const validCategories = allUniqueCategories.filter(
      (cat) => cat === "전체" || (counts[cat] && counts[cat] > 0)
    );

    return {
      categories: validCategories,
      categoryCounts: counts,
    };
  }, [links]);

  // 선택된 카테고리에 따른 필터링 링크
  const filteredLinks = useMemo(() => {
    if (selectedCategory === "전체") return links;
    return links.filter((l) => l.category === selectedCategory);
  }, [links, selectedCategory]);

  // 프로필 베이스 데이터 구성
  const baseProfileConfig: ProfileConfig = useMemo(
    () => ({
      ...INITIAL_DATA.profile,
      name: activeUser.username || activeUser.name || "사용자",
      englishName: activeUser.displayName || "user",
      role: activeUser.role || "MyLink 크리에이터",
      bio: activeUser.bio || "",
      avatarUrl: activeUser.photoURL || INITIAL_DATA.profile.avatarUrl,
      email: activeUser.email || "",
    }),
    [activeUser]
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-[#4D6E56]/20 selection:text-[#1E3024]">
      {/* 1. 최상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-md transition-all">
        <div className="max-w-[620px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* MyLink 브랜드 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
            title="MyLink 홈으로 이동"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E3024] to-[#4D6E56] flex items-center justify-center text-white font-black text-sm tracking-tight shadow-2xs group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-[#4D6E56] transition-colors">
              MyLink
            </span>
          </Link>

          {/* 우측 액션: 공유 & 나도 만들기 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-semibold text-foreground bg-muted/60 hover:bg-muted border border-border/70 transition-all cursor-pointer active:scale-95 shadow-2xs"
              title="이 프로필 공유하기"
            >
              <Share2 className="w-3.5 h-3.5 text-[#4D6E56]" />
              <span className="hidden sm:inline">공유</span>
            </button>

            <Link href="/">
              <Button
                size="sm"
                className="h-8 px-3 rounded-xl text-xs font-bold bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>나도 만들기</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 영역 */}
      <main className="max-w-[620px] mx-auto px-4 pt-6 pb-20 space-y-6">
        {/* 프로필 카드 (방문자 공개 모드: 수정 불가) */}
        <ProfileHeader
          profile={baseProfileConfig}
          userProfile={activeUser}
          isLoggedIn={false}
          onSecretTrigger={() => triggerToast("✨ MyLink 크리에이터 프로필입니다.")}
        />

        {/* Focus & Skills 기술 스택 카드 */}
        <SkillsCard />

        {/* 카테고리 탭 필터링 */}
        <section aria-label="링크 카테고리">
          <CategoryTabs
            categories={categories}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={categoryCounts}
          />
        </section>

        {/* 링크 목록 섹션 */}
        <section aria-label="링크 목록" className="space-y-3 pt-1">
          {/* 카테고리 헤더 & 카운트 안내 */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                {selectedCategory}
              </h2>
              <span className="text-xs font-medium text-muted-foreground">
                ({filteredLinks.length})
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              최신순
            </span>
          </div>

          {/* 링크 카드 리스트 */}
          {filteredLinks.length > 0 ? (
            <div className="space-y-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onLinkClick={handleLinkClick}
                  isEditable={false}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-border/80 p-10 text-center bg-card/40">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedCategory === "전체"
                  ? "등록된 링크가 아직 없습니다."
                  : `'${selectedCategory}' 카테고리에 등록된 링크가 없습니다.`}
              </p>
            </div>
          )}
        </section>

        {/* 하단 푸터 */}
        <footer className="pt-10 pb-6 text-center border-t border-border/40">
          <p className="text-xs text-muted-foreground font-medium">
            © {new Date().getFullYear()} {activeUser.username || activeUser.displayName} • Powered by{" "}
            <Link
              href="/"
              className="text-[#4D6E56] font-bold hover:underline"
            >
              MyLink
            </Link>
          </p>
        </footer>
      </main>

      {/* 중앙 상단 Sonner 스타일 알림 토스트 */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
