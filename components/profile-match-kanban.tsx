"use client";

import { deleteMatchRecord } from "@/lib/admin-actions";
import {
  filterMatchRecordsForColumn,
  type MatchFlowColumnKey,
} from "@/lib/match-flow-columns";
import type { MatchOutcome, MatchRecord } from "@/lib/types";
import { useMatchRecords } from "@/components/match-records-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FLOW_COLUMNS: Array<{
  key: MatchFlowColumnKey;
  label: string;
}> = [
  { key: "progress", label: "진행 중" },
  { key: "completed", label: "커플완성" },
  { key: "terminated", label: "종료" },
];

function getOutcomeLabel(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":
      return "소개 시작";
    case "first_meeting":
      return "첫 만남";
    case "dating":
      return "후속 진행";
    case "couple":
      return "커플완성";
    case "closed":
      return "종료";
  }
}

function getOutcomeBadgeClass(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":
    case "first_meeting":
    case "dating":
      return "border-rose-200/80 bg-rose-50 text-rose-600";
    case "couple":
      return "border-orange-200/80 bg-orange-50 text-orange-700";
    case "closed":
      return "border-rose-100 bg-white/80 text-slate-500";
  }
}

type ProfileMatchKanbanProps = {
  candidateId: string;
  canOperate: boolean;
};

export function ProfileMatchKanban({ candidateId, canOperate }: ProfileMatchKanbanProps) {
  const { matchRecords } = useMatchRecords();

  const columnRecords: Record<MatchFlowColumnKey, MatchRecord[]> = {
    progress: filterMatchRecordsForColumn(matchRecords, "progress"),
    completed: filterMatchRecordsForColumn(matchRecords, "completed"),
    terminated: filterMatchRecordsForColumn(matchRecords, "terminated"),
  };

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-3">
      {FLOW_COLUMNS.map((col) => {
        const group = columnRecords[col.key];
        return (
          <article
            key={col.key}
            className="rounded-2xl border border-white/50 bg-white/60 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">{col.label}</h3>
              <Badge variant="secondary" className="rounded-full bg-rose-100/80 text-rose-600">
                {group.length}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3">
              {group.length ? (
                group.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-xl border border-rose-100/50 bg-white/90 p-4 shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">
                          {record.counterpart_label}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">{record.happened_on}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`rounded-full ${getOutcomeBadgeClass(record.outcome)}`}
                        >
                          {getOutcomeLabel(record.outcome)}
                        </Badge>
                        {canOperate ? (
                          <form action={deleteMatchRecord}>
                            <input type="hidden" name="candidateId" value={candidateId} />
                            <input type="hidden" name="recordId" value={record.id} />
                            <Button
                              variant="ghost"
                              size="sm"
                              type="submit"
                              className="h-auto px-1 py-0 text-[11px] font-medium text-slate-400 hover:text-slate-700"
                            >
                              삭제
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{record.summary}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-rose-200/60 bg-white/70 px-4 py-8 text-sm text-slate-500">
                  아직 기록이 없습니다.
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
