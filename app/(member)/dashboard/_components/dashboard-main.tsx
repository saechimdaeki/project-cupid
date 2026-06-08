import { ManagerDashboard } from "./manager-dashboard";
import { buildTimelineEvents, getDashboardCandidates, getDashboardTimelineData } from "@/lib/data";
import { buildActiveMatchPairs } from "@/lib/match-flow-columns";
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
  const activeMatchPairs = buildActiveMatchPairs(timelineData.records);

  return (
    <ManagerDashboard
      candidates={candidates}
      timelineEvents={timelineEvents}
      activeMatchPairs={activeMatchPairs}
      membership={membership}
      initialView={initialView}
    />
  );
}
