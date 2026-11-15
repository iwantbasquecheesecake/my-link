import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12 selection:bg-[#4D6E56] selection:text-[#F4FBF4]">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-[24px] bg-card border border-border/80 shadow-gs-card animate-in fade-in duration-300">
        {/* 상단 404 아이콘 */}
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* 안내 텍스트 */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#4D6E56] uppercase tracking-wider bg-[#4D6E56]/10 px-2.5 py-1 rounded-full border border-[#4D6E56]/20">
            404 Not Found
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground pt-1">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-keep">
            요청하신 Username의 MyLink 사용자가 존재하지 않거나, 주소가 잘못 입력되었을 수 있습니다.
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] h-10 px-5 text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
