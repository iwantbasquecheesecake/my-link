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
 * Firestore DocumentData를 LinkItem 타입으로 매핑
 */
function mapDocToLinkItem(id: string, data: DocumentData): LinkItem {
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
    isVisible: data.isVisible ?? true,
    order: typeof data.order === "number" ? data.order : 1,
    clickCount: typeof data.clickCount === "number" ? data.clickCount : 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
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
 */
export async function getFirebaseLinks(): Promise<LinkItem[]> {
  try {
    const collectionRef = getLinksCollectionRef();
    const q = query(collectionRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);

    const links: LinkItem[] = [];
    snapshot.forEach((d) => {
      links.push(mapDocToLinkItem(d.id, d.data()));
    });

    return links;
  } catch (error) {
    console.error("Firebase getFirebaseLinks 에러:", error);
    // orderBy 인덱스가 없거나 권한 에러 시 일반 getDocs 시도
    const collectionRef = getLinksCollectionRef();
    const snapshot = await getDocs(collectionRef);
    const links: LinkItem[] = [];
    snapshot.forEach((d) => {
      links.push(mapDocToLinkItem(d.id, d.data()));
    });
    return links.sort((a, b) => a.order - b.order);
  }
}

/**
 * Firebase Firestore (users/anonymous/links) 실시간 구독 (onSnapshot)
 */
export function subscribeToFirebaseLinks(
  onUpdate: (links: LinkItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const collectionRef = getLinksCollectionRef();

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const links: LinkItem[] = [];
      snapshot.forEach((d) => {
        links.push(mapDocToLinkItem(d.id, d.data()));
      });
      // order 기준 오름차순 정렬 (작은 번호가 상단)
      links.sort((a, b) => a.order - b.order);
      onUpdate(links);
    },
    (error) => {
      console.warn("Firestore links 실시간 구독 알림:", error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
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
