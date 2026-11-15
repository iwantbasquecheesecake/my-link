"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  saveUserProfile,
  updateUserProfileData,
  UserProfile,
} from "@/lib/firebase-auth";

export const PROFILE_QUERY_KEY = (uid?: string | null) => ["profile", uid];

/**
 * 사용자 프로필 정보 조회 쿼리 (TanStack useQuery)
 */
export function useProfileQuery(uid?: string | null) {
  return useQuery<UserProfile | null>({
    queryKey: PROFILE_QUERY_KEY(uid),
    queryFn: async () => {
      if (!uid) return null;
      return await getUserProfile(uid);
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 프로필 (Username, 이름) 수정 및 users/{userid}/profile 저장 뮤테이션
 */
export function useSaveProfileMutation(uid?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      name,
      previousUsername,
    }: {
      username: string;
      name: string;
      previousUsername?: string;
    }) => {
      if (!uid) throw new Error("로그인이 필요합니다.");
      await saveUserProfile(uid, { username, name }, previousUsername);
      return { username, name };
    },
    onSuccess: (updated) => {
      // 프로필 캐시 즉시 업데이트
      queryClient.setQueryData<UserProfile | null>(
        PROFILE_QUERY_KEY(uid),
        (prev) => (prev ? { ...prev, ...updated } : null)
      );
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY(uid) });
    },
  });
}

/**
 * 프로필 부분 데이터 (자기소개 bio 등) 업데이트 뮤테이션
 */
export function useUpdateProfileDataMutation(uid?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<Pick<UserProfile, "bio" | "photoURL" | "name" | "role" | "statusBadge">>
    ) => {
      if (!uid) throw new Error("로그인이 필요합니다.");
      await updateUserProfileData(uid, updates);
      return updates;
    },
    onSuccess: (updates) => {
      queryClient.setQueryData<UserProfile | null>(
        PROFILE_QUERY_KEY(uid),
        (prev) => (prev ? { ...prev, ...updates } : null)
      );
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY(uid) });
    },
  });
}
