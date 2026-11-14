"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  MapPin,
  ChevronRight,
  Share2,
  Check,
  Layers,
  BookOpen,
  Code2,
  Home,
  FolderGit2,
  User,
  Sparkles,
} from "lucide-react";

// 안정적인 렌더링을 위한 라인 GitHub 아이콘
function LineGithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface ServiceLink {
  id: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  title: string;
  subtitle: string;
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

const serviceLinks: ServiceLink[] = [
  {
    id: "github",
    category: "코드 저장소",
    badge: "실시간 커밋",
    badgeColor: "bg-[#00D4EA] text-[#1E2530]",
    title: "GitHub 리포지토리",
    subtitle: "프로젝트 소스코드 및 일일 잔디 커밋 아카이브입니다.",
    url: "https://github.com/iwantbasquecheesecake",
    icon: LineGithubIcon,
  },
  {
    id: "gis-lab",
    category: "지도 연구",
    badge: "인터랙티브",
    badgeColor: "bg-[#1E2530] text-[#00D4EA]",
    title: "GIS & 웹 지도 연구소",
    subtitle: "공간 데이터를 시각화한 인터랙티브 지도 웹 프로젝트 모음입니다.",
    url: "#portfolio",
    icon: Layers,
  },
  {
    id: "tech-blog",
    category: "개발 일지",
    badge: "스터디 노트",
    badgeColor: "bg-[#F4F5FB] text-[#515160] border border-[#D6D9E1]",
    title: "기술 블로그 & 스터디 노트",
    subtitle: "공간정보 분석과 모던 웹 기술 스터디 개발 로그입니다.",
    url: "#blog",
    icon: BookOpen,
  },
  {
    id: "contact",
    category: "협업 문의",
    badge: "커피챗 환영",
    badgeColor: "bg-[#00D4EA] text-[#1E2530]",
    title: "이메일로 커피챗 제안하기",
    subtitle: "새로운 프로젝트 협업 및 커피챗 제안을 언제든 환영합니다.",
    url: "mailto:contact@example.com",
    icon: Mail,
  },
];

const categoryIcons = [
  { label: "코드저장소", href: "https://github.com/iwantbasquecheesecake", icon: LineGithubIcon },
  { label: "GIS지도", href: "#portfolio", icon: Layers },
  { label: "개발노트", href: "#blog", icon: BookOpen },
  { label: "협업문의", href: "mailto:contact@example.com", icon: Mail },
];

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // 복사 실패 처리
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5FB] text-[#1E2530] font-sans antialiased pb-20 sm:pb-12">
      {/* 1. 상단 앱 헤더 (App Header: 40x40 아이콘 히트 에어리어) */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#D6D9E1]/80">
        <div className="max-w-[540px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* 손글씨풍 라운드 로고 + 청록 포인트 */}
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl text-[#1E2530] tracking-tight">
              MyLink
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D4EA]" />
          </div>

          {/* 우측 40x40 정사각 히트 영역 아이콘 버튼들 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E2530] hover:bg-[#F4F5FB] transition active:scale-95 cursor-pointer relative"
              title="프로필 링크 복사"
              aria-label="링크 복사하기"
            >
              {copied ? (
                <Check className="w-5 h-5 text-[#00D4EA] stroke-[2.5]" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
            <a
              href="mailto:contact@example.com"
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E2530] hover:bg-[#F4F5FB] transition active:scale-95"
              aria-label="이메일 문의하기"
              title="이메일 보내기"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 (EdgeInsets.symmetric(horizontal: 16) = px-4) */}
      <main className="max-w-[540px] mx-auto px-4 py-4 space-y-4">
        {/* 상단 배송지 느낌의 위치 표시 Pill 바 (location-pill) */}
        <div className="bg-white rounded-full px-4 py-2 border border-[#D6D9E1] shadow-gs-card flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#1E2530] font-medium truncate">
            <span className="w-2 h-2 rounded-full bg-[#00D4EA] shrink-0 animate-pulse" />
            <span className="font-bold text-[#00D4EA]">현재 연구실</span>
            <span className="text-[#515160] truncate">공간정보시스템(GIS) · 웹 프론트엔드</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#C0C4CD] shrink-0 ml-1" />
        </div>

        {/* 메인 프로필 카드 (흰 바탕 카드 + 청록 브랜드 표면 + 근접 검정 CTA) */}
        <section className="bg-white rounded-[20px] p-5 sm:p-6 border border-[#D6D9E1] shadow-gs-card space-y-5">
          <div className="flex items-center gap-4">
            {/* 아바타: 청록 서클 배경 (#00D4EA) */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-[#00D4EA] shrink-0 shadow-sm">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <Image
                  src="/avatar.svg"
                  alt="임나린 프로필 사진"
                  width={88}
                  height={88}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 프로필 텍스트 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-[#00D4EA]/15 text-[#00AEC1] text-[11px] font-bold">
                  GIS DEVELOPER
                </span>
                <span className="text-[11px] text-[#515160]">연구원</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E2530] tracking-tight">
                임나린
                <span className="text-xs sm:text-sm font-normal text-[#515160] ml-1.5">
                  Narin Lim
                </span>
              </h1>

              <p className="text-xs text-[#515160] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00D4EA] shrink-0" />
                <span>Spatial Data & Web Developer</span>
              </p>
            </div>
          </div>

          {/* 소개 본문 (친근한 생활밀착형 톤앤매너) */}
          <div className="bg-[#F4F5FB] rounded-[14px] p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed text-[#515160] break-keep">
            공간 데이터와 웹 기술을 연결하는 개발자입니다. 지도와 공간 분석이
            필요한 순간, 사용자에게 직관적이고 친근한 서비스를 빠르고 정확하게
            배달합니다.
          </div>

          {/* 1차 액션 버튼 (button-primary: background #1E2530, color white) */}
          <a
            href="mailto:contact@example.com"
            className="w-full h-12 rounded-[12px] bg-[#1E2530] hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-sm cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#00D4EA]" />
            <span>이메일로 커피챗 제안하기</span>
          </a>

          {/* 보조 이항 선택 필 (action-pill) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="https://github.com/iwantbasquecheesecake"
              target="_blank"
              rel="noreferrer"
              className="h-10 rounded-full bg-[#F4F5FB] hover:bg-[#EAEBEE] text-[#1E2530] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#D6D9E1] transition"
            >
              <LineGithubIcon className="w-4 h-4 text-[#1E2530]" />
              <span>GitHub 바로가기</span>
            </a>
            <a
              href="#portfolio"
              className="h-10 rounded-full bg-[#00D4EA]/15 hover:bg-[#00D4EA]/25 text-[#00AEC1] font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Layers className="w-4 h-4" />
              <span>포트폴리오 보기</span>
            </a>
          </div>
        </section>

        {/* 3. 카테고리 원형 아이콘 그리드 (category-icon-grid: 4개 원형 아이콘) */}
        <section className="bg-white rounded-[20px] p-4 border border-[#D6D9E1] shadow-gs-card">
          <div className="grid grid-cols-4 gap-2 text-center">
            {categoryIcons.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#E6FAFC] group-hover:bg-[#00D4EA] text-[#00AEC1] group-hover:text-[#1E2530] flex items-center justify-center transition-colors shadow-sm">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#1E2530] group-hover:text-[#00AEC1] transition-colors">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* 4. 2열 서비스 선택 카드 (brand-selector-card: GS25 & GS더프레시 2열 구조 오마주) */}
        <section className="grid grid-cols-2 gap-2.5">
          <a
            href="#portfolio"
            className="bg-white rounded-[18px] p-4 border border-[#D6D9E1] shadow-gs-card hover:border-[#00D4EA] transition flex flex-col justify-between h-32"
          >
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#00D4EA] text-[#1E2530] font-black text-[10px]">
                GIS LAB
              </span>
              <div className="font-bold text-sm text-[#1E2530] mt-2 leading-tight">
                공간정보 지도
              </div>
              <div className="text-[11px] text-[#515160] mt-0.5">
                인터랙티브 웹맵
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#00AEC1]">
              <span>실시간 보기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </a>

          <a
            href="#blog"
            className="bg-white rounded-[18px] p-4 border border-[#D6D9E1] shadow-gs-card hover:border-[#1E2530] transition flex flex-col justify-between h-32"
          >
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#1E2530] text-white font-black text-[10px]">
                TECH NOTE
              </span>
              <div className="font-bold text-sm text-[#1E2530] mt-2 leading-tight">
                개발 일지
              </div>
              <div className="text-[11px] text-[#515160] mt-0.5">
                공간 분석 & 프론트
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#1E2530]">
              <span>노트 읽기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </a>
        </section>

        {/* 5. 주요 서비스 및 링크 목록 (Section Header: 18px 700 + 화이트 카드 리스트) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[18px] font-bold text-[#1E2530]">
              많이 찾는 서비스 & 링크
            </h2>
            <span className="text-xs text-[#515160]">전체 {serviceLinks.length}개</span>
          </div>

          <div className="bg-white rounded-[20px] border border-[#D6D9E1] shadow-gs-card overflow-hidden divide-y divide-[#EAEBEE]">
            {serviceLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between p-4 hover:bg-[#F4F5FB] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* 청록 아이콘 박스 */}
                    <div className="w-10 h-10 rounded-full bg-[#E6FAFC] group-hover:bg-[#00D4EA] text-[#00AEC1] group-hover:text-[#1E2530] flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    {/* 텍스트 영역 (320px에서도 잘리지 않는 줄바꿈) */}
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm sm:text-[15px] text-[#1E2530] group-hover:text-[#00AEC1] transition-colors leading-snug">
                          {link.title}
                        </span>
                        {link.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold ${link.badgeColor}`}
                          >
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#515160] mt-0.5 break-keep leading-relaxed">
                        {link.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* 쉐브론 */}
                  <ChevronRight className="w-4 h-4 text-[#C0C4CD] group-hover:text-[#1E2530] transition-colors shrink-0 ml-2" />
                </a>
              );
            })}
          </div>
        </section>

        {/* 6. 인포 배너 (나만의 냉장고/보관함 컨셉 오마주) */}
        <section className="bg-gradient-to-r from-[#00D4EA]/15 via-white to-white rounded-[18px] p-4 border border-[#D6D9E1] flex items-center justify-between gap-3 shadow-gs-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#00D4EA] flex items-center justify-center text-[#1E2530] shrink-0 font-black text-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-bold text-[#1E2530]">
                언제든 열려있는 협업 보관함
              </div>
              <div className="text-[11px] text-[#515160] truncate">
                지도 개발 제안 및 커피챗 요청은 언제든 환영합니다!
              </div>
            </div>
          </div>
          <a
            href="mailto:contact@example.com"
            className="px-3 py-1.5 rounded-full bg-[#1E2530] hover:bg-black text-white text-xs font-bold shrink-0 transition"
          >
            문의하기
          </a>
        </section>

        {/* 푸터 */}
        <footer className="text-center text-xs text-[#515160] pt-4 pb-2">
          <p className="font-semibold text-[#1E2530]">
            © 2026 임나린 (MyLink). All rights reserved.
          </p>
          <p className="text-[11px] text-[#C0C4CD] mt-0.5">
            Inspired by Our Neighborhood GS Design System
          </p>
        </footer>
      </main>

      {/* 7. 하단 5구성 내비게이션 바 (bottom-tab-bar + 중앙 원형 플로팅 FAB) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-[#D6D9E1] h-16 z-40 max-w-[540px] mx-auto flex items-center justify-around px-2 shadow-lg">
        <a
          href="#"
          className="flex flex-col items-center gap-1 text-[#00AEC1] font-bold text-[10px] w-12"
        >
          <Home className="w-5 h-5" />
          <span>홈</span>
        </a>

        <a
          href="#portfolio"
          className="flex flex-col items-center gap-1 text-[#515160] hover:text-[#1E2530] font-medium text-[10px] w-12"
        >
          <Layers className="w-5 h-5" />
          <span>GIS지도</span>
        </a>

        {/* 중앙 원형 플로팅 결제/액션 FAB (tab-bar-fab: 완전 원형 블랙 채움) */}
        <div className="relative -top-3">
          <button
            onClick={handleCopyLink}
            className="w-13 h-13 rounded-full bg-[#1E2530] hover:bg-black text-[#00D4EA] flex flex-col items-center justify-center shadow-lg border-2 border-white transition active:scale-95 cursor-pointer"
            title="링크 복사 및 QR"
          >
            <Code2 className="w-6 h-6" />
          </button>
        </div>

        <a
          href="https://github.com/iwantbasquecheesecake"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 text-[#515160] hover:text-[#1E2530] font-medium text-[10px] w-12"
        >
          <FolderGit2 className="w-5 h-5" />
          <span>깃허브</span>
        </a>

        <a
          href="mailto:contact@example.com"
          className="flex flex-col items-center gap-1 text-[#515160] hover:text-[#1E2530] font-medium text-[10px] w-12"
        >
          <User className="w-5 h-5" />
          <span>MY</span>
        </a>
      </nav>
    </div>
  );
}
