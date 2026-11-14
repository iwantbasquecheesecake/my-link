"use client";

import React, { useRef } from "react";
import { MapPin, Mail, Sparkles } from "lucide-react";
import { ProfileConfig } from "@/types/mylink";
import { LineGithubIcon } from "./icon-helper";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: ProfileConfig;
  onSecretTrigger: () => void;
}

export function ProfileHeader({ profile, onSecretTrigger }: ProfileHeaderProps) {
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

  return (
    <Card className="rounded-[20px] p-5 sm:p-6 border-border shadow-gs-card relative overflow-hidden bg-card text-card-foreground">
      {/* 포레스트 에코 상단 브랜드 액센트 라인 */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E3024] via-[#4D6E56] to-[#00431C]" />

      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-5">
        {/* 아바타 영역 (내부 링 없는 깔끔한 단일 원형 아바타) */}
        <div className="relative group shrink-0">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="rounded-full border border-border/80 hover:border-[#4D6E56] transition-transform duration-300 active:scale-95 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#4D6E56]"
            title="프로필 사진 (연속 3회 클릭 시 관리자 인증)"
            aria-label="김나린 프로필 사진"
          >
            <Avatar size="xl">
              <AvatarImage
                src={profile.avatarUrl || "/avatar.svg"}
                alt={profile.name}
                priority
              />
              <AvatarFallback>{profile.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </button>
          <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#4D6E56] border-2 border-white ring-2 ring-[#4D6E56]/30 shadow-xs" />
        </div>

        {/* 프로필 정보 */}
        <div className="flex-1 min-w-0">
          {/* 상태 뱃지 (shadcn/ui Badge) */}
          <Badge
            variant="soft"
            className="mb-2 gap-1.5 px-2.5 py-0.5 text-[11px]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D6E56] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4D6E56]"></span>
            </span>
            <span>{profile.statusBadge}</span>
          </Badge>

          {/* 이름 & 소속 */}
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-1.5">
            <span>{profile.name}</span>
            <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
              Narin Kim
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-[#4D6E56] dark:text-[#8FA594] mt-0.5">
            {profile.role}
          </p>

          {/* 메타 정보 (위치 & 이메일) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#4D6E56]" />
                {profile.location}
              </span>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#4D6E56]" />
                {profile.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 소개글 바이오 */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-[14px] bg-[#D6E1D8]/45 dark:bg-[#273A2D]/50 border border-border/40 text-xs sm:text-[13px] text-foreground leading-relaxed break-keep">
        <p className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#4D6E56] shrink-0 mt-0.5" />
          <span>{profile.bio}</span>
        </p>
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
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-200 active:scale-95 shadow-xs"
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
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#20C997] hover:text-white hover:border-[#20C997] transition-all duration-200 active:scale-95 shadow-xs"
            title="기술 블로그 방문"
            aria-label="기술 블로그"
          >
            <span className="font-bold text-[10px]">VELOG</span>
          </a>
        )}

        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-[#1E3024] hover:text-white hover:border-[#1E3024] transition-all duration-200 active:scale-95 shadow-xs"
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
