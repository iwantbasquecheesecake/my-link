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

    // 프로필 정보 동기화 (홍길동 등 이전 정보 -> 이름, User Name, 바이브코딩 등으로 갱신)
    if (parsed.profile) {
      if (
        parsed.profile.name === "김나린" ||
        parsed.profile.name === "홍길동" ||
        parsed.profile.name === "이름" ||
        parsed.profile.role?.includes("공간정보") ||
        parsed.profile.role?.includes("크리에이터") ||
        parsed.profile.bio?.includes("공간 데이터") ||
        parsed.profile.bio?.includes("김나린") ||
        parsed.profile.bio?.includes("소중한 링크") ||
        parsed.profile.email?.includes("narin") ||
        parsed.profile.email?.includes("gildong") ||
        parsed.profile.englishName === "Gildong Hong" ||
        !parsed.profile.englishName
      ) {
        parsed.profile.name = INITIAL_DATA.profile.name;
        parsed.profile.englishName = INITIAL_DATA.profile.englishName;
        parsed.profile.role = INITIAL_DATA.profile.role;
        parsed.profile.statusBadge = INITIAL_DATA.profile.statusBadge;
        parsed.profile.bio = INITIAL_DATA.profile.bio;
        parsed.profile.location = INITIAL_DATA.profile.location;
        parsed.profile.email = INITIAL_DATA.profile.email;
        if (parsed.profile.socials) {
          parsed.profile.socials = INITIAL_DATA.profile.socials;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }

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

export function updateStoredLink(
  linkId: string,
  updates: Partial<Omit<LinkItem, "id" | "clickCount" | "createdAt">>
): MyLinkData {
  const current = getStoredData();
  const now = new Date().toISOString();
  const updatedLinks = current.links.map((link) => {
    if (link.id === linkId) {
      return {
        ...link,
        ...updates,
        updatedAt: now,
      };
    }
    return link;
  });

  const updatedData: MyLinkData = {
    ...current,
    links: updatedLinks,
  };
  saveStoredData(updatedData);
  return updatedData;
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
