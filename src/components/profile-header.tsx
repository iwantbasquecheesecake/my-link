"use client";

import React, { useRef } from "react";
import { MapPin, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { ProfileConfig } from "@/types/mylink";
import { UserProfile } from "@/lib/firebase-auth";
import { LineGithubIcon } from "./icon-helper";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  profile: ProfileConfig;
  userProfile?: UserProfile | null;
  isLoggedIn?: boolean;
  onSecretTrigger: () => void;
}

export function ProfileHeader({
  profile,
  userProfile,
  isLoggedIn = false,
  onSecretTrigger,
}: ProfileHeaderProps) {
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleAvatarClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 500) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      onSecretTrigger();
    }
  };

  // 로그인 상태일 경우 Firestore users/{uid} 정보 우선 반영 (display name은 이메일 앞부분 사용)
  const currentEmail = isLoggedIn && userProfile?.email ? userProfile.email : profile.email;
  const emailPrefix = currentEmail ? currentEmail.split("@")[0] : null;
  const currentName = isLoggedIn ? (emailPrefix || userProfile?.name || profile.name) : profile.name;
  const currentAvatarUrl = isLoggedIn && userProfile?.photoURL ? userProfile.photoURL : profile.avatarUrl;
  const currentRole = isLoggedIn && userProfile?.role ? userProfile.role : (isLoggedIn ? "MyLink 크리에이터" : profile.role);
  const currentBio = isLoggedIn && userProfile?.bio ? userProfile.bio : profile.bio;

  return (
    <Card className="rounded-[20px] p-5 sm:p-6 border-border shadow-gs-card relative overflow-hidden bg-card text-card-foreground">
      {/* 포레스트 에코 상단 브랜드 액센트 라인 */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E3024] via-[#4D6E56] to-[#00431C]" />

      {/* 1. 프로필 사진이 말하는 듯한 유동적 크기의 소개글 말풍선 */}
      {currentBio && (
        <div className="mb-4 flex flex-col items-center sm:items-start pt-1">
          <div className="relative inline-block w-fit max-w-[94%] sm:max-w-[85%] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-[#D6E1D8]/65 dark:bg-[#273A2D]/85 border border-[#4D6E56]/30 dark:border-[#4D6E56]/40 shadow-xs text-xs sm:text-[13px] text-foreground leading-relaxed break-keep animate-in fade-in duration-300">
            <p className="flex items-center gap-1.5 font-medium">
              <span className="text-[#4D6E56] font-bold text-sm leading-none font-serif select-none">“</span>
              <span>{currentBio}</span>
              <span className="text-[#4D6E56] font-bold text-sm leading-none font-serif select-none">”</span>
            </p>
            {/* 말풍선 아래쪽 꼬리 (모바일: 중앙 아바타 가리킴 / PC: 좌측 아바타 가리킴) */}
            <div className="absolute -bottom-2 left-1/2 sm:left-11 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#D6E1D8]/90 dark:border-t-[#273A2D]" />
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-5">
        {/* 아바타 영역 */}
        <div className="relative group shrink-0">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="rounded-full border border-border/80 hover:border-[#4D6E56] transition-transform duration-300 active:scale-95 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4D6E56]"
            title="프로필 사진 (연속 3회 클릭 시 관리자 인증)"
            aria-label={`${currentName} 프로필 사진`}
          >
            <Avatar size="xl">
              <AvatarImage
                src={currentAvatarUrl || "/avatar.svg"}
                alt={currentName}
                priority
              />
              <AvatarFallback>{currentName.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </button>
          <span
            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ring-2 shadow-xs ${
              isLoggedIn
                ? "bg-[#4D6E56] ring-[#4D6E56]/30"
                : "bg-gray-400 ring-gray-400/30"
            }`}
          />
        </div>

        {/* 프로필 정보 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* 이름 & 소속 */}
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-1.5">
            <span>{currentName}</span>
            {isLoggedIn && (
              <span title="Google 인증 완료 계정" className="inline-flex text-[#4D6E56]">
                <CheckCircle2 className="w-4 h-4 ml-0.5" />
              </span>
            )}
            {!isLoggedIn && (
              <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                {profile.englishName || "User Name"}
              </span>
            )}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-[#4D6E56] dark:text-[#8FA594] mt-0.5">
            {currentRole}
          </p>

          {/* 메타 정보 (위치 & 이메일) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#4D6E56]" />
                {profile.location}
              </span>
            )}
            {currentEmail && (
              <a
                href={`mailto:${currentEmail}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#4D6E56]" />
                {currentEmail}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 소셜 링크 아이콘 바 */}
      <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-center sm:justify-start gap-2">
        {profile.socials.github && (
          <a
            href={profile.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs"
            title="GitHub 방문"
            aria-label="GitHub 프로필"
          >
            <LineGithubIcon className="w-5 h-5" />
          </a>
        )}

        {profile.socials.linkedin && (
          <a
            href={profile.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs"
            title="LinkedIn 방문"
            aria-label="LinkedIn 프로필"
          >
            <span className="font-bold text-xs">in</span>
          </a>
        )}

        {profile.socials.blog && (
          <a
            href={profile.socials.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs"
            title="기술 블로그 방문"
            aria-label="기술 블로그"
          >
            <span className="font-bold text-[10px]">VELOG</span>
          </a>
        )}

        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#4D6E56] hover:text-[#F4FBF4] hover:border-[#4D6E56] transition-all duration-200 active:scale-95 shadow-xs"
            title="이메일 문의"
            aria-label="이메일 문의하기"
          >
            <Mail className="w-5 h-5" />
          </a>
        )}
      </div>
    </Card>
  );
}
