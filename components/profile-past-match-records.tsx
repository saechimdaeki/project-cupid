"use client";

import { deleteMatchRecord } from "@/lib/admin-actions";
import { filterMatchRecordsForColumn } from "@/lib/match-flow-columns";
import type { Candidate, MatchRecord } from "@/lib/types";
import { useMatchRecords } from "@/components/match-records-provider";

function formatPastCounterpartLine(
  record: MatchRecord,
  counterpartById: Record<string, Candidate>,
) {
  if (record.counterpart_candidate_id) {
    const c = counterpartById[record.counterpart_candidate_id];
    if (c) {
      return `${c.full_name} · ${c.birth_year}년생 · ${c.occupation} · ${c.region}`;
    }
  }
  return record.counterpart_label;
}

type ProfilePastMatchRecordsProps = {
  candidateId: string;
  canOperate: boolean;
  counterpartsById: Record<string, Candidate>;
};

export function ProfilePastMatchRecords({
  candidateId,
  canOperate,
  counterpartsById,
}: ProfilePastMatchRecordsProps) {
  const { matchRecords } = useMatchRecords();
  const pastMatchRecords = filterMatchRecordsForColumn(matchRecords, "terminated").sort((a, b) =>
    b.happened_on.localeCompare(a.happened_on),
  );

  return (
    <div className="mt-6">
      {pastMatchRecords.length ? (
        pastMatchRecords.map((record) => (
          <article
            key={record.id}
            className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
              {formatPastCounterpartLine(record, counterpartsById)}과의 매칭
            </div>
            <p className="min-w-0 flex-1 text-center text-sm italic text-slate-500 sm:px-4">
              {record.summary || "종료 사유 메모가 없습니다."}
            </p>
            <div className="flex shrink-0 flex-col items-end gap-2 sm:items-end">
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-600">
                종료됨
              </span>
              <span className="text-xs font-medium text-slate-500">{record.happened_on}</span>
              {canOperate ? (
                <form action={deleteMatchRecord}>
                  <input type="hidden" name="candidateId" value={candidateId} />
                  <input type="hidden" name="recordId" value={record.id} />
                  <button
                    type="submit"
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-700"
                  >
                    기록 삭제
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          종료된 매칭 이력이 없습니다.
        </div>
      )}
    </div>
  );
}
