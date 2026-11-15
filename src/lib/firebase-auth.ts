"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string;        // 성명 / 표시 이름
  username?: string;    // 고유 Display Name (Username)
  email: string;
  photoURL?: string;
  role?: string;
  statusBadge?: string;
  bio?: string;
  lastLoginAt: string;
  createdAt?: string;
  updatedAt?: string;
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
  const emailDisplayName = getEmailDisplayName(user.email, user.displayName || "user");

  // users/{uid}/profile 서브컬렉션 문서도 확인
  const subProfileRef = doc(db, "users", user.uid, "profile", "info");
  const subProfileSnap = await getDoc(subProfileRef);
  const subData = subProfileSnap.exists() ? subProfileSnap.data() : null;

  let profile: UserProfile;

  if (userSnapshot.exists() || subData) {
    const data = userSnapshot.exists() ? userSnapshot.data() : {};
    const finalUsername = subData?.username || data.username || emailDisplayName;
    const finalName = subData?.name || data.name || user.displayName || "사용자 이름";

    profile = {
      uid: user.uid,
      name: finalName,
      username: finalUsername,
      email: data.email || user.email || "",
      // 구글 계정 프로필 사진으로 항상 통일 및 최신 동기화
      photoURL: user.photoURL || data.photoURL || "",
      role: subData?.role || data.role || "MyLink 크리에이터",
      statusBadge: subData?.statusBadge || data.statusBadge || "온라인",
      bio: subData?.bio || data.bio || "환영합니다! 나만의 링크를 자유롭게 공유하고 관리해보세요.",
      lastLoginAt: now,
      createdAt: data.createdAt || now,
      updatedAt: subData?.updatedAt || data.updatedAt,
    };

    await setDoc(
      userDocRef,
      {
        lastLoginAt: now,
        name: profile.name,
        username: profile.username,
        email: profile.email,
        photoURL: profile.photoURL,
      },
      { merge: true }
    );

    // 기본 username 레지스트리 확보
    try {
      await setDoc(
        doc(db, "usernames", profile.username!.toLowerCase()),
        { uid: user.uid, username: profile.username, updatedAt: now },
        { merge: true }
      );
    } catch (e) {
      console.warn("기본 username 등록 예외:", e);
    }
  } else {
    profile = {
      uid: user.uid,
      name: user.displayName || "사용자 이름",
      username: emailDisplayName,
      email: user.email || "",
      photoURL: user.photoURL || "",
      role: "MyLink 크리에이터",
      statusBadge: "온라인",
      bio: "환영합니다! 나만의 링크를 자유롭게 공유하고 관리해보세요.",
      lastLoginAt: now,
      createdAt: now,
    };

    await setDoc(userDocRef, profile, { merge: true });

    // users/{uid}/profile 서브 경로에도 초기 저장
    await setDoc(subProfileRef, {
      username: profile.username,
      name: profile.name,
      updatedAt: now,
    }, { merge: true });

    try {
      await setDoc(
        doc(db, "usernames", profile.username!.toLowerCase()),
        { uid: user.uid, username: profile.username, updatedAt: now },
        { merge: true }
      );
    } catch (e) {
      console.warn("초기 username 등록 예외:", e);
    }
  }

  return profile;
}

/**
 * Firestore users/{uid}/profile 및 users/{uid} 문서 조회
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    // 1. users/{uid}/profile/info 우선 확인 (사용자 지정 경로)
    const subProfileRef = doc(db, "users", uid, "profile", "info");
    const subProfileSnap = await getDoc(subProfileRef);
    const subData = subProfileSnap.exists() ? subProfileSnap.data() : null;

    // 2. users/{uid} 메인 문서 확인
    const userDocRef = doc(db, "users", uid);
    const mainSnap = await getDoc(userDocRef);

    if (!mainSnap.exists() && !subData) {
      return null;
    }

    const mainData = mainSnap.exists() ? mainSnap.data() : {};
    const emailDisplayName = getEmailDisplayName(mainData.email, "사용자");

    return {
      uid,
      name: subData?.name || mainData.name || "사용자 이름",
      username: subData?.username || mainData.username || emailDisplayName,
      email: mainData.email || "",
      photoURL: mainData.photoURL || "",
      role: subData?.role || mainData.role || "MyLink 크리에이터",
      statusBadge: subData?.statusBadge || mainData.statusBadge || "온라인",
      bio: subData?.bio || mainData.bio || "환영합니다! 나만의 링크를 자유롭게 공유하고 관리해보세요.",
      lastLoginAt: mainData.lastLoginAt || new Date().toISOString(),
      createdAt: mainData.createdAt,
      updatedAt: subData?.updatedAt || mainData.updatedAt,
    };
  } catch (error) {
    console.warn("Firestore users/{uid} 프로필 조회 실패:", error);
    return null;
  }
}

/**
 * Username (Display Name) 중복 확인 함수
 * - 영문, 숫자, 특수문자(-, _, .) 2~20자 유효성 검사
 * - Firestore usernames/{username} 고유 문서 조회
 */
export async function checkUsernameAvailability(
  username: string,
  currentUid?: string
): Promise<{ available: boolean; message: string }> {
  const trimmed = username.trim();
  
  if (!trimmed) {
    return { available: false, message: "Username을 입력해주세요." };
  }
  if (trimmed.length < 2) {
    return { available: false, message: "최소 2자 이상 입력해주세요." };
  }
  if (trimmed.length > 20) {
    return { available: false, message: "최대 20자 이하로 입력해주세요." };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return {
      available: false,
      message: "영문, 숫자, 밑줄(_), 하이픈(-), 마침표(.)만 사용 가능합니다.",
    };
  }

  try {
    const key = trimmed.toLowerCase();
    const usernameDocRef = doc(db, "usernames", key);
    const snap = await getDoc(usernameDocRef);

    if (snap.exists()) {
      const data = snap.data();
      if (currentUid && data.uid === currentUid) {
        return { available: true, message: "현재 사용 중인 본인의 Username입니다." };
      }
      return { available: false, message: "이미 다른 사용자가 사용 중인 Username입니다." };
    }

    return { available: true, message: "사용 가능한 Display Name(Username)입니다! 🎉" };
  } catch (error) {
    console.error("Username 중복 검사 실패:", error);
    return { available: false, message: "중복 확인 중 네트워크 오류가 발생했습니다." };
  }
}

/**
 * 사용자 프로필 (Username, 이름) 저장 함수
 * - users/{userid}/profile 및 users/{userid}에 업데이트
 * - usernames 컬렉션 고유 인덱스 갱신
 */
export async function saveUserProfile(
  uid: string,
  updates: {
    username: string;
    name: string;
  },
  previousUsername?: string
): Promise<void> {
  const now = new Date().toISOString();
  const cleanUsername = updates.username.trim();
  const cleanName = updates.name.trim();

  // 1. users/{uid}/profile/info 서브컬렉션 문서 업데이트 (사용자 요청: users/{userid}/profile)
  const subProfileRef = doc(db, "users", uid, "profile", "info");
  await setDoc(
    subProfileRef,
    {
      username: cleanUsername,
      name: cleanName,
      updatedAt: now,
    },
    { merge: true }
  );

  // 2. users/{uid} 메인 유저 문서 동기화
  const userDocRef = doc(db, "users", uid);
  await setDoc(
    userDocRef,
    {
      username: cleanUsername,
      name: cleanName,
      updatedAt: now,
    },
    { merge: true }
  );

  // 3. usernames 고유 레지스트리 갱신
  if (previousUsername && previousUsername.toLowerCase() !== cleanUsername.toLowerCase()) {
    try {
      await deleteDoc(doc(db, "usernames", previousUsername.toLowerCase()));
    } catch {
      // 이전 키 삭제 실패 무시
    }
  }

  await setDoc(
    doc(db, "usernames", cleanUsername.toLowerCase()),
    {
      uid,
      username: cleanUsername,
      updatedAt: now,
    },
    { merge: true }
  );
}

/**
 * Firestore users/{uid} 문서의 프로필 정보(bio, role 등) 부분 업데이트
 */
export async function updateUserProfileData(
  uid: string,
  updates: Partial<Pick<UserProfile, "bio" | "photoURL" | "name" | "role" | "statusBadge">>
): Promise<void> {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, updates, { merge: true });

  // users/{uid}/profile/info 에도 동기화
  const subProfileRef = doc(db, "users", uid, "profile", "info");
  await setDoc(subProfileRef, updates, { merge: true });
}

/**
 * displayName (Username 또는 이름)으로 유저 프로필 조회
 * 1. usernames/{username} 고유 문서 조회
 * 2. users 컬렉션에서 username == displayName 조회
 * 3. users 컬렉션에서 name == displayName 조회
 * 4. uid 자체로 직접 일치 조회
 */
export async function getUserByDisplayName(displayName: string): Promise<UserProfile | null> {
  const clean = decodeURIComponent(displayName).trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();

  try {
    // 1. usernames 레지스트리 조회
    const usernameDoc = await getDoc(doc(db, "usernames", lower));
    if (usernameDoc.exists()) {
      const { uid } = usernameDoc.data();
      if (uid) {
        return await getUserProfile(uid);
      }
    }

    // 2. users 컬렉션에서 username 필드 매칭
    const usersCol = collection(db, "users");
    const qUsername = query(usersCol, where("username", "==", clean), limit(1));
    const snapUsername = await getDocs(qUsername);
    if (!snapUsername.empty) {
      const userDoc = snapUsername.docs[0];
      return await getUserProfile(userDoc.id);
    }

    // 3. users 컬렉션에서 name 필드 매칭
    const qName = query(usersCol, where("name", "==", clean), limit(1));
    const snapName = await getDocs(qName);
    if (!snapName.empty) {
      const userDoc = snapName.docs[0];
      return await getUserProfile(userDoc.id);
    }

    // 4. uid 자체로 직접 일치하는 경우
    const directUser = await getUserProfile(clean);
    if (directUser) {
      return directUser;
    }

    return null;
  } catch (error) {
    console.error("유저 검색 실패:", error);
    return null;
  }
}
