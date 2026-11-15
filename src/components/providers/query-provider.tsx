"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // QueryClient 인스턴스를 컴포넌트 생명주기 동안 유지
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3, // 3분간 캐시 신선도 유지
            gcTime: 1000 * 60 * 10,    // 10분간 가비지 컬렉션 유예
            refetchOnWindowFocus: true, // 탭 복귀 시 자동 최신화
            retry: 1,                  // 실패 시 1회 재시도
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
