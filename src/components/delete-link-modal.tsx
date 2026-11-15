"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, Loader2, ExternalLink } from "lucide-react";
import { LinkItem } from "@/types/mylink";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/icon-helper";

interface DeleteLinkModalProps {
  isOpen: boolean;
  link: LinkItem | null;
  onClose: () => void;
  onConfirmDelete: (linkId: string) => Promise<void> | void;
}

export function DeleteLinkModal({
  isOpen,
  link,
  onClose,
  onConfirmDelete,
}: DeleteLinkModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!link) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(link.id);
      onClose();
    } catch (error) {
      console.error("링크 삭제 실패:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent onClose={onClose} className="sm:max-w-[420px] p-6">
        <DialogHeader className="text-left space-y-2">
          {/* 상단 경고 아이콘 */}
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mb-1">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* 제목 */}
          <DialogTitle className="text-lg font-bold text-foreground">
            정말 삭제하시겠습니까?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 대상 링크 정보 표시 */}
          <div className="p-3.5 rounded-2xl bg-muted/60 border border-border flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-background border border-border/80 text-foreground flex items-center justify-center shrink-0">
              <DynamicIcon name={link.iconName} className="w-4 h-4 text-[#4D6E56]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                {link.category}
              </span>
              <h4 className="text-sm font-bold text-foreground truncate" title={link.title}>
                {link.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5" title={link.url}>
                {link.url}
              </p>
            </div>
          </div>

          {/* 경고 문구 (빨간색) */}
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
              <span>이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <p className="text-[11px] text-red-500/80 dark:text-red-400/70 mt-1 pl-3">
              삭제된 링크는 Firebase 및 마이링크 목록에서 즉시 영구 제거됩니다.
            </p>
          </div>
        </div>

        {/* 액션 버튼: 취소 / 삭제하기 */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 px-4 text-xs font-semibold rounded-xl cursor-pointer"
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-10 px-5 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>삭제 중...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>삭제하기</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
