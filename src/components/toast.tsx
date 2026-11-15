"use client";

import React, { useMemo } from "react";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, X } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose?: () => void;
}

export function Toast({ message, visible, onClose }: ToastProps) {
  if (!visible || !message) return null;

  // 메시지 내용에 따른 Sonner 스타일 타입 자동 감지
  const toastType = useMemo(() => {
    if (/실패|오류|닫혔습니다/.test(message)) return "error";
    if (/삭제/.test(message)) return "destructive";
    if (/중입니다|확인 중|여는 중|불러오는 중/.test(message)) return "loading";
    if (/완료|성공|등록되었습니다|복사되었습니다|환영합니다|저장되었습니다/.test(message)) return "success";
    return "info";
  }, [message]);

  return (
    <aside
      aria-label="알림"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[92vw] sm:max-w-[460px] pointer-events-auto select-none"
    >
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 dark:bg-[#1E3024]/95 backdrop-blur-md border border-[#4D6E56]/30 dark:border-[#4D6E56]/50 shadow-[0_12px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] text-foreground animate-in fade-in slide-in-from-top-4 duration-250 ease-out transition-all"
      >
        {/* Sonner 스타일 상태 아이콘 뱃지 */}
        <div className="shrink-0 flex items-center justify-center">
          {toastType === "loading" && (
            <div className="w-6 h-6 rounded-full bg-[#4D6E56]/15 text-[#4D6E56] flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
            </div>
          )}
          {toastType === "success" && (
            <div className="w-6 h-6 rounded-full bg-[#4D6E56] text-[#F4FBF4] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {(toastType === "error" || toastType === "destructive") && (
            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
              <AlertCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
          {toastType === "info" && (
            <div className="w-6 h-6 rounded-full bg-[#D6E1D8]/70 dark:bg-[#273A2D] text-[#4D6E56] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* 가독성을 높인 텍스트 영역 */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs sm:text-[13px] font-bold text-[#1E3024] dark:text-[#F4FBF4] leading-snug tracking-tight break-keep">
            {message}
          </p>
        </div>

        {/* Sonner 스타일 닫기 (Dismiss) 버튼 */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
            title="알림 닫기"
            aria-label="알림 닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
}
