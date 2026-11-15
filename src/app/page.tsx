"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Share2, Check, Mail, Plus, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { type User } from "firebase/auth";
import { MyLinkData, LinkItem } from "@/types/mylink";
import { INITIAL_DATA } from "@/lib/constants";
import { getStoredData, saveStoredData, incrementLinkClick, addStoredLink, updateStoredLink, deleteStoredLink } from "@/lib/storage";
import {
  addFirebaseLink,
  getFirebaseLinks,
  subscribeToFirebaseLinks,
  incrementFirebaseLinkClick,
  updateFirebaseLink,
  deleteFirebaseLink,
  sortByCreatedAtDesc,
} from "@/lib/firebase-links";
import {
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  getUserProfile,
  updateUserProfileData,
  type UserProfile,
} from "@/lib/firebase-auth";
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
  const [data, setData] = useState<MyLinkData>(INITIAL_DATA);
  const [, setIsLoaded] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState<boolean>(true);
  const [isAddingLink, setIsAddingLink] = useState<boolean>(false);
  const [addingLinkTitle, setAddingLinkTitle] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState<boolean>(false);
  const [targetDeleteLink, setTargetDeleteLink] = useState<LinkItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Firebase Auth 사용자 상태 및 프로필 정보
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthActionLoading, setIsAuthActionLoading] = useState<boolean>(false);

  // 활성 사용자 ID (로그인 시 user.uid, 비로그인 시 anonymous)
  const activeUserId = currentUser ? currentUser.uid : "anonymous";

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

  // 1. Firebase Auth 실시간 인증 상태 감시
  useEffect(() => {
    let isMounted = true;
    setIsAuthLoading(true);

    const unsubscribe = subscribeToAuth(async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);

      if (user) {
        // users/{user.uid} 프로필 정보 로드
        try {
          const profile = await getUserProfile(user.uid);
          if (isMounted) setUserProfile(profile);
        } catch (error) {
          console.warn("프로필 조회 예외:", error);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Firestore (users/{user.uid}/links)에서 링크 불러오기
  const fetchLinksFromFirestore = useCallback(async (isSilent = false, targetUid?: string) => {
    const uid = targetUid || (currentUser ? currentUser.uid : "anonymous");
    try {
      if (!isSilent) setIsLoadingLinks(true);
      const firebaseLinks = await getFirebaseLinks(uid);

      setData((prev) => {
        // Firestore 링크 우선 반영
        const nonFirebaseLinks = prev.links.filter(
          (localLink) => !firebaseLinks.some((fbLink) => fbLink.id === localLink.id)
        );
        const merged = sortByCreatedAtDesc([...firebaseLinks, ...nonFirebaseLinks]);
        const updatedData: MyLinkData = {
          ...prev,
          links: merged,
        };
        saveStoredData(updatedData);
        return updatedData;
      });
    } catch (error) {
      console.warn("Firestore 링크 로드 실패 (로컬 캐시 유지):", error);
    } finally {
      setIsLoadingLinks(false);
    }
  }, [currentUser]);

  // 2. 로그인 상태 변화 시 Firestore (users/{user.uid}/links) 실시간 구독 연동
  useEffect(() => {
    let isMounted = true;
    const uid = currentUser ? currentUser.uid : null;

    // 비로그인 상태일 때는 Firestore 구독 중단
    if (!uid) {
      setIsLoadingLinks(false);
      return;
    }

    setIsLoadingLinks(true);

    // 2-1. 초기 1회 로드
    getFirebaseLinks(uid)
      .then((firebaseLinks) => {
        if (!isMounted) return;
        setData((prev) => {
          const merged = sortByCreatedAtDesc(firebaseLinks);
          const updatedData: MyLinkData = {
            ...prev,
            links: merged,
          };
          saveStoredData(updatedData);
          return updatedData;
        });
      })
      .catch((err) => {
        console.warn("사용자 링크 로드 실패:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingLinks(false);
      });

    // 2-2. Firestore users/{uid}/links 실시간 구독
    const unsubscribeLinks = subscribeToFirebaseLinks(
      uid,
      (firebaseLinks) => {
        if (!isMounted) return;
        setData((prev) => {
          const merged = sortByCreatedAtDesc(firebaseLinks);
          const updatedData: MyLinkData = {
            ...prev,
            links: merged,
          };
          saveStoredData(updatedData);
          return updatedData;
        });
        setIsLoadingLinks(false);
      },
      (error) => {
        console.warn("사용자 링크 실시간 구독 안내:", error);
      }
    );

    return () => {
      isMounted = false;
      unsubscribeLinks();
    };
  }, [currentUser]);

  // 3. 클라이언트 마운트 시 기본 캐시 로드
  useEffect(() => {
    const stored = getStoredData();
    const sortedStored: MyLinkData = {
      ...stored,
      links: sortByCreatedAtDesc(stored.links || []),
    };
    setData(sortedStored);
    setIsLoaded(true);
  }, []);

  // 4. 단축키(Ctrl+Shift+A / Cmd+Shift+A) 리스너로 히든 관리자 모달 호출
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
      setUserProfile(profile);
      const loginDisplayName = profile.name || (user.email ? user.email.split("@")[0] : user.displayName) || "사용자";
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
      setUserProfile(null);
      // 로그아웃 시 캐시된 링크 초기화
      setData(INITIAL_DATA);
      triggerToast("로그아웃되었습니다.");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      triggerToast("로그아웃에 실패했습니다.");
    } finally {
      setIsAuthActionLoading(false);
    }
  };

  // 프로필 정보(자기소개 말풍선, 프로필 사진 등) 업데이트 핸들러
  const handleUpdateProfile = async (
    updates: Partial<Pick<UserProfile, "bio" | "photoURL" | "name" | "role">>
  ) => {
    if (!currentUser) return;
    try {
      await updateUserProfileData(currentUser.uid, updates);
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));

      // 변경 항목별 알림 메시지
      if (typeof updates.bio === "string") {
        if (updates.bio === "") {
          triggerToast("자기소개 말풍선이 삭제되었습니다.");
        } else {
          triggerToast("자기소개 말풍선이 저장되었습니다! ✨");
        }
      } else if (typeof updates.photoURL === "string") {
        if (updates.photoURL === "") {
          triggerToast("프로필 사진이 기본 이미지로 초기화되었습니다.");
        } else {
          triggerToast("프로필 사진이 성공적으로 변경되었습니다! 📷");
        }
      } else {
        triggerToast("프로필이 업데이트되었습니다.");
      }
    } catch (error) {
      console.error("프로필 정보 업데이트 실패:", error);
      triggerToast("프로필 업데이트에 실패했습니다. 다시 시도해주세요.");
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

  // 수동 새로고침 핸들러
  const handleManualRefresh = async () => {
    if (!currentUser) {
      triggerToast("로그인 후 실시간 링크를 새로고침할 수 있습니다.");
      return;
    }
    triggerToast("Firestore에서 최신 링크 목록을 불러오는 중...");
    await fetchLinksFromFirestore(false, currentUser.uid);
    triggerToast("최신 링크 목록을 불러왔습니다!");
  };

  // 링크 카드 클릭 시 클릭 수 증가 처리 (users/{user.uid}/links/{id})
  const handleLinkClick = (clickedLink: LinkItem) => {
    const updatedLinks = incrementLinkClick(clickedLink.id);
    setData((prev) => ({
      ...prev,
      links: sortByCreatedAtDesc(updatedLinks),
      analytics: {
        ...prev.analytics,
        totalClicks: (prev.analytics?.totalClicks || 0) + 1,
      },
    }));

    // Firebase Firestore 클릭 수 비동기 동기화
    incrementFirebaseLinkClick(activeUserId, clickedLink.id);
  };

  // 새 링크 추가 핸들러 (users/{user.uid}/links 에 저장)
  const handleAddLink = async (
    newLinkInput: Omit<LinkItem, "id" | "clickCount" | "createdAt" | "updatedAt" | "order">
  ) => {
    if (!currentUser) {
      triggerToast("Google 로그인 후 새 링크를 추가할 수 있습니다.");
      handleGoogleLogin();
      return;
    }

    setIsAddingLink(true);
    setAddingLinkTitle(newLinkInput.title.trim());
    triggerToast(`"${newLinkInput.title.trim()}" 링크를 등록하는 중입니다...`);

    try {
      // 1. Firebase Firestore (users/{user.uid}/links)에 저장
      const newLink = await addFirebaseLink(currentUser.uid, newLinkInput);

      // 2. React 상태 업데이트 및 로컬 스토리지 캐시 동기화
      setData((prev) => {
        const exists = prev.links.some((l) => l.id === newLink.id);
        const updatedLinks = exists
          ? prev.links
          : sortByCreatedAtDesc([newLink, ...prev.links]);
        const updatedData: MyLinkData = {
          ...prev,
          links: updatedLinks,
        };
        saveStoredData(updatedData);
        return updatedData;
      });

      if (selectedCategory !== "전체" && selectedCategory !== newLink.category) {
        setSelectedCategory("전체");
      }

      triggerToast(`"${newLink.title}" 링크가 등록되었습니다! 🎉`);
    } catch (error) {
      console.error("Firebase 저장 실패:", error);
      const { updatedData, newLink } = addStoredLink(newLinkInput);
      setData({
        ...updatedData,
        links: sortByCreatedAtDesc(updatedData.links),
      });
      triggerToast(`"${newLink.title}" 링크가 로컬 저장소에 저장되었습니다.`);
    } finally {
      setIsAddingLink(false);
      setAddingLinkTitle("");
    }
  };

  // 링크 수정 핸들러 (users/{user.uid}/links/{id})
  const handleUpdateLink = async (
    linkId: string,
    updates: Partial<Omit<LinkItem, "id" | "clickCount" | "createdAt">>
  ) => {
    triggerToast("링크 수정 사항을 저장하는 중입니다...");
    try {
      // 1. Firebase Firestore (users/{user.uid}/links/{id}) 업데이트
      await updateFirebaseLink(activeUserId, linkId, updates);

      // 2. React 상태 업데이트 및 로컬 스토리지 캐시 동기화
      setData((prev) => {
        const updatedLinks = prev.links.map((link) =>
          link.id === linkId
            ? {
                ...link,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : link
        );
        const updatedData: MyLinkData = {
          ...prev,
          links: sortByCreatedAtDesc(updatedLinks),
        };
        saveStoredData(updatedData);
        return updatedData;
      });

      triggerToast("링크가 성공적으로 수정되었습니다! ✨");
    } catch (error) {
      console.error("Firebase 수정 실패:", error);
      const updatedData = updateStoredLink(linkId, updates);
      setData({
        ...updatedData,
        links: sortByCreatedAtDesc(updatedData.links),
      });
      triggerToast("로컬 저장소에 수정 사항이 반영되었습니다.");
    }
  };

  // 링크 삭제 모달 열기 핸들러
  const handleOpenDeleteModal = (link: LinkItem) => {
    setTargetDeleteLink(link);
    setIsDeleteModalOpen(true);
  };

  // 링크 삭제 확정 핸들러 (users/{user.uid}/links/{id})
  const handleDeleteLink = async (linkId: string) => {
    const title = targetDeleteLink?.title || "링크";
    triggerToast(`"${title}" 삭제 중입니다...`);
    try {
      // 1. Firebase Firestore (users/{user.uid}/links/{id}) 삭제
      await deleteFirebaseLink(activeUserId, linkId);

      // 2. React 상태 업데이트 및 로컬 스토리지 캐시 동기화
      setData((prev) => {
        const updatedLinks = prev.links.filter((l) => l.id !== linkId);
        const updatedData: MyLinkData = {
          ...prev,
          links: updatedLinks,
        };
        saveStoredData(updatedData);
        return updatedData;
      });

      triggerToast(`"${title}" 링크가 삭제되었습니다.`);
    } catch (error) {
      console.error("Firebase 삭제 실패:", error);
      const updatedData = deleteStoredLink(linkId);
      setData({
        ...updatedData,
        links: sortByCreatedAtDesc(updatedData.links),
      });
      triggerToast(`로컬 저장소에서 "${title}" 링크가 삭제되었습니다.`);
    } finally {
      setIsDeleteModalOpen(false);
      setTargetDeleteLink(null);
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
    const active = data.links.filter((l) => l.isVisible);
    const normalized = active.map((l) => {
      if (l.category?.trim() === "전체") {
        return { ...l, category: "일반" };
      }
      return l;
    });
    return sortByCreatedAtDesc(normalized);
  }, [data.links]);

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

          {/* 우측 퀵 액션 영역 */}
          <div className="flex items-center gap-1.5">
            {/* 1. Google 소셜 로그인 / 사용자 정보 & 로그아웃 버튼 */}
            <GoogleAuthButton
              user={currentUser}
              profile={userProfile}
              isLoading={isAuthLoading || isAuthActionLoading}
              onLogin={handleGoogleLogin}
              onLogout={handleGoogleLogout}
            />

            {/* 새로고침 버튼 (로그인 사용자 전용) */}
            {currentUser && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleManualRefresh}
                disabled={isLoadingLinks || isAddingLink}
                className="cursor-pointer shadow-xs border-border/70 hover:bg-card active:scale-95 text-[#4D6E56]"
                title="Firestore 최신 링크 다시 불러오기"
                aria-label="최신 링크 불러오기"
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
              profile={data.profile}
              userProfile={userProfile}
              isLoggedIn={false}
              onSecretTrigger={() => setIsAdminModalOpen(true)}
            />

            {/* 3. 프로필 스킬 & 역량 요약 카드 */}
            <SkillsCard />
          </>
        ) : (
          /* 로그인 상태: 1. 프로필 -> 2. Focus & Skills -> 3. 카테고리/링크 목록 */
          <>
            {/* 1. 프로필 헤더 카드 (로그인 시 구글 유저 정보 연동 및 사진/말풍선 수정·삭제 지원) */}
            <ProfileHeader
              profile={data.profile}
              userProfile={userProfile}
              isLoggedIn={true}
              onSecretTrigger={() => setIsAdminModalOpen(true)}
              onUpdateProfile={handleUpdateProfile}
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
            © 2026 {currentUser ? (userProfile?.email?.split("@")[0] || userProfile?.name || "사용자") : data.profile.name} • MyLink
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

