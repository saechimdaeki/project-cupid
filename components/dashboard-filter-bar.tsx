"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type DashboardFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  religion: string;
  onReligionChange: (value: string) => void;
  statusOptions: string[];
  genderOptions: string[];
  religionOptions: string[];
  filteredCount: number;
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
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

export function DashboardFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  gender,
  onGenderChange,
  religion,
  onReligionChange,
  statusOptions,
  genderOptions,
  religionOptions,
  filteredCount,
}: DashboardFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFiltering, startTransition] = useTransition();

  const resetFilters = () => {
    onSearchChange("");
    onStatusChange("");
    onGenderChange("");
    onReligionChange("");
    setFiltersOpen(false);
  };

  return (
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
              onChange={(event) => startTransition(() => onSearchChange(event.target.value))}
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
          <FilterSelect label="상태" value={status} options={statusOptions} onChange={onStatusChange} />
          <FilterSelect label="성별" value={gender} options={genderOptions} onChange={onGenderChange} />
          <FilterSelect label="종교" value={religion} options={religionOptions} onChange={onReligionChange} />

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
        {search ? (
          <Badge className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-600">
            검색 {search}
          </Badge>
        ) : null}
        <Badge variant="outline" className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-rose-100/60">
          {isFiltering ? "필터 적용 중" : `${filteredCount}명 표시`}
        </Badge>
      </div>
    </section>
  );
}
