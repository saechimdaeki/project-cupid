import { Suspense } from "react";
import { GlobalNav } from "@/components/global-nav";
import { DashboardStreamingSkeleton } from "@/components/dashboard-streaming-skeleton";
import { DashboardViewMode } from "@/lib/types";
import { requireApprovedMembership } from "@/lib/permissions";
import { DashboardMain } from "./dashboard-main";

type DashboardPageProps = {
  searchParams: Promise<{ view?: string; notice?: string; message?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [params, membership] = await Promise.all([searchParams, requireApprovedMembership()]);

  const { view, notice, message } = params;

  const bannerText =
    notice ??
    (message === "forbidden"
      ? "이 작업을 수행할 권한이 없습니다. 최고 관리자에게 문의하세요."
      : message);

  const initialView =
    view === DashboardViewMode.INVENTORY ? DashboardViewMode.INVENTORY : DashboardViewMode.FLOW;

  return (
    <>
      <GlobalNav
        membership={membership}
        active={view === DashboardViewMode.INVENTORY ? "candidates" : "dashboard"}
      />
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
      <Suspense fallback={<DashboardStreamingSkeleton />}>
        <DashboardMain membership={membership} initialView={initialView} />
      </Suspense>
    </>
  );
}
