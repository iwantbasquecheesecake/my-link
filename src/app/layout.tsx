import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "MyLink | 나만의 프로필 링크 모음",
  description: "나만의 링크와 프로필을 한곳에서 자유롭게 관리하고 공유하는 MyLink 서비스입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-background text-foreground min-h-screen">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
