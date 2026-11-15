"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: string;
  statusBadge?: string;
  bio?: string;
  lastLoginAt: string;
  createdAt?: string;
}

const googleProvider = new GoogleAuthProvider();
// 매번 계정 선택 창이 뜨도록 설정 (편리한 다중 계정 전환 지원)
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Google 팝업 소셜 로그인 실행 및 Firestore users/{uid} 문서 동기화
 */
export async function loginWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const profile = await syncUserProfile(user);
  return { user, profile };
}

/**
 * 로그아웃 실행
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Firebase Auth 인증 상태 실시간 구독
 */
export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * 이메일 주소에서 @ 앞부분을 추출하여 display name으로 반환
 */
export function getEmailDisplayName(email?: string | null, fallback = "사용자"): string {
  if (!email) return fallback;
  const prefix = email.split("@")[0]?.trim();
  return prefix || fallback;
}

/**
 * Google 로그인 성공 시 Firestore users/{user.uid} 문서에 유저 정보 동기화
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userDocRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userDocRef);
  const now = new Date().toISOString();
  const emailDisplayName = getEmailDisplayName(user.email, user.displayName || "MyLink 사용자");

  let profile: UserProfile;

  if (userSnapshot.exists()) {
    const data = userSnapshot.data();
    profile = {
      uid: user.uid,
      name: emailDisplayName,
      email: data.email || user.email || "",
      // 구글 계정 프로필 사진으로 항상 통일 및 최신 동기화
      photoURL: user.photoURL || data.photoURL || "",
      role: data.role || "MyLink 크리에이터",
      statusBadge: data.statusBadge || "온라인",
      bio: data.bio || "환영합니다! 나만의 링크를 자유롭게 공유하고 관리해보세요.",
      lastLoginAt: now,
      createdAt: data.createdAt || now,
    };

    await setDoc(
      userDocRef,
      {
        lastLoginAt: now,
        // display name은 이메일 앞부분으로 동기화, 사진은 구글 프로필로 동기화
        name: profile.name,
        email: profile.email,
        photoURL: profile.photoURL,
      },
      { merge: true }
    );
  } else {
    profile = {
      uid: user.uid,
      name: emailDisplayName,
      email: user.email || "",
      photoURL: user.photoURL || "",
      role: "MyLink 크리에이터",
      statusBadge: "온라인",
      bio: "환영합니다! 나만의 링크를 자유롭게 공유하고 관리해보세요.",
      lastLoginAt: now,
      createdAt: now,
    };

    await setDoc(userDocRef, profile, { merge: true });
  }

  return profile;
}

/**
 * Firestore users/{uid} 문서 조회
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", uid);
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn("Firestore users/{uid} 조회 실패:", error);
    return null;
  }
}

/**
 * Firestore users/{uid} 문서의 프로필 정보(bio, photoURL 등) 부분 업데이트
 */
export async function updateUserProfileData(
  uid: string,
  updates: Partial<Pick<UserProfile, "bio" | "photoURL" | "name" | "role" | "statusBadge">>
): Promise<void> {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, updates, { merge: true });
}
