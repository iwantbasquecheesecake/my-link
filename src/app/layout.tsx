import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "사용자 이름 | 마이링크 (MyLink)",
  description: "바이브코딩을 탐구하는 초보 개발자 OOO의 마이페이지 (MyLink)",
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
