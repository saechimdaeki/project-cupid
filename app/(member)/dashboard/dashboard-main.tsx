import { ManagerDashboard } from "@/components/manager-dashboard";
import {
  buildTimelineEvents,
  getDashboardCandidates,
  getDashboardTimelineData,
} from "@/lib/data";
import { dashboardPreviewMatchRecords, homePreviewCandidates } from "@/lib/preview-scene";
import { DashboardViewMode } from "@/lib/types";
import type { Membership } from "@/lib/types";

type DashboardMainProps = {
  membership: Membership;
  initialView: DashboardViewMode;
};

export async function DashboardMain({ membership, initialView }: DashboardMainProps) {
  const [fetchedCandidates, timelineData] = await Promise.all([
    getDashboardCandidates(),
    getDashboardTimelineData(),
  ]);

  const isPreviewMode = fetchedCandidates.length === 0;
  const candidates = isPreviewMode ? homePreviewCandidates : fetchedCandidates;
  const records = isPreviewMode ? dashboardPreviewMatchRecords : timelineData.records;
  const timelineEvents = buildTimelineEvents(
    records,
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
