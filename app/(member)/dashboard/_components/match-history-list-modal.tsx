"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { getOutcomeDotClass } from "@/lib/status-ui";
import type { TimelineEvent } from "@/lib/types";

type MatchHistoryListModalProps = {
  open: boolean;
  events: TimelineEvent[];
  onClose: () => void;
  onPick: (event: TimelineEvent) => void;
};

export function MatchHistoryListModal({ open, events, onClose, onPick }: MatchHistoryListModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>전체 매칭 기록</DialogTitle>
          <DialogDescription>항목을 눌러 두 사람의 디테일을 확인할 수 있어요.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid gap-3">
            {events.length ? (
              events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onPick(event)}
                  className="w-full cursor-pointer rounded-2xl border border-rose-100/50 bg-rose-50/35 p-4 text-left transition hover:border-rose-200 hover:bg-rose-50/55"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-1 size-3 shrink-0 rounded-full border-2 border-white shadow-sm",
                        getOutcomeDotClass(event.outcome),
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <strong className="text-sm font-semibold text-foreground">{event.title}</strong>
                        <span className="shrink-0 text-xs text-muted-foreground">{event.happened_on}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.summary}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
                표시할 매칭 기록이 없습니다.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<button type="button" className="text-sm text-muted-foreground hover:text-foreground" />}>
            닫기
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
