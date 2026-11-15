"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// 자기소개 말풍선 삭제 모달
interface DeleteBioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function DeleteBioModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteBioModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("자기소개 삭제 실패:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent onClose={onClose} className="sm:max-w-[400px] p-6">
        <DialogHeader className="text-left space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mb-1">
            <Trash2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            자기소개를 삭제하시겠습니까?
          </DialogTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            프로필 사진 위에 표시되던 말풍선 내용이 삭제됩니다. 삭제 후에도 언제든지 새로운 자기소개를 다시 작성하실 수 있습니다.
          </p>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            취소
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-xs"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
                삭제하기
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
