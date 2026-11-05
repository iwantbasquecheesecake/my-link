import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyLink (마이링크)",
  description: "나만의 링크 모음 페이지 - 마이링크",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
