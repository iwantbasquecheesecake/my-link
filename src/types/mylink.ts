export interface ProfileConfig {
  name: string;
  englishName?: string; // 영문 성명 (예: "Gildong Hong")
  role: string;         // 소속 및 신분 (예: "웹 개발자 & 크리에이터")
  statusBadge: string;  // 현재 상태 뱃지 (예: "온라인", "프로젝트 진행 중")
  bio: string;          // 자기소개
  avatarUrl: string;    // 프로필 이미지 URL 또는 Base64
  location?: string;    // 활동 지역 또는 캠퍼스
  email?: string;
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    blog?: string;
  };
}

export interface LinkItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  url: string;
  iconName: string;     // Lucide 아이콘 명칭
  badge?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  isVisible: boolean;   // 노출 여부
  order: number;        // 정렬 순서
  clickCount: number;   // 클릭 수
  createdAt: string;
  updatedAt: string;
}

export interface ThemeConfig {
  presetId: 'dark-gs' | 'clean-white' | 'deep-cyber' | 'soft-pastel' | 'retro-wood';
  backgroundType: 'color' | 'gradient';
  backgroundColor: string;
  backgroundGradient?: {
    from: string;
    to: string;
    direction: string;
  };
  cardRadius: 'none' | 'md' | 'xl' | 'full';
  cardShadow: 'none' | 'sm' | 'md' | 'lg';
  cardBgOpacity: number;
  accentColor: string;
  fontFamily?: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  lastUpdated: string;
}

export interface MyLinkData {
  version: string;
  adminPasswordHash?: string;
  profile: ProfileConfig;
  links: LinkItem[];
  theme: ThemeConfig;
  analytics: AnalyticsSummary;
}
