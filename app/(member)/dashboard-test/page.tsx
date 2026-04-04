import { GlobalNav } from "@/components/global-nav";
import { DashboardV2 } from "@/components/dashboard-v2";
import {
  buildTimelineEvents,
  getDashboardCandidates,
  getDashboardTimelineData,
} from "@/lib/data";
import { dashboardPreviewMatchRecords, homePreviewCandidates } from "@/lib/preview-scene";
import { requireApprovedMembership } from "@/lib/permissions";
import { DashboardViewMode } from "@/lib/types";

type DashboardTestPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function DashboardTestPage({ searchParams }: DashboardTestPageProps) {
  const [{ view }, membership, fetchedCandidates, timelineData] = await Promise.all([
    searchParams,
    requireApprovedMembership(),
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
    <>
      <GlobalNav membership={membership} active={view === DashboardViewMode.INVENTORY ? "candidates" : "dashboard"} />
      <DashboardV2
        candidates={candidates}
        timelineEvents={timelineEvents}
        membership={membership}
        initialView={view === DashboardViewMode.INVENTORY ? DashboardViewMode.INVENTORY : DashboardViewMode.FLOW}
      />
    </>
  );
}
