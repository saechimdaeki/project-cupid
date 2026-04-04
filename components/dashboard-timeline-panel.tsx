"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getOutcomeDotClass } from "@/lib/status-ui";
import type { TimelineEvent } from "@/lib/types";

const RECENT_MATCH_LIMIT = 3;

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

type DashboardTimelinePanelProps = {
  events: TimelineEvent[];
  className?: string;
  onSelectEvent?: (event: TimelineEvent) => void;
  onViewAll?: () => void;
  embedInSheet?: boolean;
};

export { TimelineIcon };

export function DashboardTimelinePanel({
  events,
  className,
  onSelectEvent,
  onViewAll,
  embedInSheet = false,
}: DashboardTimelinePanelProps) {
  const preview = events.slice(0, RECENT_MATCH_LIMIT);
  const showViewAll = Boolean(onViewAll && events.length > RECENT_MATCH_LIMIT);

  const list = (
    <div className="mt-6 grid gap-4">
      {events.length ? (
        preview.map((event, index) => (
          <Button
            key={event.id}
            variant="ghost"
            onClick={() => onSelectEvent?.(event)}
            className="relative h-auto w-full cursor-pointer pl-6 text-left transition hover:bg-transparent hover:opacity-95"
          >
            {index < preview.length - 1 ? (
              <span className="absolute left-[7px] top-7 h-[calc(100%-0.25rem)] w-px bg-gradient-to-b from-rose-200/80 to-orange-100/50" />
            ) : null}
            <span
              className={cn("absolute left-0 top-1.5 size-4 rounded-full border-[3px] border-white shadow-[0_2px_8px_rgb(244,114,182,0.2)]", getOutcomeDotClass(event.outcome))}
            />
            <div className="rounded-2xl border border-rose-100/40 bg-rose-50/35 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-sm font-semibold text-slate-800">{event.title}</strong>
                <span className="shrink-0 text-xs font-medium text-rose-400">{event.happened_on}</span>
              </div>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{event.summary}</p>
            </div>
          </Button>
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
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-500">
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
