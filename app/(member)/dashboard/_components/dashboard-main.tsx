import { ManagerDashboard } from "./manager-dashboard";
import { buildTimelineEvents, getDashboardCandidates, getDashboardTimelineData } from "@/lib/data";
import { DashboardViewMode } from "@/lib/types";
import type { Membership } from "@/lib/types";

type DashboardMainProps = {
  membership: Membership;
  initialView: DashboardViewMode;
};

export async function DashboardMain({ membership, initialView }: DashboardMainProps) {
  const [candidates, timelineData] = await Promise.all([
    getDashboardCandidates(),
    getDashboardTimelineData(),
  ]);

  const timelineEvents = buildTimelineEvents(
    timelineData.records,
    new Map(candidates.map((candidate) => [candidate.id, candidate])),
  );

  return (
    <ManagerDashboard
      candidates={candidates}
      timelineEvents={timelineEvents}
      membership={membership}
      initialView={initialView}
    />
  );
}
