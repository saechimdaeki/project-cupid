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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { canEditCandidates } from "@/lib/role-utils";
import { getOutcomeDotClass } from "@/lib/status-ui";
import type { AppRole, Candidate, Membership, TimelineEvent } from "@/lib/types";

type ManagerDashboardProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
  membership: Membership;
  initialView?: ViewMode;
};

type ViewMode = "flow" | "inventory";

function ViewSegmentControl({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  return (
    <div className="relative flex w-full max-w-xl rounded-full border border-white/60 bg-white/75 p-1.5 shadow-[0_12px_40px_rgba(244,114,182,0.15),inset_0_2px_16px_rgba(244,114,182,0.12)] backdrop-blur-md">
      <span
        className={cn(
          "pointer-events-none absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-full bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_8px_28px_rgba(244,114,182,0.45)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          view === "flow" ? "left-1.5" : "left-[calc(50%+3px)]",
        )}
        aria-hidden
      />
      <Button
        variant="ghost"
        onClick={() => onChange("flow")}
        className={cn(
          "relative z-10 flex-1 rounded-full px-4 py-3 text-sm font-semibold tracking-[-0.02em] transition-colors duration-500 ease-out sm:px-6",
          view === "flow" ? "text-white hover:bg-transparent hover:text-white" : "text-rose-400 hover:bg-transparent hover:text-rose-600",
        )}
      >
        플로우 보드
      </Button>
      <Button
        variant="ghost"
        onClick={() => onChange("inventory")}
        className={cn(
          "relative z-10 flex-1 rounded-full px-4 py-3 text-sm font-semibold tracking-[-0.02em] transition-colors duration-500 ease-out sm:px-6",
          view === "inventory" ? "text-white hover:bg-transparent hover:text-white" : "text-rose-400 hover:bg-transparent hover:text-rose-600",
        )}
      >
        전체 매물
      </Button>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3v18" />
      <path d="M7 8h10" />
      <path d="M7 16h10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-rose-100/80 bg-white/90 px-3 text-sm text-slate-700 outline-none shadow-[0_4px_20px_rgb(244,114,182,0.06)] transition focus:border-rose-200 focus:ring-2 focus:ring-rose-100"
      >
        <option value="">전체</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const RECENT_MATCH_LIMIT = 3;

function TimelinePanel({
  events,
  className = "",
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
    <div className="mt-6 grid gap-4">
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
              className={cn("absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] border-white shadow-[0_2px_8px_rgb(244,114,182,0.2)]", getOutcomeDotClass(event.outcome))}
            />
            <div className="rounded-2xl border border-rose-100/40 bg-rose-50/35 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm font-semibold text-slate-800">{event.title}</strong>
                <span className="shrink-0 text-xs font-medium text-rose-400">{event.happened_on}</span>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{event.summary}</p>
            </div>
          </button>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-rose-200/60 bg-white/60 px-4 py-6 text-center text-sm text-slate-500">
          최근 매칭 기록이 아직 없습니다.
        </div>
      )}
    </div>
  );

  const headerRow = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-500">
          <TimelineIcon />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400/90">
            Recent Matching History
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-800">최근 매칭 기록</h3>
        </div>
      </div>
      {showViewAll ? (
        <Button
          variant="ghost"
          onClick={onViewAll}
          className="shrink-0 text-sm text-rose-400 hover:bg-transparent hover:text-rose-600"
        >
          전체보기
        </Button>
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
    <aside
      className={cn("w-full rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_12px_40px_rgb(244,114,182,0.1)] backdrop-blur-md", className)}
    >
      {headerRow}
      {list}
    </aside>
  );
}

export function ManagerDashboard({
  candidates,
  timelineEvents,
  membership,
  initialView = "flow",
}: ManagerDashboardProps) {
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
    () =>
      Array.from(new Set(candidates.map((candidate) => candidate.religion).filter(Boolean))).sort(),
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
        candidate.full_name,
        candidate.occupation,
        candidate.region,
        candidate.work_summary,
        candidate.personality_summary,
        candidate.notes_private,
        ...candidate.highlight_tags,
      ]
        .join(" ")
        .toLowerCase();

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

  const openMatchDetail = (event: TimelineEvent) => {
    setSelectedTimelineEvent(event);
  };

  const stats = useMemo(
    () => [
      {
        label: "적극검토",
        value: candidates.filter((candidate) => candidate.status === "active").length,
      },
      {
        label: "매칭진행중",
        value: candidates.filter((candidate) => candidate.status === "matched").length,
      },
      {
        label: "커플완성",
        value: candidates.filter((candidate) => candidate.status === "couple").length,
      },
      {
        label: "최근 기록",
        value: timelineEvents.length,
      },
    ],
    [candidates, timelineEvents.length],
  );

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

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-8 overflow-x-hidden px-4 pb-20 pt-24 md:px-8 lg:px-12">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl shadow-rose-200/15 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgb(244,114,182,0.18)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400/90">{stat.label}</p>
              <strong className="mt-3 block text-[clamp(1.75rem,4vw,2.35rem)] font-semibold tracking-[-0.04em] text-slate-800">
                {stat.value}
              </strong>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-7">
          <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400/90">Workspace View</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-800 sm:text-xl">
                오늘의 인연 흐름을 한눈에
              </h2>
            </div>
            <div className="w-full min-w-0 lg:max-w-xl lg:flex-1 lg:justify-end xl:max-w-2xl">
              <ViewSegmentControl view={view} onChange={setView} />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,0.9fr))_auto]">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
                이름 검색
              </span>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-rose-100/80 bg-white/90 px-3 shadow-[0_4px_20px_rgb(244,114,182,0.06)]">
                <SearchIcon />
                <Input
                  value={search}
                  onChange={(event) =>
                    startTransition(() => {
                      setSearch(event.target.value);
                    })
                  }
                  placeholder="이름, 직업, 지역, 태그 검색"
                  className="h-full w-full border-0 bg-transparent text-sm text-slate-700 shadow-none ring-0 placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0"
                />
              </div>
            </label>

            <div className="flex items-end gap-2 lg:hidden">
              <Button
                variant="outline"
                onClick={() => setFiltersOpen((current) => !current)}
                className="h-11 flex-1 rounded-xl border-rose-100/80 bg-white/80 px-4 text-sm font-medium text-rose-600 shadow-sm"
              >
                {filtersOpen ? "필터 닫기" : "필터 열기"}
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-11 flex-1 rounded-xl border-rose-100/80 bg-white/80 px-4 text-sm font-medium text-slate-600"
              >
                초기화
              </Button>
            </div>

            <div className={cn(filtersOpen ? "grid" : "hidden", "gap-3 lg:contents")}>
              <FilterSelect label="상태" value={status} options={statusOptions} onChange={setStatus} />
              <FilterSelect label="성별" value={gender} options={genderOptions} onChange={setGender} />
              <FilterSelect
                label="종교"
                value={religion}
                options={religionOptions}
                onChange={setReligion}
              />

              <div className="hidden items-end gap-2 lg:flex">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="h-11 rounded-xl border-rose-100/80 bg-white/80 px-4 text-sm font-medium text-slate-600 hover:border-rose-200"
                >
                  초기화
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {status ? (
              <Badge className="rounded-full bg-rose-100/80 px-3 py-1 text-xs font-medium text-rose-600">
                상태 {status}
              </Badge>
            ) : null}
            {gender ? (
              <Badge className="rounded-full bg-orange-100/80 px-3 py-1 text-xs font-medium text-orange-700">
                성별 {gender}
              </Badge>
            ) : null}
            {religion ? (
              <Badge className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-500">
                종교 {religion}
              </Badge>
            ) : null}
            {deferredSearch ? (
              <Badge className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-600">
                검색 {deferredSearch}
              </Badge>
            ) : null}
            <Badge variant="outline" className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-rose-100/60">
              {isFiltering ? "필터 적용 중" : `${filteredCandidates.length}명 표시`}
            </Badge>
          </div>
        </section>

        {view === "flow" ? (
          <section className="rounded-[28px] border border-white/50 bg-transparent p-1">
            <DashboardFlowBoard
              candidates={visibleBoardCandidates}
              allCandidates={boardCandidates}
              role={role}
            />
          </section>
        ) : (
          <section className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
            <div className="grid gap-6">
              {filteredCandidates.length ? (
                filteredCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} role={role} />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-rose-200/70 bg-white/60 px-6 py-14 text-center text-sm text-slate-500 shadow-[0_8px_32px_rgb(244,114,182,0.08)] backdrop-blur-sm">
                  조건에 맞는 후보가 없습니다. 필터를 조금 넓혀 다시 확인해보세요.
                </div>
              )}
            </div>

            <div className="hidden xl:block">
              <TimelinePanel
                events={timelineEvents}
                className="sticky top-28 w-full min-w-[18rem]"
                onSelectEvent={openMatchDetail}
                onViewAll={() => setHistoryListOpen(true)}
              />
            </div>
          </section>
        )}

        {view === "inventory" ? (
          <>
            <Button
              onClick={() => setTimelineOpen(true)}
              className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-[0_12px_40px_rgb(244,114,182,0.45)] transition hover:scale-[1.03] xl:hidden"
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
                <div className="relative w-full rounded-t-[32px] border border-white/60 bg-gradient-to-b from-rose-50/95 to-pink-50/90 p-5 shadow-2xl">
                  <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-rose-200/80" />
                  <div className="mb-4 flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setTimelineOpen(false)}
                      className="text-sm font-medium text-rose-500 hover:bg-transparent hover:text-rose-700"
                    >
                      닫기
                    </Button>
                  </div>
                  <TimelinePanel
                    embedInSheet
                    events={timelineEvents}
                    onSelectEvent={(event) => {
                      setTimelineOpen(false);
                      openMatchDetail(event);
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
          <div className="rounded-[24px] border border-white/60 bg-white/70 px-5 py-4 text-sm text-slate-600 shadow-[0_8px_30px_rgb(244,114,182,0.08)] backdrop-blur-md">
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
          openMatchDetail(event);
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
