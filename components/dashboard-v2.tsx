"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { CandidateCard } from "@/components/candidate-card";
import {
  DashboardFlowBoard,
  type DashboardBoardCandidate,
} from "@/components/dashboard-flow-board";
import { MatchDetailModal } from "@/components/match-detail-modal";
import { MatchHistoryListModal } from "@/components/match-history-list-modal";
import { SakuraRain } from "@/components/sakura-rain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { canEditCandidates } from "@/lib/role-utils";
import { getOutcomeDotClass } from "@/lib/status-ui";
import type { AppRole, Candidate, Membership, TimelineEvent } from "@/lib/types";

type DashboardV2Props = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
  membership: Membership;
  initialView?: ViewMode;
};

type ViewMode = "flow" | "inventory";

/* ─── Stat Bar ─── */

type StatItem = { label: string; value: number };

function StatBar({ stats }: { stats: StatItem[] }) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto rounded-2xl border border-white/60 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-md">
      {stats.map((stat, idx) => (
        <div key={stat.label} className="flex items-center gap-2">
          {idx > 0 ? <span className="mr-2 h-4 w-px bg-rose-200/60" aria-hidden /> : null}
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-400/90">
            {stat.label}
          </span>
          <strong className="text-lg font-semibold tracking-[-0.02em] text-slate-800">
            {stat.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

/* ─── Toolbar ─── */

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4 shrink-0 text-rose-400">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}

function CompactSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 min-w-0 rounded-lg border border-rose-100/80 bg-white/90 px-2.5 text-sm text-slate-700 outline-none transition focus:border-rose-200 focus:ring-2 focus:ring-rose-100"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/* ─── Timeline ─── */

function TimelineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
      <path d="M12 3v18" />
      <path d="M7 8h10" />
      <path d="M7 16h10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const RECENT_MATCH_LIMIT = 3;

function TimelinePanel({
  events,
  className,
  onSelectEvent,
  onViewAll,
  embedInSheet = false,
}: {
  events: TimelineEvent[];
  className?: string;
  onSelectEvent?: (event: TimelineEvent) => void;
  onViewAll?: () => void;
  embedInSheet?: boolean;
}) {
  const preview = events.slice(0, RECENT_MATCH_LIMIT);
  const showViewAll = Boolean(onViewAll && events.length > RECENT_MATCH_LIMIT);

  const list = (
    <div className="mt-4 grid gap-3">
      {events.length ? (
        preview.map((event, index) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelectEvent?.(event)}
            className="relative w-full cursor-pointer pl-6 text-left transition hover:opacity-95"
          >
            {index < preview.length - 1 ? (
              <span className="absolute left-[7px] top-7 h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-rose-200/80 to-orange-100/50" />
            ) : null}
            <span
              className={cn("absolute left-0 top-1.5 size-4 rounded-full border-[3px] border-white shadow-[0_2px_8px_rgb(244,114,182,0.2)]", getOutcomeDotClass(event.outcome))}
            />
            <div className="rounded-xl border border-rose-100/40 bg-rose-50/35 p-3">
              <div className="flex items-start justify-between gap-2">
                <strong className="text-sm font-semibold text-slate-800">{event.title}</strong>
                <span className="shrink-0 text-xs font-medium text-rose-400">{event.happened_on}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{event.summary}</p>
            </div>
          </button>
        ))
      ) : (
        <div className="rounded-xl border border-dashed border-rose-200/60 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
          최근 매칭 기록이 아직 없습니다.
        </div>
      )}
    </div>
  );

  const headerRow = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-500">
          <TimelineIcon />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-400/90">
            Recent History
          </p>
          <h3 className="text-sm font-semibold text-slate-800">최근 매칭 기록</h3>
        </div>
      </div>
      {showViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="cursor-pointer text-sm font-medium text-rose-400 transition hover:text-rose-600"
        >
          전체
        </button>
      ) : null}
    </div>
  );

  if (embedInSheet) {
    return (
      <div className={className}>
        {headerRow}
        {list}
      </div>
    );
  }

  return (
    <aside className={cn("rounded-2xl border border-white/60 bg-white/75 p-5 shadow-sm backdrop-blur-md", className)}>
      {headerRow}
      {list}
    </aside>
  );
}

/* ─── Main Dashboard ─── */

export function DashboardV2({
  candidates,
  timelineEvents,
  membership,
  initialView = "flow",
}: DashboardV2Props) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [religion, setReligion] = useState("");
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [historyListOpen, setHistoryListOpen] = useState(false);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<TimelineEvent | null>(null);
  const [isFiltering, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);
  const role: AppRole = membership.role;

  const statusOptions = ["active", "matched", "couple"];
  const genderOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.gender).filter(Boolean))).sort(),
    [candidates],
  );
  const religionOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.religion).filter(Boolean))).sort(),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (status && candidate.status !== status) return false;
      if (gender && candidate.gender !== gender) return false;
      if (religion && candidate.religion !== religion) return false;
      if (!query) return true;
      const haystack = [
        candidate.full_name, candidate.occupation, candidate.region,
        candidate.work_summary, candidate.personality_summary, candidate.notes_private,
        ...candidate.highlight_tags,
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [candidates, deferredSearch, gender, religion, status]);

  const boardCandidates: DashboardBoardCandidate[] = useMemo(
    () =>
      candidates.map((candidate) => ({
        id: candidate.id,
        full_name: candidate.full_name,
        birth_year: candidate.birth_year,
        height_text: candidate.height_text,
        gender: candidate.gender,
        region: candidate.region,
        occupation: candidate.occupation,
        work_summary: candidate.work_summary,
        religion: candidate.religion,
        personality_summary: candidate.personality_summary,
        highlight_tags: candidate.highlight_tags,
        notes_private: candidate.notes_private,
        status: candidate.status,
        paired_candidate_id: candidate.paired_candidate_id,
        image_url: candidate.image_url,
      })),
    [candidates],
  );

  const visibleBoardCandidates = useMemo(() => {
    const ids = new Set(filteredCandidates.map((candidate) => candidate.id));
    return boardCandidates.filter((candidate) => ids.has(candidate.id));
  }, [boardCandidates, filteredCandidates]);

  const candidateById = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.id, candidate])),
    [candidates],
  );

  const stats: StatItem[] = useMemo(() => [
    { label: "적극검토", value: candidates.filter((candidate) => candidate.status === "active").length },
    { label: "매칭중", value: candidates.filter((candidate) => candidate.status === "matched").length },
    { label: "커플", value: candidates.filter((candidate) => candidate.status === "couple").length },
    { label: "기록", value: timelineEvents.length },
  ], [candidates, timelineEvents.length]);

  const hasActiveFilters = Boolean(status || gender || religion || deferredSearch);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setGender("");
    setReligion("");
    setFiltersOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 to-orange-50/50 text-slate-800">
      <SakuraRain petalCount={62} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_22%_0%,rgba(255,228,230,0.6),transparent_46%),radial-gradient(ellipse_at_82%_28%,rgba(255,237,213,0.48),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(255,241,242,0.52),transparent_55%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-4 overflow-x-hidden px-4 pb-32 pt-20 md:gap-5 md:pb-20 md:px-8 lg:px-12">

        {/* ── Row 1: Stat bar ── */}
        <StatBar stats={stats} />

        {/* ── Row 2: Toolbar ── */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md">
          {/* Top row: search + view toggle */}
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-rose-100/80 bg-white/90 px-3">
              <SearchIcon />
              <input
                value={search}
                onChange={(event) => startTransition(() => setSearch(event.target.value))}
                placeholder="이름, 직업, 지역, 태그 검색"
                className="h-9 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              type="button"
              onClick={() => setFiltersOpen((current) => !current)}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl border transition lg:hidden",
                filtersOpen
                  ? "border-rose-200 bg-rose-50 text-rose-500"
                  : "border-rose-100/80 bg-white/90 text-slate-500 hover:text-rose-500",
              )}
              aria-label="필터"
            >
              <FilterIcon />
            </button>

            {/* View toggle */}
            <div className="hidden shrink-0 items-center rounded-xl border border-white/60 bg-white/60 p-0.5 sm:flex">
              <button
                type="button"
                onClick={() => setView("flow")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                  view === "flow"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                플로우
              </button>
              <button
                type="button"
                onClick={() => setView("inventory")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                  view === "inventory"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                전체 매물
              </button>
            </div>
          </div>

          {/* Mobile view toggle */}
          <div className="flex items-center rounded-xl border border-white/60 bg-white/60 p-0.5 sm:hidden">
            <button
              type="button"
              onClick={() => setView("flow")}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                view === "flow"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                  : "text-slate-500",
              )}
            >
              플로우
            </button>
            <button
              type="button"
              onClick={() => setView("inventory")}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                view === "inventory"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm"
                  : "text-slate-500",
              )}
            >
              전체 매물
            </button>
          </div>

          {/* Filters row (desktop: always, mobile: toggle) */}
          <div className={cn(filtersOpen ? "flex" : "hidden", "flex-wrap items-center gap-2 lg:flex")}>
            <CompactSelect value={status} options={statusOptions} placeholder="상태" onChange={setStatus} />
            <CompactSelect value={gender} options={genderOptions} placeholder="성별" onChange={setGender} />
            <CompactSelect value={religion} options={religionOptions} placeholder="종교" onChange={setReligion} />
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
              >
                초기화
              </button>
            ) : null}
          </div>

          {/* Active filter badges */}
          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              {status ? (
                <Badge className="rounded-full bg-rose-100/80 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                  {status}
                </Badge>
              ) : null}
              {gender ? (
                <Badge className="rounded-full bg-orange-100/80 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                  {gender}
                </Badge>
              ) : null}
              {religion ? (
                <Badge className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-500">
                  {religion}
                </Badge>
              ) : null}
              {deferredSearch ? (
                <Badge className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                  &quot;{deferredSearch}&quot;
                </Badge>
              ) : null}
              <span className="text-xs text-slate-500">
                {isFiltering ? "필터 적용 중..." : `${filteredCandidates.length}명`}
              </span>
            </div>
          ) : null}
        </div>

        {/* ── Row 3: Content ── */}
        {view === "flow" ? (
          <section className="rounded-2xl border border-white/50 bg-transparent p-1">
            <DashboardFlowBoard
              candidates={visibleBoardCandidates}
              allCandidates={boardCandidates}
              role={role}
            />
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
            <div className="grid gap-5">
              {filteredCandidates.length ? (
                filteredCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} role={role} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-rose-200/70 bg-white/60 px-6 py-14 text-center text-sm text-slate-500 backdrop-blur-sm">
                  조건에 맞는 후보가 없습니다.
                </div>
              )}
            </div>

            <div className="hidden xl:block">
              <TimelinePanel
                events={timelineEvents}
                className="sticky top-20 w-full"
                onSelectEvent={(event) => setSelectedTimelineEvent(event)}
                onViewAll={() => setHistoryListOpen(true)}
              />
            </div>
          </section>
        )}

        {/* Timeline floating button (inventory, mobile) */}
        {view === "inventory" ? (
          <>
            <Button
              onClick={() => setTimelineOpen(true)}
              className="fixed bottom-24 right-6 z-30 size-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-[0_12px_40px_rgb(244,114,182,0.45)] transition hover:scale-[1.03] md:bottom-6 xl:hidden"
              aria-label="최근 매칭 기록 열기"
            >
              <TimelineIcon />
            </Button>

            {timelineOpen ? (
              <div className="fixed inset-0 z-50 flex items-end bg-slate-900/30 backdrop-blur-[2px] xl:hidden">
                <button
                  type="button"
                  aria-label="닫기"
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setTimelineOpen(false)}
                />
                <div className="relative w-full rounded-t-[28px] border border-white/60 bg-gradient-to-b from-rose-50/95 to-pink-50/90 p-5 shadow-2xl">
                  <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-rose-200/80" />
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setTimelineOpen(false)}
                      className="cursor-pointer text-sm font-medium text-rose-500 transition hover:text-rose-700"
                    >
                      닫기
                    </button>
                  </div>
                  <TimelinePanel
                    embedInSheet
                    events={timelineEvents}
                    onSelectEvent={(event) => {
                      setTimelineOpen(false);
                      setSelectedTimelineEvent(event);
                    }}
                    onViewAll={() => {
                      setTimelineOpen(false);
                      setHistoryListOpen(true);
                    }}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {!canEditCandidates(role) ? (
          <div className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4 text-sm text-slate-600 backdrop-blur-md">
            현재 권한은 보기 전용입니다. 상세 이동과 상태 변경은 어드민 이상 권한에서 가능합니다.
          </div>
        ) : null}
      </main>

      <MatchHistoryListModal
        open={historyListOpen}
        events={timelineEvents}
        onClose={() => setHistoryListOpen(false)}
        onPick={(event) => {
          setHistoryListOpen(false);
          setSelectedTimelineEvent(event);
        }}
      />
      <MatchDetailModal
        event={selectedTimelineEvent}
        candidateById={candidateById}
        onClose={() => setSelectedTimelineEvent(null)}
      />
    </div>
  );
}
