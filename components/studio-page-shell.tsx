"use client";

import { SakuraRain } from "@/components/sakura-rain";

type StudioPageShellProps = {
  children: React.ReactNode;
  /** 기본 58 — 메인 홈과 비슷한 밀도 */
  petalCount?: number;
};

/**
 * 대시보드·매물 상세 등 스튜디오 화면 공통: 로맨틱 그라데이션 + 벚꽃 레이어
 */
export function StudioPageShell({ children, petalCount = 58 }: StudioPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 to-orange-50/50 text-slate-800">
      <SakuraRain petalCount={petalCount} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(255,228,230,0.65),transparent_48%),radial-gradient(ellipse_at_78%_18%,rgba(255,237,213,0.5),transparent_44%),radial-gradient(circle_at_50%_100%,rgba(255,241,242,0.55),transparent_56%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
