"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Share2, Check, Plus, RefreshCw, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { type User } from "firebase/auth";
import { LinkItem } from "@/types/mylink";
import { INITIAL_DATA } from "@/lib/constants";
import {
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  UserProfile,
} from "@/lib/firebase-auth";
import {
  useLinksQuery,
  useAddLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  useIncrementClickMutation,
} from "@/hooks/use-links-query";
import {
  useProfileQuery,
  useSaveProfileMutation,
  useUpdateProfileDataMutation,
} from "@/hooks/use-profile-query";
import { ProfileHeader } from "@/components/profile-header";
import { CategoryTabs } from "@/components/category-tabs";
import { LinkCard } from "@/components/link-card";
import { SkillsCard } from "@/components/skills-card";
import { Toast } from "@/components/toast";
import { AdminModal } from "@/components/admin-modal";
import { AddLinkDialog } from "@/components/add-link-dialog";
import { DeleteLinkModal } from "@/components/delete-link-modal";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { UnauthenticatedHero } from "@/components/unauthenticated-hero";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState<boolean>(false);
  const [targetDeleteLink, setTargetDeleteLink] = useState<LinkItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [addingLinkTitle, setAddingLinkTitle] = useState<string>("");

  // Firebase Auth 사용자 상태
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthActionLoading, setIsAuthActionLoading] = useState<boolean>(false);

  // 1. TanStack Query: 사용자 링크 목록 조회 쿼리 (Firestore 실시간 리스너 자동 동기화)
  const {
    data: links = [],
    isLoading: isLoadingLinks,
    refetch: refetchLinks,
  } = useLinksQuery(currentUser?.uid);

  // 2. TanStack Query: 사용자 프로필 조회 쿼리 (users/{userid}/profile)
  const {
    data: userProfile,
    refetch: refetchProfile,
  } = useProfileQuery(currentUser?.uid);

  // 3. TanStack Mutations: 링크 관련 뮤테이션 훅
  const addLinkMutation = useAddLinkMutation(currentUser?.uid);
  const updateLinkMutation = useUpdateLinkMutation(currentUser?.uid);
  const deleteLinkMutation = useDeleteLinkMutation(currentUser?.uid);
  const incrementClickMutation = useIncrementClickMutation(currentUser?.uid);

  // 4. TanStack Mutations: 프로필 관련 뮤테이션 훅
  const saveProfileMutation = useSaveProfileMutation(currentUser?.uid);
  const updateProfileDataMutation = useUpdateProfileDataMutation(currentUser?.uid);

  // 토스트 메시지 헬퍼 (Sonner 스타일 중앙 상단 알림)
  const toastTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const triggerToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2800);
  }, []);

  // Firebase Auth 실시간 인증 상태 감시
  useEffect(() => {
    let isMounted = true;
    setIsAuthLoading(true);

    const unsubscribe = subscribeToAuth(async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // 단축키(Ctrl+Shift+A / Cmd+Shift+A) 리스너로 히든 관리자 모달 호출
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

  // Google 소셜 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      setIsAuthActionLoading(true);
      triggerToast("Google 로그인 창을 여는 중...");
      const { user, profile } = await loginWithGoogle();
      setCurrentUser(user);
      const loginDisplayName = profile.username || profile.name || (user.email ? user.email.split("@")[0] : user.displayName) || "사용자";
      triggerToast(`${loginDisplayName}님 환영합니다! 🎉`);
    } catch (error: unknown) {
      console.error("Google 로그인 실패:", error);
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/popup-closed-by-user") {
        triggerToast("로그인 창이 닫혔습니다.");
      } else if (err.code === "auth/cancelled-popup-request") {
        // 중복 팝업 취소는 무시
      } else {
        triggerToast("Google 로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsAuthActionLoading(false);
    }
  };

  // Google 로그아웃 핸들러
  const handleGoogleLogout = async () => {
    try {
      setIsAuthActionLoading(true);
      await logoutUser();
      setCurrentUser(null);
      triggerToast("로그아웃되었습니다.");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      triggerToast("로그아웃에 실패했습니다.");
    } finally {
      setIsAuthActionLoading(false);
    }
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

  // 수동 새로고침 핸들러 (TanStack Query refetch)
  const handleManualRefresh = async () => {
    if (!currentUser) {
      triggerToast("로그인 후 실시간 링크를 새로고침할 수 있습니다.");
      return;
    }
    triggerToast("최신 데이터를 불러오는 중...");
    await Promise.all([refetchLinks(), refetchProfile()]);
    triggerToast("최신 데이터를 성공적으로 불러왔습니다!");
  };

  // 링크 카드 클릭 시 클릭 수 증가 처리 (TanStack 낙관적 업데이트)
  const handleLinkClick = (clickedLink: LinkItem) => {
    incrementClickMutation.mutate(clickedLink.id);
  };

  // 새 링크 추가 핸들러 (TanStack useMutation)
  const handleAddLink = async (
    newLinkInput: Omit<LinkItem, "id" | "clickCount" | "createdAt" | "updatedAt" | "order">
  ) => {
    if (!currentUser) {
      triggerToast("Google 로그인 후 새 링크를 추가할 수 있습니다.");
      handleGoogleLogin();
      return;
    }

    setAddingLinkTitle(newLinkInput.title.trim());
    triggerToast(`"${newLinkInput.title.trim()}" 등록 중...`);

    try {
      await addLinkMutation.mutateAsync(newLinkInput);
      if (selectedCategory !== "전체" && selectedCategory !== newLinkInput.category) {
        setSelectedCategory("전체");
      }
      triggerToast(`"${newLinkInput.title}" 링크가 등록되었습니다! 🎉`);
    } catch (error) {
      console.error("링크 등록 실패:", error);
      triggerToast("링크 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setAddingLinkTitle("");
    }
  };

  // 링크 수정 핸들러 (TanStack useMutation)
  const handleUpdateLink = async (
    linkId: string,
    updates: Partial<Omit<LinkItem, "id" | "clickCount" | "createdAt">>
  ) => {
    triggerToast("링크 수정 사항을 저장하는 중입니다...");
    try {
      await updateLinkMutation.mutateAsync({ linkId, updates });
      triggerToast("링크가 성공적으로 수정되었습니다! ✨");
    } catch (error) {
      console.error("링크 수정 실패:", error);
      triggerToast("링크 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 링크 삭제 모달 열기 핸들러
  const handleOpenDeleteModal = (link: LinkItem) => {
    setTargetDeleteLink(link);
    setIsDeleteModalOpen(true);
  };

  // 링크 삭제 확정 핸들러 (TanStack useMutation)
  const handleDeleteLink = async (linkId: string) => {
    const title = targetDeleteLink?.title || "링크";
    triggerToast(`"${title}" 삭제 중입니다...`);
    try {
      await deleteLinkMutation.mutateAsync(linkId);
      triggerToast(`"${title}" 링크가 삭제되었습니다.`);
    } catch (error) {
      console.error("링크 삭제 실패:", error);
      triggerToast("링크 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleteModalOpen(false);
      setTargetDeleteLink(null);
    }
  };

  // 프로필 정보 (별명 Username & 고유 주소 Display Name) 수정 및 users/{userid}/profile 저장 핸들러
  const handleSaveProfile = async (updates: { username: string; displayName: string }) => {
    if (!currentUser) return;
    try {
      await saveProfileMutation.mutateAsync({
        username: updates.username,
        displayName: updates.displayName,
        previousDisplayName: userProfile?.displayName,
      });
      triggerToast("프로필 정보가 성공적으로 변경되었습니다! ✨");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      triggerToast("프로필 수정에 실패했습니다. 다시 시도해주세요.");
      throw error;
    }
  };

  // 프로필 부분 정보 (자기소개 bio) 업데이트 핸들러 (TanStack useMutation)
  const handleUpdateProfile = async (
    updates: Partial<Pick<UserProfile, "bio" | "photoURL" | "name" | "role">>
  ) => {
    if (!currentUser) return;
    try {
      await updateProfileDataMutation.mutateAsync(updates);
      if (typeof updates.bio === "string") {
        if (updates.bio === "") {
          triggerToast("자기소개 말풍선이 삭제되었습니다.");
        } else {
          triggerToast("자기소개 말풍선이 저장되었습니다! ✨");
        }
      } else {
        triggerToast("프로필이 업데이트되었습니다.");
      }
    } catch (error) {
      console.error("프로필 정보 업데이트 실패:", error);
      triggerToast("프로필 업데이트에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 링크 추가 버튼 클릭 트리거 (비로그인 시 로그인 유도)
  const handleTriggerAddLink = () => {
    if (!currentUser) {
      triggerToast("Google 로그인 후 새 링크를 추가할 수 있습니다.");
      handleGoogleLogin();
      return;
    }
    setIsAddLinkOpen(true);
  };

  // 활성(노출) 링크 필터링 (isVisible === true) 및 카테고리 정규화 ("전체" ➔ "일반")
  const visibleLinks = useMemo(() => {
    const active = links.filter((l) => l.isVisible);
    const normalized = active.map((l) => {
      if (l.category?.trim() === "전체") {
        return { ...l, category: "일반" };
      }
      return l;
    });
    return normalized;
  }, [links]);

  // 등록된 카테고리 목록 추출 ("전체" 메타 탭 중복 방지)
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    visibleLinks.forEach((link) => {
      const cat = link.category?.trim();
      if (cat && cat !== "전체") catSet.add(cat);
    });
    return ["전체", ...Array.from(catSet)];
  }, [visibleLinks]);

  // 카테고리별 링크 개수 계산 ("전체"는 총 활성 링크 개수로 유지)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      전체: visibleLinks.length,
    };
    visibleLinks.forEach((link) => {
      const cat = link.category?.trim();
      if (cat && cat !== "전체") {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [visibleLinks]);

  // 선택된 카테고리에 따른 링크 필터링
  const filteredLinks = useMemo(() => {
    if (selectedCategory === "전체") {
      return visibleLinks;
    }
    return visibleLinks.filter((l) => (l.category?.trim() || "") === selectedCategory);
  }, [visibleLinks, selectedCategory]);

  const isAddingLink = addLinkMutation.isPending;

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

          {/* 우측 퀵 액션 영역 */}
          <div className="flex items-center gap-1.5">
            {/* 1. Google 소셜 로그인 / 사용자 정보 & 로그아웃 버튼 */}
            <GoogleAuthButton
              user={currentUser}
              profile={userProfile ?? null}
              isLoading={isAuthLoading || isAuthActionLoading}
              onLogin={handleGoogleLogin}
              onLogout={handleGoogleLogout}
            />

            {/* 2. 내 공개 페이지 바로가기 버튼 (로그인 사용자 전용) */}
            {currentUser && (
              <Link
                href={`/${userProfile?.displayName || (currentUser.email ? currentUser.email.split("@")[0] : currentUser.uid)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2.5 sm:px-3 rounded-full text-xs font-bold text-[#4D6E56] border-[#4D6E56]/40 hover:bg-[#4D6E56]/10 hover:border-[#4D6E56] cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                  title={`내 MyLink 공개 페이지 바로가기 (/${userProfile?.displayName || "내페이지"})`}
                  aria-label="내 공개 페이지 바로가기"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#4D6E56]" />
                  <span className="hidden sm:inline">내 페이지</span>
                </Button>
              </Link>
            )}

            {/* 새로고침 버튼 (로그인 사용자 전용 - TanStack Query refetch) */}
            {currentUser && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleManualRefresh}
                disabled={isLoadingLinks || isAddingLink}
                className="cursor-pointer shadow-xs border-border/70 hover:bg-card active:scale-95 text-[#4D6E56]"
                title="최신 데이터 다시 불러오기 (TanStack Query Refetch)"
                aria-label="최신 데이터 불러오기"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingLinks ? "animate-spin text-muted-foreground" : ""}`}
                />
              </Button>
            )}

            {/* 새 링크 추가 버튼 (로그인 상태일 때 헤더 노출) */}
            {currentUser && (
              <Button
                variant="default"
                size="sm"
                onClick={handleTriggerAddLink}
                disabled={isAddingLink}
                className="bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] h-9 px-3 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all disabled:opacity-60"
                title="새 링크 추가"
              >
                {isAddingLink ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">등록 중...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden sm:inline">링크 추가</span>
                  </>
                )}
              </Button>
            )}

            {/* 링크 공유 버튼 */}
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
          </div>
        </div>

        {/* 새 링크 등록/갱신 진행 프로그레스 바 */}
        {isAddingLink && (
          <div className="w-full h-1 bg-[#4D6E56]/15 overflow-hidden">
            <div className="h-full bg-[#4D6E56] animate-pulse w-full origin-left"></div>
          </div>
        )}
      </header>

      {/* 메인 뷰포트 컨테이너 (모바일 중심 max-w-[540px]) */}
      <main className="max-w-[540px] mx-auto px-4 py-5 space-y-5">
        {/* 로그인 상태별 조건부 화면 분기 */}
        {isAuthLoading ? (
          /* 인증 확인 중 로딩 화면 */
          <div className="bg-card rounded-2xl p-8 text-center border border-border/80 text-muted-foreground text-sm space-y-3">
            <Loader2 className="w-6 h-6 text-[#4D6E56] animate-spin mx-auto" />
            <p className="text-xs">인증 상태를 확인하고 있습니다...</p>
          </div>
        ) : !currentUser ? (
          /* 비로그인 상태: 1. 서비스 안내 -> 2. 프로필 -> 3. 역량 요약 순서 */
          <>
            {/* 1. Mylink 서비스 안내 칸 */}
            <UnauthenticatedHero
              onLogin={handleGoogleLogin}
              isLoading={isAuthActionLoading}
            />

            {/* 2. 프로필 헤더 카드 (사용자 이름 & 아바타 위 말풍선) */}
            <ProfileHeader
              profile={INITIAL_DATA.profile}
              userProfile={userProfile ?? null}
              isLoggedIn={false}
              onSecretTrigger={() => setIsAdminModalOpen(true)}
            />

            {/* 3. 프로필 스킬 & 역량 요약 카드 */}
            <SkillsCard />
          </>
        ) : (
          /* 로그인 상태: 1. 프로필 -> 2. Focus & Skills -> 3. 카테고리/링크 목록 */
          <>
            {/* 1. 프로필 헤더 카드 (로그인 시 구글 유저 정보 연동 및 프로필 정보 수정 지원) */}
            <ProfileHeader
              profile={INITIAL_DATA.profile}
              userProfile={userProfile ?? null}
              isLoggedIn={true}
              onSecretTrigger={() => setIsAdminModalOpen(true)}
              onUpdateProfile={handleUpdateProfile}
              onSaveProfile={handleSaveProfile}
            />

            {/* 2. Focus & Skills 카드 (프로필 바로 밑 배치) */}
            <SkillsCard />

            {/* 3. 카테고리 탭 필터 */}
            <section aria-label="링크 카테고리 필터">
              <CategoryTabs
                categories={categories}
                activeCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                counts={categoryCounts}
              />
            </section>

            {/* 4. 링크 목록 섹션 */}
            <section className="space-y-3" aria-label="링크 카드 목록">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base sm:text-lg font-bold text-[#1E3024] dark:text-[#F4FBF4] flex items-center gap-1.5">
                  <span>{selectedCategory}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    ({filteredLinks.length})
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4D6E56] bg-[#4D6E56]/10 px-2 py-0.5 rounded-full border border-[#4D6E56]/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>최신순</span>
                  </span>
                </h2>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTriggerAddLink}
                  disabled={isAddingLink}
                  className="h-8 px-2.5 text-xs font-bold text-[#4D6E56] border-[#4D6E56]/40 hover:bg-[#4D6E56] hover:text-[#F4FBF4] rounded-lg transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>새 링크 등록</span>
                </Button>
              </div>

              {/* 새 링크 등록/갱신 중일 때 실시간 로딩 카드 */}
              {isAddingLink && (
                <div className="p-4 sm:p-5 rounded-[20px] bg-card border-2 border-dashed border-[#4D6E56]/50 shadow-xs animate-pulse flex items-start gap-3.5 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#4D6E56]/15 text-[#4D6E56] flex items-center justify-center shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#4D6E56] bg-[#4D6E56]/15 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        <span>새 링크 등록 및 갱신 중...</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground truncate">
                      {addingLinkTitle ? `"${addingLinkTitle}" 등록 중...` : "새 링크 등록 중..."}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Firestore(users/{currentUser.uid}/links)에 저장하고 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {isLoadingLinks && filteredLinks.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 text-center border border-border/80 text-muted-foreground text-sm space-y-3">
                  <Loader2 className="w-6 h-6 text-[#4D6E56] animate-spin mx-auto" />
                  <p className="text-xs">나만의 링크를 불러오는 중입니다...</p>
                </div>
              ) : filteredLinks.length === 0 && !isAddingLink ? (
                <div className="bg-card rounded-2xl p-8 text-center border border-border/80 text-muted-foreground text-sm space-y-3">
                  <p>등록된 링크가 아직 없습니다.</p>
                  <Button
                    type="button"
                    onClick={handleTriggerAddLink}
                    className="bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                    첫 번째 링크 추가하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLinks.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onLinkClick={handleLinkClick}
                      onUpdateLink={handleUpdateLink}
                      onDeleteClick={handleOpenDeleteModal}
                      existingCategories={categories}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* 4. 보안 푸터 */}
        <footer className="text-center text-xs text-muted-foreground pt-4 pb-4 space-y-1">
          <p className="font-semibold text-[#1E3024] dark:text-[#F4FBF4]">
            © 2026 {currentUser ? (userProfile?.username || userProfile?.name || "사용자") : INITIAL_DATA.profile.name} • MyLink
          </p>
          <p className="text-[11px] opacity-75">
            Designed for Developers & Creators
          </p>
        </footer>
      </main>

      {/* 우측 하단 플로팅 링크 추가 버튼 (FAB) */}
      <aside aria-label="새 링크 추가 플로팅 버튼" className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
        <button
          type="button"
          onClick={handleTriggerAddLink}
          disabled={isAddingLink}
          className="flex items-center gap-2 px-4 py-3 bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] rounded-full shadow-gs-float transition-all duration-200 active:scale-95 cursor-pointer font-bold text-xs sm:text-sm hover:-translate-y-0.5 border border-[#F4FBF4]/25 disabled:opacity-60 disabled:pointer-events-none"
          title={currentUser ? "새 링크 추가하기" : "로그인 후 링크 추가"}
          aria-label="새 링크 추가하기"
        >
          {isAddingLink ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>등록 중...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{currentUser ? "링크 추가" : "로그인 후 추가"}</span>
            </>
          )}
        </button>
      </aside>

      {/* 새 링크 추가 다이얼로그 */}
      <AddLinkDialog
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        onAddLink={handleAddLink}
        existingCategories={categories}
      />

      {/* 링크 삭제 확인 모달 */}
      <DeleteLinkModal
        isOpen={isDeleteModalOpen}
        link={targetDeleteLink}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTargetDeleteLink(null);
        }}
        onConfirmDelete={handleDeleteLink}
      />

      {/* 시크릿 관리자 인증 모달 */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onOpenAddLink={handleTriggerAddLink}
      />

      {/* Sonner 스타일 중앙 상단 토스트 알림 메시지 */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
