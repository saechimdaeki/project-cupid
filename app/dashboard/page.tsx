import { GlobalNav } from "@/components/global-nav";
import { ManagerDashboard } from "@/components/manager-dashboard";
import {
  buildTimelineEvents,
  getDashboardCandidates,
  getDashboardTimelineData,
} from "@/lib/data";
import { dashboardPreviewMatchRecords, homePreviewCandidates } from "@/lib/preview-scene";
import { requireApprovedMembership } from "@/lib/permissions";

type DashboardPageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
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
      <GlobalNav membership={membership} active={view === "inventory" ? "candidates" : "dashboard"} />
      <ManagerDashboard
        candidates={candidates}
        timelineEvents={timelineEvents}
        membership={membership}
        initialView={view === "inventory" ? "inventory" : "flow"}
      />
    </>
  );
}
