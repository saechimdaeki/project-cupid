"use client";

import { Kanban, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { DashboardViewMode } from "@/lib/types";

type DashboardViewToggleProps = {
  view: DashboardViewMode;
  onViewChange: (view: DashboardViewMode) => void;
};

export function DashboardViewToggle({ view, onViewChange }: DashboardViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/60 bg-white/80 p-1 shadow-sm backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange(DashboardViewMode.FLOW)}
        className={cn(
          "size-8 rounded-lg",
          view === DashboardViewMode.FLOW
            ? "bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-500"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
        )}
      >
        <Kanban className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange(DashboardViewMode.INVENTORY)}
        className={cn(
          "size-8 rounded-lg",
          view === DashboardViewMode.INVENTORY
            ? "bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-500"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
        )}
      >
        <LayoutList className="size-4" />
      </Button>
    </div>
  );
}
