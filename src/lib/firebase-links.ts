import {
  collection,
  doc,
  addDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LinkItem } from "@/types/mylink";

// Firestore 링크 저장 경로: users/anonymous/links
export const FIREBASE_LINKS_COLLECTION = "users/anonymous/links";

/**
 * 다양한 형태의 날짜/타임스탬프 필드를 안전하게 파싱하여 ISO 문자열과 밀리초 타임스탬프로 변환
 */
export function parseCreatedAt(value: unknown): { iso: string; timestamp: number } {
  const now = new Date();
  if (!value) {
    return { iso: now.toISOString(), timestamp: now.getTime() };
  }

  // 1. Firestore Timestamp 인스턴스 (toDate 메서드 소유)
  if (typeof value === "object" && value !== null) {
    if ("toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
      const d = (value as { toDate: () => Date }).toDate();
      return { iso: d.toISOString(), timestamp: d.getTime() };
    }
    // { seconds, nanoseconds } 구조인 경우
    if ("seconds" in value && typeof (value as { seconds: number }).seconds === "number") {
      const d = new Date((value as { seconds: number }).seconds * 1000);
      return { iso: d.toISOString(), timestamp: d.getTime() };
    }
    if (value instanceof Date) {
      return { iso: value.toISOString(), timestamp: value.getTime() };
    }
  }

  // 2. 숫자인 경우 (timestamp ms)
  if (typeof value === "number") {
    const d = new Date(value);
    return { iso: d.toISOString(), timestamp: d.getTime() };
  }

  // 3. 문자열인 경우 (ISO 문자열 또는 날짜 문자열)
  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return { iso: d.toISOString(), timestamp: d.getTime() };
    }
  }

  return { iso: now.toISOString(), timestamp: now.getTime() };
}

/**
 * LinkItem 목록을 createdAt 기준 최신순(내림차순, 최신 등록일이 상단)으로 정렬
 */
export function sortByCreatedAtDesc(links: LinkItem[]): LinkItem[] {
  return [...links].sort((a, b) => {
    const timeA = parseCreatedAt(a.createdAt).timestamp;
    const timeB = parseCreatedAt(b.createdAt).timestamp;
    return timeB - timeA; // 최신순 (내림차순)
  });
}

/**
 * Firestore DocumentData를 LinkItem 타입으로 매핑
 */
function mapDocToLinkItem(id: string, data: DocumentData): LinkItem {
  const createdAtInfo = parseCreatedAt(data.createdAt);
  const updatedAtInfo = parseCreatedAt(data.updatedAt || data.createdAt);

  return {
    id,
    title: data.title ?? "",
    subtitle: data.subtitle ?? "",
    url: data.url ?? "",
    category: data.category ?? "기타",
    iconName: data.iconName ?? "ExternalLink",
    badge: data.badge ? String(data.badge) : undefined,
    badgeBgColor: data.badgeBgColor ?? "#4D6E56",
    badgeTextColor: data.badgeTextColor ?? "#F4FBF4",
    isVisible: data.isVisible !== false,
    order: typeof data.order === "number" ? data.order : 1,
    clickCount: typeof data.clickCount === "number" ? data.clickCount : 0,
    createdAt: createdAtInfo.iso,
    updatedAt: updatedAtInfo.iso,
  };
}

/**
 * Firestore 컬렉션 참조 반환 (users/anonymous/links)
 */
export function getLinksCollectionRef() {
  return collection(db, "users", "anonymous", "links");
}

/**
 * Firebase Firestore (users/anonymous/links)에 새 링크 추가
 */
export async function addFirebaseLink(
  newLinkInput: Omit<LinkItem, "id" | "clickCount" | "createdAt" | "updatedAt" | "order"> & {
    order?: number;
  }
): Promise<LinkItem> {
  const collectionRef = getLinksCollectionRef();
  const now = new Date().toISOString();
  const order = newLinkInput.order ?? 1;

  // Firestore는 undefined 필드를 허용하지 않으므로 필터링
  const docPayload: Record<string, unknown> = {
    title: newLinkInput.title.trim(),
    subtitle: newLinkInput.subtitle?.trim() || `${newLinkInput.title.trim()} 바로가기`,
    url: newLinkInput.url.trim(),
    category: newLinkInput.category.trim() || "기타",
    iconName: newLinkInput.iconName || "ExternalLink",
    badgeBgColor: "#4D6E56",
    badgeTextColor: "#F4FBF4",
    isVisible: newLinkInput.isVisible ?? true,
    order,
    clickCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (newLinkInput.badge && newLinkInput.badge.trim().length > 0) {
    docPayload.badge = newLinkInput.badge.trim();
  }

  const docRef = await addDoc(collectionRef, docPayload);

  return {
    id: docRef.id,
    title: docPayload.title as string,
    subtitle: docPayload.subtitle as string,
    url: docPayload.url as string,
    category: docPayload.category as string,
    iconName: docPayload.iconName as string,
    badge: (docPayload.badge as string) || undefined,
    badgeBgColor: docPayload.badgeBgColor as string,
    badgeTextColor: docPayload.badgeTextColor as string,
    isVisible: docPayload.isVisible as boolean,
    order: docPayload.order as number,
    clickCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Firebase Firestore (users/anonymous/links)에서 모든 링크 목록 가져오기
 * createdAt 기준 최신순(내림차순) 정렬
 */
export async function getFirebaseLinks(): Promise<LinkItem[]> {
  const collectionRef = getLinksCollectionRef();
  try {
    // 1. Firestore orderBy 쿼리 시도 (createdAt 기준 내림차순 최신순)
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const links: LinkItem[] = [];
    snapshot.forEach((d) => {
      links.push(mapDocToLinkItem(d.id, d.data()));
    });

    return sortByCreatedAtDesc(links);
  } catch (error) {
    console.warn("Firestore orderBy('createdAt', 'desc') 쿼리 실패, 전체 조회 후 클라이언트 정렬 폴백:", error);
    try {
      // 2. 인덱스 미생성 등의 경우 폴백: 일반 조회 후 클라이언트에서 최신순 정렬
      const snapshot = await getDocs(collectionRef);
      const links: LinkItem[] = [];
      snapshot.forEach((d) => {
        links.push(mapDocToLinkItem(d.id, d.data()));
      });
      return sortByCreatedAtDesc(links);
    } catch (fallbackError) {
      console.error("Firestore getFirebaseLinks 최종 실패:", fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Firebase Firestore (users/anonymous/links) 실시간 구독 (onSnapshot)
 * createdAt 기준 최신순(내림차순) 정렬
 */
export function subscribeToFirebaseLinks(
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionRef = getLinksCollectionRef();
  const q = query(collectionRef, orderBy("createdAt", "desc"));

  try {
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const links: LinkItem[] = [];
        snapshot.forEach((d) => {
          links.push(mapDocToLinkItem(d.id, d.data()));
        });
        // 항상 createdAt 기준 최신순 정렬 유지
        onUpdate(sortByCreatedAtDesc(links));
      },
      (error) => {
        console.warn("Firestore 실시간 쿼리(orderBy) 구독 에러, 컬렉션 직접 구독으로 폴백:", error);
        // 폴백: 기본 컬렉션 구독 후 클라이언트에서 최신순 정렬
        const fallbackUnsubscribe = onSnapshot(
          collectionRef,
          (snapshot) => {
            const links: LinkItem[] = [];
            snapshot.forEach((d) => {
              links.push(mapDocToLinkItem(d.id, d.data()));
            });
            onUpdate(sortByCreatedAtDesc(links));
          },
          (fallbackErr) => {
            console.error("Firestore links 실시간 구독 최종 에러:", fallbackErr);
            if (onError) onError(fallbackErr);
          }
        );
        return fallbackUnsubscribe;
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Firestore onSnapshot 즉시 오류, 기본 컬렉션 시도:", err);
    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const links: LinkItem[] = [];
        snapshot.forEach((d) => {
          links.push(mapDocToLinkItem(d.id, d.data()));
        });
        onUpdate(sortByCreatedAtDesc(links));
      },
      (e) => {
        if (onError) onError(e);
      }
    );
  }
}

/**
 * Firebase Firestore 링크 클릭 수 증가 (users/anonymous/links/{id})
 */
export async function incrementFirebaseLinkClick(linkId: string): Promise<void> {
  try {
    const docRef = doc(db, "users", "anonymous", "links", linkId);
    await updateDoc(docRef, {
      clickCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Firebase incrementLinkClick 실패 (로컬 상태만 유지):", error);
  }
}

/**
 * Firebase Firestore 링크 삭제 (users/anonymous/links/{id})
 */
export async function deleteFirebaseLink(linkId: string): Promise<void> {
  const docRef = doc(db, "users", "anonymous", "links", linkId);
  await deleteDoc(docRef);
}
