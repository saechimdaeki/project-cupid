"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { DashboardViewMode } from "@/lib/types";

type DashboardViewToggleProps = {
  view: DashboardViewMode;
  onChange: (next: DashboardViewMode) => void;
};

export function DashboardViewToggle({ view, onChange }: DashboardViewToggleProps) {
  return (
    <section className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-7">
      <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <h2 className="min-w-0 shrink-0 text-lg font-semibold tracking-[-0.03em] text-slate-800 sm:text-xl">
          오늘의 인연 흐름을 한눈에
        </h2>
        <div className="w-full min-w-0 lg:max-w-xl lg:flex-1 lg:justify-end xl:max-w-2xl">
          <div className="relative flex w-full max-w-xl rounded-full border border-white/60 bg-white/75 p-1.5 shadow-[0_12px_40px_rgba(244,114,182,0.15),inset_0_2px_16px_rgba(244,114,182,0.12)] backdrop-blur-md">
            <span
              className={cn(
                "pointer-events-none absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-full bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_8px_28px_rgba(244,114,182,0.45)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                view === DashboardViewMode.FLOW ? "left-1.5" : "left-[calc(50%+3px)]",
              )}
              aria-hidden
            />
            <Button
              variant="ghost"
              onClick={() => onChange(DashboardViewMode.FLOW)}
              className={cn(
                "relative z-10 flex-1 rounded-full px-4 py-3 text-sm font-semibold tracking-[-0.02em] transition-colors duration-500 ease-out sm:px-6",
                view === DashboardViewMode.FLOW ? "text-white hover:bg-transparent hover:text-white" : "text-rose-400 hover:bg-transparent hover:text-rose-600",
              )}
            >
              플로우 보드
            </Button>
            <Button
              variant="ghost"
              onClick={() => onChange(DashboardViewMode.INVENTORY)}
              className={cn(
                "relative z-10 flex-1 rounded-full px-4 py-3 text-sm font-semibold tracking-[-0.02em] transition-colors duration-500 ease-out sm:px-6",
                view === DashboardViewMode.INVENTORY ? "text-white hover:bg-transparent hover:text-white" : "text-rose-400 hover:bg-transparent hover:text-rose-600",
              )}
            >
              전체 매물
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
