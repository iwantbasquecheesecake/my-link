"use client";

import React from "react";
import { Check } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
}

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1E3024] text-[#F4FBF4] shadow-xl border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="w-5 h-5 rounded-full bg-[#4D6E56] flex items-center justify-center text-[#F4FBF4]">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
      <span className="text-xs sm:text-sm font-medium">{message}</span>
    </div>
  );
}
