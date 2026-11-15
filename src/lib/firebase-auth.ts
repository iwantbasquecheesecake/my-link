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
  displayName: string;  // 고유 식별자 / URL 슬러그 (가입 시 이메일 앞부분으로 자동 할당, 변경 불가)
  username: string;     // 사용자 변경 가능한 별명 (닉네임)
  name?: string;        // 기존 호환성 유지 필드 (username과 동일)
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
 * - displayName: 가입 시 이메일 주소 앞부분으로 자동 할당 (동적 라우팅 /[displayName] 고유 주소)
 * - username: 사용자가 언제든 변경할 수 있는 별명(닉네임)
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userDocRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userDocRef);
  const now = new Date().toISOString();
  
  // 1. 이메일 앞부분 추출 -> displayName (고유 주소 ID)
  const defaultDisplayName = getEmailDisplayName(user.email, user.uid);

  // users/{uid}/profile 서브컬렉션 문서도 확인
  const subProfileRef = doc(db, "users", user.uid, "profile", "info");
  const subProfileSnap = await getDoc(subProfileRef);
  const subData = subProfileSnap.exists() ? subProfileSnap.data() : null;

  let profile: UserProfile;

  if (userSnapshot.exists() || subData) {
    const data = userSnapshot.exists() ? userSnapshot.data() : {};
    
    // displayName은 가입 시 이메일 앞부분(고정)
    const finalDisplayName = data.displayName || subData?.displayName || defaultDisplayName;
    
    // username은 사용자가 변경 가능한 별명 (기존 저장된 별명 유지, 없으면 사용자 이름 또는 이메일 앞부분)
    const finalUsername =
      subData?.username || data.username || data.name || user.displayName || defaultDisplayName;

    profile = {
      uid: user.uid,
      displayName: finalDisplayName,
      username: finalUsername,
      name: finalUsername,
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
        displayName: profile.displayName,
        username: profile.username,
        name: profile.username,
        email: profile.email,
        photoURL: profile.photoURL,
      },
      { merge: true }
    );

    // users/{uid}/profile/info 에도 동기화
    await setDoc(
      subProfileRef,
      {
        displayName: profile.displayName,
        username: profile.username,
        name: profile.username,
        updatedAt: now,
      },
      { merge: true }
    );

    // displayNames 및 usernames 고유 라우팅 레지스트리 확보
    try {
      await setDoc(
        doc(db, "displayNames", profile.displayName.toLowerCase()),
        { uid: user.uid, displayName: profile.displayName, email: profile.email, updatedAt: now },
        { merge: true }
      );
      await setDoc(
        doc(db, "usernames", profile.displayName.toLowerCase()),
        { uid: user.uid, username: profile.displayName, updatedAt: now },
        { merge: true }
      );
    } catch (e) {
      console.warn("기본 displayNames/usernames 등록 예외:", e);
    }
  } else {
    // 신규 가입
    const finalDisplayName = defaultDisplayName;
    const finalUsername = user.displayName || defaultDisplayName;

    profile = {
      uid: user.uid,
      displayName: finalDisplayName,
      username: finalUsername,
      name: finalUsername,
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
    await setDoc(
      subProfileRef,
      {
        displayName: profile.displayName,
        username: profile.username,
        name: profile.username,
        updatedAt: now,
      },
      { merge: true }
    );

    try {
      await setDoc(
        doc(db, "displayNames", profile.displayName.toLowerCase()),
        { uid: user.uid, displayName: profile.displayName, email: profile.email, updatedAt: now },
        { merge: true }
      );
      await setDoc(
        doc(db, "usernames", profile.displayName.toLowerCase()),
        { uid: user.uid, username: profile.displayName, updatedAt: now },
        { merge: true }
      );
    } catch (e) {
      console.warn("초기 displayNames 등록 예외:", e);
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
    const defaultDisplayName = getEmailDisplayName(mainData.email, "사용자");

    const displayName =
      subData?.displayName || mainData.displayName || defaultDisplayName;
    const username =
      subData?.username || mainData.username || subData?.name || mainData.name || defaultDisplayName;

    return {
      uid,
      displayName,
      username,
      name: username,
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
 * 사용자 별명(Username) 수정 저장 함수
 * - users/{userid}/profile 및 users/{userid}에 별명 업데이트
 */
export async function saveUserProfile(
  uid: string,
  updates: {
    username: string;
    name?: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const cleanUsername = updates.username.trim();

  // 1. users/{uid}/profile/info 서브컬렉션 문서 업데이트 (사용자 요청: users/{userid}/profile)
  const subProfileRef = doc(db, "users", uid, "profile", "info");
  await setDoc(
    subProfileRef,
    {
      username: cleanUsername,
      name: cleanUsername,
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
      name: cleanUsername,
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
 * displayName (가입 시 이메일 앞부분 기반 고유 식별자)으로 유저 프로필 조회
 * 1. displayNames/{displayName} 고유 문서 조회
 * 2. users 컬렉션에서 displayName == clean 조회
 * 3. (기존 데이터 호환) usernames/{displayName} 레지스트리 조회
 * 4. (기존 데이터 호환) users 컬렉션에서 username == clean 조회
 * 5. uid 자체로 직접 일치 조회
 */
export async function getUserByDisplayName(displayName: string): Promise<UserProfile | null> {
  const clean = decodeURIComponent(displayName).trim();
  if (!clean) return null;
  const lower = clean.toLowerCase();

  try {
    // 1. displayNames 레지스트리 조회
    const displayNameDoc = await getDoc(doc(db, "displayNames", lower));
    if (displayNameDoc.exists()) {
      const { uid } = displayNameDoc.data();
      if (uid) {
        return await getUserProfile(uid);
      }
    }

    // 2. users 컬렉션에서 displayName 필드 매칭
    const usersCol = collection(db, "users");
    const qDisplayName = query(usersCol, where("displayName", "==", clean), limit(1));
    const snapDisplayName = await getDocs(qDisplayName);
    if (!snapDisplayName.empty) {
      const userDoc = snapDisplayName.docs[0];
      return await getUserProfile(userDoc.id);
    }

    // 3. (호환) usernames 레지스트리 조회
    const usernameDoc = await getDoc(doc(db, "usernames", lower));
    if (usernameDoc.exists()) {
      const { uid } = usernameDoc.data();
      if (uid) {
        return await getUserProfile(uid);
      }
    }

    // 4. (호환) users 컬렉션에서 username 필드 매칭
    const qUsername = query(usersCol, where("username", "==", clean), limit(1));
    const snapUsername = await getDocs(qUsername);
    if (!snapUsername.empty) {
      const userDoc = snapUsername.docs[0];
      return await getUserProfile(userDoc.id);
    }

    // 5. uid 자체로 직접 일치하는 경우
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
