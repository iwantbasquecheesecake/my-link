"use client";

import React, { useState, useEffect } from "react";
import { User, Sparkles, Globe, Briefcase, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkDisplayNameAvailability } from "@/lib/firebase-auth";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string; // 현재 별명 (Username)
  currentDisplayName: string; // 현재 고유 주소 ID (DisplayName)
  currentRole?: string; // 현재 직업 / 역할 소개 (Role)
  currentUid?: string;
  currentEmail?: string;
  onSave: (data: {
    username: string;
    displayName: string;
    role: string;
  }) => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentUsername,
  currentDisplayName,
  currentRole = "MyLink 크리에이터",
  currentUid,
  currentEmail,
  onSave,
}: EditProfileModalProps) {
  // 사용자가 변경 가능한 별명 (Username)
  const [username, setUsername] = useState(currentUsername);
  
  // 사용자가 변경 가능한 직업/역할 소개 (Role)
  const [role, setRole] = useState(currentRole);

  // 사용자가 변경 가능한 고유 주소 ID (DisplayName)
  const [displayName, setDisplayName] = useState(currentDisplayName);

  // DisplayName 중복 확인 상태: 'idle' | 'checking' | 'available' | 'unavailable'
  const [checkStatus, setCheckStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("available");
  const [checkMessage, setCheckMessage] = useState<string>("현재 사용 중인 본인의 고유 주소 ID입니다.");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername || "");
      setRole(currentRole || "MyLink 크리에이터");
      setDisplayName(currentDisplayName || "");
      setCheckStatus("available");
      setCheckMessage("현재 사용 중인 본인의 고유 주소 ID입니다.");
      setFormError(null);
    }
  }, [isOpen, currentUsername, currentDisplayName, currentRole]);

  // 별명 입력값 변경 핸들러
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setFormError(null);
  };

  // 직업/역할 소개 입력값 변경 핸들러
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value);
    setFormError(null);
  };

  // 고유 주소 ID(DisplayName) 변경 핸들러
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setDisplayName(val);
    setFormError(null);

    if (val.toLowerCase() === currentDisplayName.toLowerCase()) {
      setCheckStatus("available");
      setCheckMessage("현재 사용 중인 본인의 고유 주소 ID입니다.");
    } else {
      setCheckStatus("idle");
      setCheckMessage("");
    }
  };

  // 고유 주소 ID(DisplayName) 중복 확인 핸들러
  const handleCheckDuplicate = async () => {
    if (!displayName.trim()) {
      setCheckStatus("unavailable");
      setCheckMessage("고유 주소 ID를 입력해주세요.");
      return;
    }

    try {
      setCheckStatus("checking");
      setCheckMessage("중복 여부를 확인하는 중입니다...");
      const result = await checkDisplayNameAvailability(displayName, currentUid);

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
    const cleanRole = role.trim();
    const cleanDisplayName = displayName.trim();

    if (!cleanUsername) {
      setFormError("별명(Username)을 입력해주세요.");
      return;
    }

    if (!cleanDisplayName) {
      setFormError("고유 주소 ID(Display Name)를 입력해주세요.");
      return;
    }

    if (cleanDisplayName.length < 2 || cleanDisplayName.length > 20) {
      setFormError("고유 주소 ID는 2자 이상 20자 이하로 입력해주세요.");
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(cleanDisplayName)) {
      setFormError("고유 주소 ID는 영문, 숫자, 밑줄(_), 하이픈(-), 마침표(.)만 사용 가능합니다.");
      return;
    }

    // DisplayName이 변경되었는데 중복 확인을 통과하지 않은 경우
    if (
      cleanDisplayName.toLowerCase() !== currentDisplayName.toLowerCase() &&
      checkStatus !== "available"
    ) {
      setFormError("고유 주소 ID 중복 확인을 먼저 완료해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        username: cleanUsername,
        displayName: cleanDisplayName,
        role: cleanRole || "MyLink 크리에이터",
      });
      onClose();
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      setFormError("프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisplayNameChanged =
    displayName.trim().toLowerCase() !== currentDisplayName.toLowerCase();

  const isSaveDisabled =
    isSubmitting ||
    !username.trim() ||
    !displayName.trim() ||
    (isDisplayNameChanged && checkStatus !== "available");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent onClose={onClose} className="sm:max-w-[480px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-[#D6E1D8]/60 dark:bg-[#1E3024] text-[#4D6E56] flex items-center justify-center shrink-0 mb-1">
            <User className="w-5 h-5 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            프로필 정보 수정
          </DialogTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            별명(Username), 직업/역할 소개(Role), 나만의 고유 링크 주소(Display Name)를 수정할 수 있습니다.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* 1. 내 별명 (Username) */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-[#4D6E56]/30 dark:border-[#4D6E56]/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>1. 내 별명 (Username)</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-[#4D6E56]/15 text-[#4D6E56] text-[10px]">
                  프로필 이름
                </span>
              </label>
              <span className="text-[11px] text-muted-foreground">최대 30자</span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              프로필 카드 상단에 크게 노출되는 나만의 이름/닉네임입니다. 언제든 원하는 이름으로 자유롭게 변경할 수 있어요.
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

          {/* 2. 직업 및 역할 소개 (Role) */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-[#4D6E56]/30 dark:border-[#4D6E56]/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>2. 직업 및 역할 (Role)</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-[#4D6E56]/15 text-[#4D6E56] text-[10px]">
                  한 줄 소개
                </span>
              </label>
              <span className="text-[11px] text-muted-foreground">최대 30자</span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              별명 바로 밑에 표시될 나의 직업, 역할, 전문 분야 등을 입력하세요.
            </p>

            <Input
              type="text"
              placeholder="예: 프론트엔드 개발자, UI/UX 디자이너, 대학생, 크리에이터"
              value={role}
              onChange={handleRoleChange}
              maxLength={30}
              className="text-xs h-10 font-medium bg-background"
            />
          </div>

          {/* 3. 고유 주소 ID (Display Name) */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>3. 고유 주소 ID (Display Name)</span>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md bg-muted text-foreground text-[10px] border border-border">
                  내 링크 주소
                </span>
              </label>
              <span className="text-[11px] text-muted-foreground">영문/숫자 2~20자</span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              내 MyLink 공개 페이지 주소(<code>/{displayName || "아이디"}</code>)에 사용되는 고유 아이디입니다.
              원하는 아이디로 변경할 수 있으며, 중복을 방지하기 위해 <strong>중복 확인</strong>이 필요합니다.
            </p>

            {/* 입력창 & 중복 확인 버튼 */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="예: narin31005"
                value={displayName}
                onChange={handleDisplayNameChange}
                maxLength={20}
                className="text-xs h-10 font-medium font-mono flex-1 bg-background"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCheckDuplicate}
                disabled={checkStatus === "checking" || !displayName.trim()}
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

            {isDisplayNameChanged && checkStatus === "idle" && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ 주소 ID가 변경되었습니다. 저장 전 중복 확인을 진행해주세요.
              </p>
            )}

            {/* 주소 미리보기 박스 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/80 border border-border/70 text-xs">
              <span className="text-[11px] font-mono select-none text-muted-foreground">
                접속 주소 미리보기:
              </span>
              <span className="font-bold text-[#4D6E56] font-mono truncate">
                mylink.com/{displayName.trim() || "id"}
              </span>
            </div>
          </div>

          {/* 폼 에러 메시지 */}
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
