"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("관리자 비밀번호를 입력해주세요.");
      return;
    }

    if (password === "admin1234" || password === "1234" || password.length >= 4) {
      setError("");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPassword("");
        onClose();
        alert("관리자 인증이 확인되었습니다! (추후 관리자 페이지 연동)");
      }, 1000);
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#1E3024] text-[#F4FBF4] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>관리자 모드 인증</DialogTitle>
              <DialogDescription>
                시크릿 제스처 또는 단축키로 진입하셨습니다.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-2 animate-in zoom-in duration-200">
            <ShieldCheck className="w-12 h-12 text-[#4D6E56] mx-auto" />
            <p className="text-sm font-bold text-[#4D6E56]">인증 성공!</p>
            <p className="text-xs text-muted-foreground">관리자 모드로 전환 중입니다...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-[#4D6E56]" />
                <span>비밀번호</span>
              </label>
              <Input
                type="password"
                placeholder="비밀번호 입력 (기본: 1234)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoFocus
              />
              {error && (
                <p className="text-[11px] text-red-500 font-medium">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#4D6E56] hover:bg-[#3D5744] text-[#F4FBF4] font-bold text-xs sm:text-sm rounded-xl"
            >
              <span>관리자 로그인</span>
              <ArrowRight className="w-4 h-4 text-[#F4FBF4]" />
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
