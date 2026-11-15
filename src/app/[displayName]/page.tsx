"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserByDisplayName } from "@/lib/firebase-auth";
import { getFirebaseLinks } from "@/lib/firebase-links";
import { UserPublicView } from "@/components/user-public-view";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{
    displayName: string;
  }>;
}

export default function UserProfilePage({ params }: PageProps) {
  // Next.js 15: React.use()로 비동기 params 언래핑
  const resolvedParams = use(params);
  const rawDisplayName = resolvedParams?.displayName || "";
  const decodedDisplayName = decodeURIComponent(rawDisplayName).trim();

  // 1. displayName으로 유저 검색 (TanStack Query 캐싱 적용)
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
    queryKey: ["public-user", decodedDisplayName.toLowerCase()],
    queryFn: async () => {
      if (!decodedDisplayName) return null;
      return await getUserByDisplayName(decodedDisplayName);
    },
    enabled: !!decodedDisplayName,
    staleTime: 1000 * 60 * 3, // 3분 캐싱
  });

  // 2. 유저의 uid로 links 목록 조회 (users/{userId}/links)
  const {
    data: links = [],
    isLoading: isLinksLoading,
  } = useQuery({
    queryKey: ["public-user-links", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      return await getFirebaseLinks(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 2,
  });

  // 로딩 상태 처리
  if (isUserLoading || (user && isLinksLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#4D6E56]/15 text-[#4D6E56] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
          @{decodedDisplayName} 프로필 불러오는 중...
        </p>
      </div>
    );
  }

  // 검색 결과 유저가 존재하지 않으면 404 페이지 렌더링
  if (!isUserLoading && (!user || isUserError)) {
    notFound();
  }

  if (!user) return null;

  // 3. 유저가 존재하면 공개 전용 뷰 렌더링
  return <UserPublicView initialUser={user} initialLinks={links} />;
}
