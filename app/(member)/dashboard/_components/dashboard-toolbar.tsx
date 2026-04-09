"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DashboardToolbarProps = {
  isInventoryView: boolean;
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
};

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
    <div className="relative">
      <Select value={value} onValueChange={(next) => onChange(next ?? "")}>
        <SelectTrigger
          className={cn(
            "h-8 min-w-0 rounded-lg border-rose-100/80 bg-white/90 px-2.5 text-xs",
            value && "pr-6",
          )}
        >
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
      {value ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

export function DashboardToolbar({
  isInventoryView,
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
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
      {/* 검색 */}
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-rose-100/80 bg-white/90 px-3">
        <Search className="size-4 shrink-0 text-rose-400" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="이름, 직업, 지역, 태그 검색"
          className="h-10 border-none bg-transparent px-0 text-sm text-slate-700 shadow-none outline-none placeholder:text-slate-400 focus-visible:ring-0"
        />
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2">
        {isInventoryView ? (
          <FilterSelect
            value={status}
            options={statusOptions}
            placeholder="상태"
            onChange={onStatusChange}
          />
        ) : null}
        <FilterSelect
          value={gender}
          options={genderOptions}
          placeholder="성별"
          onChange={onGenderChange}
        />
        <FilterSelect
          value={religion}
          options={religionOptions}
          placeholder="종교"
          onChange={onReligionChange}
        />
      </div>
    </div>
  );
}
