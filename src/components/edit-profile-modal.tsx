"use client";

import React, { useState, useEffect } from "react";
import { User, CheckCircle2, AlertCircle, Loader2, AtSign, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkUsernameAvailability } from "@/lib/firebase-auth";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentName: string;
  currentUid: string;
  onSave: (data: { username: string; name: string }) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentUsername,
  currentName,
  currentUid,
  onSave,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [name, setName] = useState(currentName);

  // 중복 확인 상태: 'idle' | 'checking' | 'available' | 'unavailable'
  const [checkStatus, setCheckStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [checkMessage, setCheckMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || "");
      setName(currentName || "");
      setCheckStatus("available");
      setCheckMessage("현재 사용 중인 본인의 Username입니다.");
      setFormError(null);
    }
  }, [isOpen, currentUsername, currentName]);

  // Username 입력값 변경 핸들러
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setUsername(val);
    setFormError(null);

    if (val.toLowerCase() === currentUsername.toLowerCase()) {
      setCheckStatus("available");
      setCheckMessage("현재 사용 중인 본인의 Username입니다.");
    } else {
      setCheckStatus("idle");
      setCheckMessage("");
    }
  };

  // 이름 입력값 변경 핸들러
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setFormError(null);
  };

  // 중복 확인 실행 핸들러
  const handleCheckDuplicate = async () => {
    if (!username.trim()) {
      setCheckStatus("unavailable");
      setCheckMessage("Username을 입력해주세요.");
      return;
    }

    try {
      setCheckStatus("checking");
      setCheckMessage("중복 여부를 확인하는 중입니다...");
      const result = await checkUsernameAvailability(username, currentUid);

      if (result.available) {
        setCheckStatus("available");
        setCheckMessage(result.message);
      } else {
        setCheckStatus("unavailable");
        setCheckMessage(result.message);
      }
    } catch {
      setCheckStatus("unavailable");
      setCheckMessage("중복 확인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 폼 제출 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = username.trim();
    const cleanName = name.trim();

    if (!cleanUsername) {
      setFormError("Username(Display Name)을 입력해주세요.");
      return;
    }

    if (!cleanName) {
      setFormError("이름을 입력해주세요.");
      return;
    }

    if (cleanName.length < 2 || cleanName.length > 30) {
      setFormError("이름은 2자 이상 30자 이하로 입력해주세요.");
      return;
    }

    // Username이 변경되었는데 중복 확인을 통과하지 않은 경우
    if (cleanUsername.toLowerCase() !== currentUsername.toLowerCase() && checkStatus !== "available") {
      setFormError("Username 중복 확인을 먼저 완료해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        username: cleanUsername,
        name: cleanName,
      });
      onClose();
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      setFormError("프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled =
    isSubmitting ||
    !name.trim() ||
    !username.trim() ||
    (username.trim().toLowerCase() !== currentUsername.toLowerCase() && checkStatus !== "available");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent onClose={onClose} className="sm:max-w-[440px] p-6">
        <DialogHeader className="text-left space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-[#D6E1D8]/60 dark:bg-[#1E3024] text-[#4D6E56] flex items-center justify-center shrink-0 mb-1">
            <User className="w-5 h-5 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            프로필 정보 수정
          </DialogTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            마이페이지에 표시될 Username과 이름을 변경할 수 있습니다.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* 1. Username (Display Name) 입력 및 중복 확인 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <AtSign className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>Username (Display Name)</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">영문/숫자 2~20자</span>
            </div>

            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="예: narin31005"
                value={username}
                onChange={handleUsernameChange}
                maxLength={20}
                className="text-xs h-10 flex-1 font-medium"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCheckDuplicate}
                disabled={checkStatus === "checking" || !username.trim()}
                className="h-10 px-3 text-xs font-bold text-[#4D6E56] border-[#4D6E56]/40 hover:bg-[#4D6E56] hover:text-[#F4FBF4] shrink-0 cursor-pointer transition-colors"
              >
                {checkStatus === "checking" ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    <span>확인 중</span>
                  </>
                ) : (
                  <span>중복 확인</span>
                )}
              </Button>
            </div>

            {/* 중복 확인 피드백 메시지 */}
            {checkMessage && (
              <div
                className={`flex items-center gap-1.5 text-[11px] font-medium pt-0.5 ${
                  checkStatus === "available"
                    ? "text-[#4D6E56] dark:text-[#8FA594]"
                    : checkStatus === "unavailable"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {checkStatus === "available" && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                {checkStatus === "unavailable" && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>{checkMessage}</span>
              </div>
            )}

            {checkStatus === "idle" && username.trim().toLowerCase() !== currentUsername.toLowerCase() && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Username이 변경되었습니다. 저장 전 중복 확인을 진행해주세요.
              </p>
            )}
          </div>

          {/* 2. 이름 (Name) 입력 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>이름 (Name)</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">최대 30자</span>
            </div>

            <Input
              type="text"
              placeholder="예: 홍길동, 나린"
              value={name}
              onChange={handleNameChange}
              maxLength={30}
              className="text-xs h-10 font-medium"
            />
          </div>

          {/* 폼 에러 메시지 */}
          {formError && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 저장 및 취소 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaveDisabled}
              className="h-9 px-4 text-xs font-bold bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                  저장하기
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
