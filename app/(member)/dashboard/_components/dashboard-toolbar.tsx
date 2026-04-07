"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { DashboardViewMode } from "@/lib/types";

type DashboardToolbarProps = {
  view: DashboardViewMode;
  onViewChange: (next: DashboardViewMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  religion: string;
  onReligionChange: (value: string) => void;
  genderOptions: string[];
  religionOptions: string[];
  filteredCount: number;
};

const STATUS_CHIPS = [
  { value: "active",  label: "적극검토", activeClass: "border-rose-400 bg-rose-500 text-white" },
  { value: "matched", label: "매칭중",   activeClass: "border-blue-400 bg-blue-500 text-white" },
  { value: "couple",  label: "커플",     activeClass: "border-emerald-400 bg-emerald-500 text-white" },
];

const CHIP_BASE = "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const CHIP_INACTIVE = "border-slate-200 bg-white/80 text-slate-500 hover:border-rose-200 hover:text-rose-600";

export function DashboardToolbar({
  view,
  onViewChange,
  search,
  onSearchChange,
  status,
  onStatusChange,
  gender,
  onGenderChange,
  religion,
  onReligionChange,
  genderOptions,
  religionOptions,
  filteredCount,
}: DashboardToolbarProps) {
  const hasActiveFilters = Boolean(status || gender || religion || search);

  const resetFilters = () => {
    onSearchChange("");
    onStatusChange("");
    onGenderChange("");
    onReligionChange("");
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md">
      {/* Row 1: View toggle + Search */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 shrink-0 items-center rounded-xl border border-rose-100/60 bg-white/60 p-0.5">
          <Button
            variant="ghost"
            onClick={() => onViewChange(DashboardViewMode.FLOW)}
            className={cn(
              "h-full rounded-lg px-3.5 text-sm font-medium transition-colors",
              view === DashboardViewMode.FLOW
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm hover:bg-transparent hover:text-white"
                : "text-slate-500 hover:bg-transparent hover:text-slate-700",
            )}
          >
            플로우
          </Button>
          <Button
            variant="ghost"
            onClick={() => onViewChange(DashboardViewMode.INVENTORY)}
            className={cn(
              "h-full rounded-lg px-3.5 text-sm font-medium transition-colors",
              view === DashboardViewMode.INVENTORY
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm hover:bg-transparent hover:text-white"
                : "text-slate-500 hover:bg-transparent hover:text-slate-700",
            )}
          >
            전체 후보
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-rose-100/80 bg-white/90 px-3">
          <Search className="size-4 shrink-0 text-rose-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="이름, 직업, 지역, 태그 검색"
            className="h-10 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Row 2: Filter chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* 상태 칩 */}
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => onStatusChange(status === chip.value ? "" : chip.value)}
            className={cn(CHIP_BASE, status === chip.value ? chip.activeClass : CHIP_INACTIVE)}
          >
            {chip.label}
          </button>
        ))}

        {genderOptions.length > 0 && (
          <span className="mx-0.5 h-3.5 w-px shrink-0 bg-slate-200" aria-hidden />
        )}

        {/* 성별 칩 */}
        {genderOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onGenderChange(gender === option ? "" : option)}
            className={cn(
              CHIP_BASE,
              gender === option ? "border-rose-400 bg-rose-500 text-white" : CHIP_INACTIVE,
            )}
          >
            {option}
          </button>
        ))}

        {religionOptions.length > 0 && (
          <span className="mx-0.5 h-3.5 w-px shrink-0 bg-slate-200" aria-hidden />
        )}

        {/* 종교 칩 */}
        {religionOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onReligionChange(religion === option ? "" : option)}
            className={cn(
              CHIP_BASE,
              religion === option ? "border-rose-400 bg-rose-500 text-white" : CHIP_INACTIVE,
            )}
          >
            {option}
          </button>
        ))}

        {/* 카운트 + 초기화 */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 tabular-nums">{filteredCount}명</span>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="cursor-pointer text-xs font-medium text-rose-500 transition-colors hover:text-rose-700"
            >
              초기화
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
