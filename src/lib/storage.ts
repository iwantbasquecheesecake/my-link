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
    const parsed = JSON.parse(raw);
    return parsed as MyLinkData;
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
