"use client";

import { DashboardWorkspace } from "./dashboard-workspace";
import { SakuraRain } from "@/components/sakura-rain";
import { useDashboardCandidateSignedImages } from "@/hooks/useDashboardCandidateSignedImages";
import { DashboardViewMode } from "@/lib/types";
import type { Candidate, Membership, TimelineEvent } from "@/lib/types";

type ManagerDashboardProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
  membership: Membership;
  initialView?: DashboardViewMode;
};

export function ManagerDashboard({
  candidates: candidatesFromServer,
  timelineEvents,
  membership,
  initialView = DashboardViewMode.FLOW,
}: ManagerDashboardProps) {
  const candidates = useDashboardCandidateSignedImages(candidatesFromServer);

  return (
    <div className="relative min-h-dvh bg-gradient-to-br from-rose-50 to-orange-50/50 text-slate-800 xl:h-dvh xl:overflow-hidden">
      <SakuraRain petalCount={62} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_22%_0%,rgba(255,228,230,0.6),transparent_46%),radial-gradient(ellipse_at_82%_28%,rgba(255,237,213,0.48),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(255,241,242,0.52),transparent_55%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-8 overflow-x-hidden px-4 pb-6 pt-24 md:px-8 lg:px-12">
        <DashboardWorkspace
          candidates={candidates}
          timelineEvents={timelineEvents}
          role={membership.role}
          initialView={initialView}
        />
      </main>
    </div>
  );
}
