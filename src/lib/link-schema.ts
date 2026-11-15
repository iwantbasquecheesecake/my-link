import { z } from "zod";

// 검증 글자 수 제한 상수
export const LIMITS = {
  TITLE_MIN: 2,
  TITLE_MAX: 40,
  SUBTITLE_MAX: 80,
  CATEGORY_MAX: 15,
  BADGE_MAX: 10,
};

// 뱃지 추천 프리셋
export const BADGE_PRESETS = [
  "실시간 커밋",
  "인터랙티브",
  "대표 프로젝트",
  "스터디 노트",
  "커피챗 환영",
  "NEW",
  "HOT",
];

// 기본 추천 카테고리 목록
export const DEFAULT_CATEGORIES = [
  "코드 저장소",
  "프로젝트",
  "포트폴리오",
  "개발 일지",
  "협업 문의",
];

// Zod 스키마 정의 (Strict Validation Rules)
export const linkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(LIMITS.TITLE_MIN, {
      message: `제목은 최소 ${LIMITS.TITLE_MIN}자 이상이어야 합니다.`,
    })
    .max(LIMITS.TITLE_MAX, {
      message: `제목은 최대 ${LIMITS.TITLE_MAX}자까지 입력 가능합니다.`,
    }),
  url: z
    .string()
    .trim()
    .min(1, { message: "목적지 URL을 입력해주세요." })
    .refine((val) => !/\s/.test(val), {
      message: "URL에는 띄어쓰기(공백)를 포함할 수 없습니다.",
    })
    .refine(
      (val) => {
        // mailto: 이메일 검증
        if (val.startsWith("mailto:")) {
          const email = val.replace("mailto:", "").trim();
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }
        // 웹 주소 프로토콜 및 도메인 검증
        const candidate = /^https?:\/\//i.test(val) ? val : `https://${val}`;
        try {
          const parsed = new URL(candidate);
          return (
            (parsed.protocol === "http:" || parsed.protocol === "https:") &&
            (parsed.hostname === "localhost" || parsed.hostname.includes("."))
          );
        } catch {
          return false;
        }
      },
      {
        message: "올바른 웹 URL 형식(예: https://example.com)을 입력해주세요.",
      }
    ),
  subtitle: z
    .string()
    .max(LIMITS.SUBTITLE_MAX, {
      message: `상세 설명은 최대 ${LIMITS.SUBTITLE_MAX}자까지 입력 가능합니다.`,
    })
    .optional(),
  category: z
    .string()
    .trim()
    .min(1, { message: "카테고리를 입력하거나 선택해주세요." })
    .max(LIMITS.CATEGORY_MAX, {
      message: `카테고리는 최대 ${LIMITS.CATEGORY_MAX}자까지 입력 가능합니다.`,
    })
    .refine((val) => val !== "전체", {
      message: "'전체'는 시스템 기본 탭 이름이므로 카테고리로 사용할 수 없습니다.",
    }),
  iconName: z.string(),
  badge: z
    .string()
    .max(LIMITS.BADGE_MAX, {
      message: `뱃지 문구는 최대 ${LIMITS.BADGE_MAX}자까지 입력 가능합니다.`,
    })
    .optional(),
  isVisible: z.boolean(),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
