"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Sparkles, Check, Globe, Copy, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string; // 사용자가 변경 가능한 별명 (Username)
  currentDisplayName: string; // 가입 시 이메일 앞부분 기반 고유 URL 식별자 (DisplayName)
  currentEmail?: string;
  onSave: (data: { username: string; name?: string }) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentUsername,
  currentDisplayName,
  currentEmail,
  onSave,
}: EditProfileModalProps) {
  // 사용자가 변경 가능한 별명 (Username)
  const [username, setUsername] = useState(currentUsername);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || "");
      setFormError(null);
      setCopied(false);
    }
  }, [isOpen, currentUsername]);

  // 별명 입력값 변경 핸들러
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setFormError(null);
  };

  // 주소 URL 복사 핸들러
  const handleCopyUrl = async () => {
    if (typeof window === "undefined" || !currentDisplayName) return;
    const profileUrl = `${window.location.origin}/${currentDisplayName}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사 실패 무시
    }
  };

  // 폼 제출 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setFormError("별명(Username)을 입력해주세요.");
      return;
    }

    if (cleanUsername.length < 1 || cleanUsername.length > 30) {
      setFormError("별명은 1자 이상 30자 이하로 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        username: cleanUsername,
        name: cleanUsername,
      });
      onClose();
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      setFormError("프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled = isSubmitting || !username.trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent onClose={onClose} className="sm:max-w-[460px] p-6">
        <DialogHeader className="text-left space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-[#D6E1D8]/60 dark:bg-[#1E3024] text-[#4D6E56] flex items-center justify-center shrink-0 mb-1">
            <User className="w-5 h-5 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            프로필 정보 수정
          </DialogTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            프로필에 노출될 별명(Username)과 고유 MyLink 주소(Display Name)를 확인하고 관리하세요.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* 1. 사용자가 자유롭게 변경할 수 있는 별명 (Username) */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-[#4D6E56]/30 dark:border-[#4D6E56]/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>내 별명 (Username)</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-[#4D6E56]/15 text-[#4D6E56] text-[10px]">
                  수정 가능
                </span>
              </label>
              <span className="text-[11px] text-muted-foreground">최대 30자</span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              프로필 카드 상단에 크게 표시되는 나만의 호칭/닉네임입니다. 언제든지 원하는 이름으로 바꿀 수 있어요.
            </p>

            <Input
              type="text"
              placeholder="예: 나린, 아무개, 개발자 린"
              value={username}
              onChange={handleUsernameChange}
              maxLength={30}
              className="text-xs h-10 font-medium bg-background"
              autoFocus
            />
          </div>

          {/* 2. 가입 시 자동 설정된 고유 URL 주소 (Display Name) - 헷갈림 방지를 위한 명확한 구분 */}
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span>고유 주소 ID (Display Name)</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] border border-border">
                  <Lock className="w-2.5 h-2.5" />
                  <span>고유 URL • 변경 불가</span>
                </span>
              </label>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              내 MyLink 공유 주소(<code>/{currentDisplayName}</code>)에 사용되는 고유 아이디입니다.
              가입 시 이메일 아이디(<code>{currentEmail || `${currentDisplayName}@...`}</code>)로 자동 생성되며 고정됩니다.
            </p>

            {/* 고유 주소 미리보기 카드 & 복사 버튼 */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-background border border-border/70 text-xs">
              <div className="flex items-center gap-1.5 min-w-0 text-muted-foreground">
                <span className="text-[11px] font-mono select-none text-muted-foreground/70">
                  mylink.com/
                </span>
                <span className="font-bold text-foreground font-mono truncate">
                  {currentDisplayName}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-lg text-[11px] font-semibold text-[#4D6E56] hover:bg-[#4D6E56]/10 border border-[#4D6E56]/30 transition-colors cursor-pointer"
                title="내 고유 주소 복사하기"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-[#4D6E56]" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>주소 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 에러 메시지 표시 */}
          {formError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {formError}
            </p>
          )}

          {/* 하단 모달 액션 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-3.5 text-xs font-semibold rounded-xl"
            >
              취소
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaveDisabled}
              className="h-9 px-4 text-xs font-bold bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] rounded-xl cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "저장 중..." : "변경사항 저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
