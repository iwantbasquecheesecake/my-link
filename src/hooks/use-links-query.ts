"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinkItem } from "@/types/mylink";
import { INITIAL_DATA } from "@/lib/constants";
import {
  getStoredData,
  saveStoredData,
  addStoredLink,
  updateStoredLink,
  deleteStoredLink,
  incrementLinkClick as incrementStoredClick,
} from "@/lib/storage";
import {
  getFirebaseLinks,
  addFirebaseLink,
  updateFirebaseLink,
  deleteFirebaseLink,
  incrementFirebaseLinkClick,
  subscribeToFirebaseLinks,
  sortByCreatedAtDesc,
} from "@/lib/firebase-links";

export const LINKS_QUERY_KEY = (uid?: string | null) => ["links", uid || "guest"];

/**
 * 사용자 링크 목록 조회 쿼리 (TanStack Query + Firestore 실시간 동기화)
 */
export function useLinksQuery(uid?: string | null) {
  const queryClient = useQueryClient();

  // 1. TanStack Query를 통한 비동기 링크 데이터 페칭
  const query = useQuery<LinkItem[]>({
    queryKey: LINKS_QUERY_KEY(uid),
    queryFn: async () => {
      if (uid) {
        const firebaseLinks = await getFirebaseLinks(uid);
        const sorted = sortByCreatedAtDesc(firebaseLinks);
        // 로컬 캐시도 함께 동기화
        saveStoredData({ ...INITIAL_DATA, links: sorted });
        return sorted;
      } else {
        const stored = getStoredData();
        return sortByCreatedAtDesc(stored.links || INITIAL_DATA.links);
      }
    },
    staleTime: 1000 * 60 * 3, // 3분간 캐시 유지
  });

  // 2. 로그인 상태일 때 Firestore 실시간 웹소켓 구독 (onSnapshot ➔ Query 캐시 즉시 업데이트)
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = subscribeToFirebaseLinks(
      uid,
      (firebaseLinks) => {
        const sorted = sortByCreatedAtDesc(firebaseLinks);
        // Firestore의 변경 사항을 TanStack Query 캐시에 실시간 주입
        queryClient.setQueryData(LINKS_QUERY_KEY(uid), sorted);
        saveStoredData({ ...INITIAL_DATA, links: sorted });
      },
      (error) => {
        console.warn("Firestore 실시간 링크 구독 안내:", error);
      }
    );

    return () => unsubscribe();
  }, [uid, queryClient]);

  return query;
}

/**
 * 새 링크 추가 뮤테이션 (TanStack useMutation)
 */
export function useAddLinkMutation(uid?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newLinkInput: Omit<LinkItem, "id" | "clickCount" | "createdAt" | "updatedAt" | "order">
    ) => {
      if (uid) {
        return await addFirebaseLink(uid, newLinkInput);
      } else {
        const updated = addStoredLink(newLinkInput);
        return updated.newLink;
      }
    },
    onSuccess: () => {
      // 링크 캐시 무효화 및 자동 최신화
      queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY(uid) });
    },
  });
}

/**
 * 링크 수정 뮤테이션 (TanStack useMutation)
 */
export function useUpdateLinkMutation(uid?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      linkId,
      updates,
    }: {
      linkId: string;
      updates: Partial<Omit<LinkItem, "id" | "clickCount" | "createdAt">>;
    }) => {
      if (uid) {
        return await updateFirebaseLink(uid, linkId, updates);
      } else {
        const updated = updateStoredLink(linkId, updates);
        return updated.links.find((l) => l.id === linkId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY(uid) });
    },
  });
}

/**
 * 링크 삭제 뮤테이션 (TanStack useMutation)
 */
export function useDeleteLinkMutation(uid?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      if (uid) {
        return await deleteFirebaseLink(uid, linkId);
      } else {
        deleteStoredLink(linkId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY(uid) });
    },
  });
}

/**
 * 링크 클릭 카운트 증가 뮤테이션 (낙관적 업데이트 적용)
 */
export function useIncrementClickMutation(uid?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      if (uid) {
        await incrementFirebaseLinkClick(uid, linkId);
      } else {
        incrementStoredClick(linkId);
      }
    },
    // 낙관적 업데이트: 서버 응답 전 캐시에서 즉시 클릭 수 +1
    onMutate: async (linkId: string) => {
      const key = LINKS_QUERY_KEY(uid);
      await queryClient.cancelQueries({ queryKey: key });
      const previousLinks = queryClient.getQueryData<LinkItem[]>(key);

      if (previousLinks) {
        queryClient.setQueryData<LinkItem[]>(
          key,
          previousLinks.map((link) =>
            link.id === linkId ? { ...link, clickCount: link.clickCount + 1 } : link
          )
        );
      }

      return { previousLinks };
    },
    onError: (_err, _linkId, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(LINKS_QUERY_KEY(uid), context.previousLinks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_QUERY_KEY(uid) });
    },
  });
}
