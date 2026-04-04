import { GlobalNav } from "@/components/global-nav";
import { ManagerDashboard } from "@/components/manager-dashboard";
import { DashboardViewMode } from "@/lib/types";
import {
  buildTimelineEvents,
  getDashboardCandidates,
  getDashboardTimelineData,
} from "@/lib/data";
import { dashboardPreviewMatchRecords, homePreviewCandidates } from "@/lib/preview-scene";
import { requireApprovedMembership } from "@/lib/permissions";

type DashboardPageProps = {
  searchParams: Promise<{ view?: string; notice?: string; message?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [{ view, notice, message }, membership, fetchedCandidates, timelineData] = await Promise.all([
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

  const bannerText =
    notice ??
    (message === "forbidden"
      ? "이 작업을 수행할 권한이 없습니다. 최고 관리자에게 문의하세요."
      : message);

  return (
    <>
      <GlobalNav membership={membership} active={view === DashboardViewMode.INVENTORY ? "candidates" : "dashboard"} />
      {bannerText ? (
        <div
          className="fixed inset-x-0 top-[4.25rem] z-30 flex justify-center px-4 sm:top-[4.5rem]"
          role="status"
        >
          <p className="max-w-lg rounded-2xl border border-amber-200/80 bg-amber-50/95 px-4 py-2.5 text-center text-sm font-medium text-amber-900 shadow-lg backdrop-blur-sm">
            {bannerText}
          </p>
        </div>
      ) : null}
      <ManagerDashboard
        candidates={candidates}
        timelineEvents={timelineEvents}
        membership={membership}
        initialView={view === DashboardViewMode.INVENTORY ? DashboardViewMode.INVENTORY : DashboardViewMode.FLOW}
      />
    </>
  );
}
