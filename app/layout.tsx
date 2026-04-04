import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Project Cupid",
  description: "신뢰 가능한 소개팅 매물과 매칭 이력을 관리하는 프라이빗 보드",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", pretendard.variable)}>
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
