"use client";

import React from "react";
import { LogOut, Loader2 } from "lucide-react";
import { type User } from "firebase/auth";
import { UserProfile } from "@/lib/firebase-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface GoogleAuthButtonProps {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function GoogleAuthButton({
  user,
  profile,
  isLoading,
  onLogin,
  onLogout,
}: GoogleAuthButtonProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-card border border-border/70 text-xs text-muted-foreground shadow-xs animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4D6E56]" />
        <span className="hidden sm:inline">인증 확인 중...</span>
      </div>
    );
  }

  // 로그인 상태: 유저 아바타 + 이름(이메일 앞부분) + 로그아웃 버튼
  if (user) {
    const userEmail = profile?.email || user.email;
    const emailPrefix = userEmail ? userEmail.split("@")[0] : null;
    const displayName = emailPrefix || profile?.name || user.displayName || "사용자";
    const photoURL = profile?.photoURL || user.photoURL || undefined;

    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* 유저 프로필 칩 */}
        <div
          className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-card border border-border/70 shadow-xs text-xs font-semibold text-foreground max-w-[140px] sm:max-w-[180px] truncate"
          title={`${displayName} (${profile?.email || user.email})`}
        >
          <Avatar className="w-6 h-6 border border-border/80 shrink-0">
            {photoURL && <AvatarImage src={photoURL} alt={displayName} />}
            <AvatarFallback className="text-[10px] bg-[#4D6E56] text-[#F4FBF4] font-bold">
              {displayName.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-[11px] sm:text-xs font-bold text-[#1E3024] dark:text-[#F4FBF4]">
            {displayName}
          </span>
        </div>

        {/* 로그아웃 버튼 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="h-8 px-2 sm:px-2.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
          title="로그아웃"
          aria-label="로그아웃"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">로그아웃</span>
        </Button>
      </div>
    );
  }

  // 비로그인 상태: Google 소셜 로그인 버튼
  return (
    <button
      type="button"
      onClick={onLogin}
      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-card hover:bg-card/90 text-foreground border border-border/80 hover:border-[#4D6E56] transition-all duration-200 active:scale-95 cursor-pointer shadow-xs font-bold text-xs"
      title="Google 계정으로 로그인"
      aria-label="Google 계정으로 로그인"
    >
      {/* Google 'G' 공식 4색 심볼 SVG */}
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Google 로그인</span>
    </button>
  );
}
