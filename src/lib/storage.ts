import { MyLinkData, LinkItem } from "@/types/mylink";
import { INITIAL_DATA, STORAGE_KEY } from "./constants";

export function getStoredData(): MyLinkData {
  if (typeof window === "undefined") {
    return INITIAL_DATA;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw) as MyLinkData;

    // 뱃지 색상 브랜드 통일화 (배경: 세이지 그린 #4D6E56 / 글자: #F4FBF4)
    if (parsed.links && Array.isArray(parsed.links)) {
      parsed.links = parsed.links.map((link) => ({
        ...link,
        badgeBgColor: "#4D6E56",
        badgeTextColor: "#F4FBF4",
      }));
    }

    return parsed;
  } catch (error) {
    console.error("Failed to read from localStorage:", error);
    return INITIAL_DATA;
  }
}

export function saveStoredData(data: MyLinkData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function incrementLinkClick(linkId: string): LinkItem[] {
  if (typeof window === "undefined") return INITIAL_DATA.links;

  try {
    const current = getStoredData();
    const updatedLinks = current.links.map((link) => {
      if (link.id === linkId) {
        return {
          ...link,
          clickCount: (link.clickCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
      }
      return link;
    });

    const updatedData: MyLinkData = {
      ...current,
      links: updatedLinks,
      analytics: {
        totalClicks: (current.analytics?.totalClicks || 0) + 1,
        lastUpdated: new Date().toISOString(),
      },
    };

    saveStoredData(updatedData);
    return updatedLinks;
  } catch (error) {
    console.error("Failed to increment click count:", error);
    return INITIAL_DATA.links;
  }
}

export function addStoredLink(
  newLinkInput: Omit<LinkItem, "id" | "clickCount" | "createdAt" | "updatedAt" | "order"> & {
    order?: number;
  }
): { updatedData: MyLinkData; newLink: LinkItem } {
  const current = getStoredData();
  const now = new Date().toISOString();
  const id = `link-${Date.now()}`;

  // 새로 추가되는 링크는 목록 최상단(order: 1)에 위치시키고 기존 링크들의 order를 1씩 증가
  const order = newLinkInput.order ?? 1;

  const newLink: LinkItem = {
    id,
    category: newLinkInput.category.trim() || "기타",
    title: newLinkInput.title.trim(),
    subtitle: newLinkInput.subtitle.trim(),
    url: newLinkInput.url.trim(),
    iconName: newLinkInput.iconName || "ExternalLink",
    badge: newLinkInput.badge?.trim() || undefined,
    badgeBgColor: "#4D6E56",
    badgeTextColor: "#F4FBF4",
    isVisible: newLinkInput.isVisible ?? true,
    order,
    clickCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  // 기존 링크들 order 조정 후 맨 앞에 추가
  const updatedExistingLinks = current.links.map((link) => ({
    ...link,
    order: link.order >= order ? link.order + 1 : link.order,
  }));

  const updatedLinks = [newLink, ...updatedExistingLinks];

  const updatedData: MyLinkData = {
    ...current,
    links: updatedLinks,
  };

  saveStoredData(updatedData);
  return { updatedData, newLink };
}

export function deleteStoredLink(linkId: string): MyLinkData {
  const current = getStoredData();
  const updatedLinks = current.links.filter((l) => l.id !== linkId);
  const updatedData: MyLinkData = {
    ...current,
    links: updatedLinks,
  };
  saveStoredData(updatedData);
  return updatedData;
}
