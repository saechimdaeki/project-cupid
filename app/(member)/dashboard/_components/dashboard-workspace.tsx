"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type DashboardBoardCandidate } from "./dashboard-flow-board";
import { DashboardContent } from "./dashboard-content";
import { DashboardStatBar } from "./dashboard-stat-bar";
import { DashboardToolbar } from "./dashboard-toolbar";
import { DashboardViewToggle } from "./dashboard-view-toggle";
import { DashboardViewMode } from "@/lib/types";
import type { AppRole, Candidate, TimelineEvent } from "@/lib/types";

type DashboardWorkspaceProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
  role: AppRole;
  initialView?: DashboardViewMode;
};

export function DashboardWorkspace({
  candidates,
  timelineEvents,
  role,
  initialView = DashboardViewMode.FLOW,
}: DashboardWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawView = searchParams.get("view");
  const [view, setView] = useState<DashboardViewMode>(
    rawView === DashboardViewMode.INVENTORY ? DashboardViewMode.INVENTORY : initialView,
  );
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [gender, setGender] = useState(searchParams.get("gender") ?? "");
  const [religion, setReligion] = useState(searchParams.get("religion") ?? "");
  const deferredSearch = useDeferredValue(search);

  const isInventoryView = view === DashboardViewMode.INVENTORY;

  const updateUrl = (next: { view: DashboardViewMode; search: string; status: string; gender: string; religion: string }) => {
    const params = new URLSearchParams();
    if (next.view !== DashboardViewMode.FLOW) params.set("view", next.view);
    if (next.search) params.set("search", next.search);
    if (next.status) params.set("status", next.status);
    if (next.gender) params.set("gender", next.gender);
    if (next.religion) params.set("religion", next.religion);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const handleViewChange = (next: DashboardViewMode) => {
    setView(next);
    updateUrl({ view: next, search, status, gender, religion });
  };
  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateUrl({ view, search: value, status, gender, religion });
  };
  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateUrl({ view, search, status: value, gender, religion });
  };
  const handleGenderChange = (value: string) => {
    setGender(value);
    updateUrl({ view, search, status, gender: value, religion });
  };
  const handleReligionChange = (value: string) => {
    setReligion(value);
    updateUrl({ view, search, status, gender, religion: value });
  };

  const statusOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.status).filter(Boolean))).sort(),
    [candidates],
  );
  const genderOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.gender).filter(Boolean))).sort(),
    [candidates],
  );
  const religionOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.religion).filter(Boolean))).sort(),
    [candidates],
  );

  // 전체목록: status 필터 포함 전체 적용 / 플로우: active 후보에만 성별·종교·검색 적용, graduated/archived 제외
  const filteredCandidates = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (isInventoryView) {
        if (status && candidate.status !== status) return false;
        if (gender && candidate.gender !== gender) return false;
        if (religion && candidate.religion !== religion) return false;
        if (!query) return true;
      } else {
        if (candidate.status === "graduated" || candidate.status === "archived") return false;
        // matched/couple는 필터 적용 없이 항상 표시
        if (candidate.status !== "active") return true;
        if (gender && candidate.gender !== gender) return false;
        if (religion && candidate.religion !== religion) return false;
        if (!query) return true;
      }
      const haystack = [
        candidate.full_name, candidate.occupation, candidate.region,
        candidate.work_summary, candidate.personality_summary, candidate.notes_private,
        ...candidate.highlight_tags,
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [candidates, deferredSearch, isInventoryView, status, gender, religion]);

  // Candidate는 DashboardBoardCandidate의 상위집합 — 구조적 호환으로 리매핑 불필요
  const boardCandidates: DashboardBoardCandidate[] = candidates;
  const visibleBoardCandidates: DashboardBoardCandidate[] = filteredCandidates;

  return (
    <>
      {/* Stat + Toolbar — 하나의 카드 */}
      <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-md">
        <DashboardStatBar candidates={candidates} timelineEvents={timelineEvents} />
        <div className="border-t border-slate-100">
          <DashboardToolbar
            isInventoryView={isInventoryView}
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
            gender={gender}
            onGenderChange={handleGenderChange}
            religion={religion}
            onReligionChange={handleReligionChange}
            statusOptions={statusOptions}
            genderOptions={genderOptions}
            religionOptions={religionOptions}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <DashboardViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      <div className="-mt-4">
        <DashboardContent
          view={view}
          filteredCandidates={filteredCandidates}
          boardCandidates={boardCandidates}
          visibleBoardCandidates={visibleBoardCandidates}
          timelineEvents={timelineEvents}
          role={role}
        />
      </div>
    </>
  );
}
