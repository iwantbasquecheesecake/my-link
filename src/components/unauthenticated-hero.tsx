"use client";

import React from "react";
import { Sparkles, ShieldCheck, Zap, Layers, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UnauthenticatedHeroProps {
  onLogin: () => void;
  isLoading: boolean;
}

export function UnauthenticatedHero({ onLogin, isLoading }: UnauthenticatedHeroProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* 1. 메인 안내 히어로 카드 */}
      <Card className="rounded-[24px] p-6 sm:p-8 bg-card border-border shadow-gs-card relative overflow-hidden text-center sm:text-left">
        {/* 상단 액센트 라인 */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E3024] via-[#4D6E56] to-[#00431C]" />

        <div className="space-y-4 pt-1">
          {/* 환영 뱃지 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4D6E56]/15 text-[#4D6E56] dark:text-[#8FA594] border border-[#4D6E56]/25 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MyLink 서비스 안내</span>
          </div>

          {/* 메인 타이틀 */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E3024] dark:text-[#F4FBF4] tracking-tight leading-snug">
              나만의 링크 모음, <br className="sm:hidden" />
              로그인 후 바로 시작해보세요!
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-keep">
              Google 계정으로 로그인하시면 나만의 맞춤 링크를 무제한으로 등록하고, 
              실시간으로 수정 및 삭제하며 방문자 클릭 통계를 안전하게 관리할 수 있습니다.
            </p>
          </div>

          {/* 핵심 기능 안내 3단 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-muted/50 border border-border/70 text-left">
              <div className="w-8 h-8 rounded-xl bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center mb-2 shadow-2xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h4 className="text-xs font-bold text-foreground">안전한 개인화 저장소</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                내 계정 전용 Firestore 경로에 링크가 암호화되어 안전하게 보관됩니다.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/50 border border-border/70 text-left">
              <div className="w-8 h-8 rounded-xl bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center mb-2 shadow-2xs">
                <Zap className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h4 className="text-xs font-bold text-foreground">인라인 즉시 편집</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                페이지 이동 없이 카드 자리에서 바로 제목, URL, 뱃지를 수정할 수 있습니다.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/50 border border-border/70 text-left">
              <div className="w-8 h-8 rounded-xl bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center mb-2 shadow-2xs">
                <Layers className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h4 className="text-xs font-bold text-foreground">실시간 통계 & 수정 시각</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                링크별 조회수 카운팅과 마지막 수정 시각(Updated At)을 한눈에 파악합니다.
              </p>
            </div>
          </div>

          {/* 대형 Google 로그인 CTA 버튼 */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5 justify-start">
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] font-bold text-sm shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Google 로그인 처리 중...</span>
                </>
              ) : (
                <>
                  {/* Google 'G' 로고 화이트 배경 래퍼 */}
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 p-0.5 shadow-2xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                  </div>
                  <span>Google 계정으로 시작하기</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-muted-foreground leading-relaxed break-keep">
              <span>✦ 별도의 회원가입 없이</span>
              <br />
              <span>3초 만에 바로 연동됩니다.</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
