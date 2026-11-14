import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "김나린 | 마이링크 (MyLink)",
  description: "공간 데이터 시각화와 모던 웹 프론트엔드 개발자 김나린의 링크트리 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
