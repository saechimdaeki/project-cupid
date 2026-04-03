"use client";

import { useEffect } from "react";
import { getOutcomeDotClass } from "@/lib/status-ui";
import type { TimelineEvent } from "@/lib/types";

type MatchHistoryListModalProps = {
  open: boolean;
  events: TimelineEvent[];
  onClose: () => void;
  onPick: (event: TimelineEvent) => void;
};

export function MatchHistoryListModal({ open, events, onClose, onPick }: MatchHistoryListModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10 backdrop-blur-md sm:pt-16"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative mb-10 w-full max-w-[1440px] rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-md sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-history-all-title"
      >
        <button
          type="button"
          className="absolute right-5 top-5 rounded-full px-3 py-1 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          onClick={onClose}
        >
          닫기
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400/90">Matching History</p>
        <h2 id="match-history-all-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
          전체 매칭 기록
        </h2>
        <p className="mt-2 text-sm text-slate-500">항목을 눌러 두 사람의 디테일을 확인할 수 있어요.</p>

        <div className="mt-8 max-h-[min(70vh,52rem)] overflow-y-auto pr-1">
          <div className="grid gap-4">
            {events.length ? (
              events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onPick(event)}
                  className="w-full rounded-2xl border border-rose-100/50 bg-rose-50/35 p-4 text-left shadow-sm transition hover:border-rose-200 hover:bg-rose-50/55"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm ${getOutcomeDotClass(event.outcome)}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <strong className="text-sm font-semibold text-slate-800">{event.title}</strong>
                        <span className="shrink-0 text-xs font-medium text-rose-400">{event.happened_on}</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">{event.summary}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-rose-200/60 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
                표시할 매칭 기록이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
