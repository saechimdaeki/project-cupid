"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function FilterSelect({
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
    <Select value={value} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger className="h-9 min-w-[5rem] rounded-lg border-rose-100/80 bg-white/90">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectItem value="">전체</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
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
  const hasActiveFilters = Boolean(status || gender || religion || search);

  const resetFilters = () => {
    onSearchChange("");
    onStatusChange("");
    onGenderChange("");
    onReligionChange("");
    setFiltersOpen(false);
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md">
      {/* Row 1: Search + filter toggle */}
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-rose-100/80 bg-white/90 px-3">
          <SearchIcon />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="이름, 직업, 지역, 태그 검색"
            className="h-10 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setFiltersOpen((current) => !current)}
          className={cn(
            "size-10 shrink-0 rounded-xl lg:hidden",
            filtersOpen
              ? "border-rose-200 bg-rose-50 text-rose-500"
              : "border-rose-100/80 bg-white/90 text-slate-500 hover:text-rose-500",
          )}
          aria-label="필터"
        >
          <FilterIcon />
        </Button>
      </div>

      {/* Row 2: Filters */}
      <div className={cn(filtersOpen ? "flex" : "hidden", "flex-wrap items-center gap-2 lg:flex")}>
        <FilterSelect value={status} options={statusOptions} placeholder="상태" onChange={onStatusChange} />
        <FilterSelect value={gender} options={genderOptions} placeholder="성별" onChange={onGenderChange} />
        <FilterSelect value={religion} options={religionOptions} placeholder="종교" onChange={onReligionChange} />
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
          >
            초기화
          </Button>
        ) : null}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          {status ? (
            <Badge className="rounded-full bg-rose-100/80 px-2.5 py-0.5 text-xs font-medium text-rose-600">
              상태 {status}
            </Badge>
          ) : null}
          {gender ? (
            <Badge className="rounded-full bg-orange-100/80 px-2.5 py-0.5 text-xs font-medium text-orange-700">
              성별 {gender}
            </Badge>
          ) : null}
          {religion ? (
            <Badge className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-500">
              종교 {religion}
            </Badge>
          ) : null}
          {search ? (
            <Badge className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
              &quot;{search}&quot;
            </Badge>
          ) : null}
          <span className="text-xs text-slate-500">
            {`${filteredCount}명 표시`}
          </span>
        </div>
      ) : null}
    </section>
  );
}
