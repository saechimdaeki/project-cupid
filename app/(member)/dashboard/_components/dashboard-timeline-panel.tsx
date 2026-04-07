"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getOutcomeDotClass } from "@/lib/status-ui";
import type { TimelineEvent } from "@/lib/types";

const RECENT_MATCH_LIMIT = 3;

const TimelineIcon = () => <History className="size-5" />;

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
    <div className="mt-6 flex flex-col gap-4">
      {events.length ? (
        preview.map((event, index) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelectEvent?.(event)}
            className={cn(
              "relative w-full min-w-0 cursor-pointer rounded-xl border border-transparent bg-transparent pl-7 text-left",
              "text-slate-800 transition hover:bg-rose-50/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
            )}
          >
            {index < preview.length - 1 ? (
              <span
                aria-hidden
                className="absolute left-[7px] top-6 bottom-[-1rem] w-px bg-gradient-to-b from-rose-200/80 to-orange-100/40"
              />
            ) : null}
            <span
              className={cn(
                "absolute left-0 top-1.5 z-[1] size-4 rounded-full border-[3px] border-white shadow-[0_2px_8px_rgb(244,114,182,0.2)]",
                getOutcomeDotClass(event.outcome),
              )}
            />
            <div className="rounded-2xl border border-rose-100/40 bg-rose-50/35 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <strong className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-800 break-words">
                  {event.title}
                </strong>
                <span className="shrink-0 pt-0.5 text-xs font-medium text-rose-400 tabular-nums">
                  {event.happened_on}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 break-words">{event.summary}</p>
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
