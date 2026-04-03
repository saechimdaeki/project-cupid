"use client";

import { useEffect, useState } from "react";
import {
  closeMatchWithRecord,
  promoteToCoupleFromDesk,
  updateCandidateStatus,
} from "@/lib/admin-actions";
import type { CandidateStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/status-ui";

const CLOSURE_SELECT_VALUE = "__match_closure__";

// '졸업(graduated)' 제거 — 기획에 없는 옵션
const STATUS_OPTIONS: CandidateStatus[] = ["active", "matched", "couple", "archived"];

type OperatorDeskControlsProps = {
  candidateId: string;
  currentStatus: CandidateStatus;
  /** paired_candidate_id: 연결된 상대 ID. null이면 페어 없음 */
  pairedCandidateId: string | null;
  canOperate: boolean;
};

export function OperatorDeskControls({
  candidateId,
  currentStatus,
  pairedCandidateId,
  canOperate,
}: OperatorDeskControlsProps) {
  const hasPair = Boolean(pairedCandidateId);
  const [selectValue, setSelectValue] = useState<string>(currentStatus);
  const [closureMode, setClosureMode] = useState(false);

  useEffect(() => {
    setSelectValue(currentStatus);
    setClosureMode(false);
  }, [currentStatus]);

  if (!canOperate) {
    return null;
  }

  const showCouplePanel = selectValue === "couple" && !closureMode;
  const showClosurePanel = closureMode && selectValue === CLOSURE_SELECT_VALUE;
  const showDefaultButton = !showCouplePanel && !showClosurePanel;

  return (
    <div className="mt-5 grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <select
          value={closureMode ? CLOSURE_SELECT_VALUE : selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === CLOSURE_SELECT_VALUE) {
              setSelectValue(CLOSURE_SELECT_VALUE);
              setClosureMode(true);
              return;
            }
            setSelectValue(v);
            setClosureMode(false);
          }}
          className="h-11 min-w-0 flex-1 rounded-xl border border-rose-100/80 bg-white/90 px-4 text-sm text-slate-700 shadow-sm outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100"
          aria-label="후보 상태"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
          <option value={CLOSURE_SELECT_VALUE}>매칭 종료(실패)</option>
        </select>

        {showDefaultButton ? (
          <form action={updateCandidateStatus} className="shrink-0">
            <input type="hidden" name="candidateId" value={candidateId} />
            <input type="hidden" name="status" value={selectValue} />
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-rose-200/80 bg-white/90 px-4 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 sm:w-auto sm:min-w-[7.5rem]"
            >
              상태 변경
            </button>
          </form>
        ) : null}
      </div>

      {/* 커플완성 확정 패널 */}
      {showCouplePanel ? (
        <div className="rounded-2xl border border-orange-200/70 bg-orange-50/50 p-4 backdrop-blur-sm">
          {!hasPair ? (
            <p className="text-sm text-amber-800">
              연결된 상대(Current Pair)가 없으면 커플완성 처리를 할 수 없습니다. 먼저 대시보드에서
              매칭을 연결해 주세요.
            </p>
          ) : (
            <div className="grid gap-3">
              <p className="text-sm font-medium text-orange-800">
                현재 연결된 상대와의 매칭을 커플완성으로 확정합니다.
              </p>
              <form action={promoteToCoupleFromDesk} className="flex flex-wrap gap-2">
                <input type="hidden" name="candidateId" value={candidateId} />
                <input type="hidden" name="counterpartId" value={pairedCandidateId ?? ""} />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  커플 확정
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-rose-200/80 bg-white/90 px-5 text-sm font-medium text-slate-600 transition hover:bg-white"
                  onClick={() => setSelectValue(currentStatus)}
                >
                  취소
                </button>
              </form>
            </div>
          )}
        </div>
      ) : null}

      {/* 매칭 종료(실패) 패널 */}
      {showClosurePanel ? (
        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/50 p-4 backdrop-blur-sm">
          {!hasPair ? (
            <p className="text-sm text-amber-800">
              현재 연결된 상대(Current Pair)가 없으면 매칭 종료 기록을 남길 수 없습니다. 먼저
              대시보드에서 매칭을 연결해 주세요.
            </p>
          ) : (
            <form action={closeMatchWithRecord} className="grid gap-3">
              <input type="hidden" name="candidateId" value={candidateId} />
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold text-rose-600/90">
                  종료 사유 (예: 성향 차이, 연락 두절 등)
                </span>
                <textarea
                  name="closureReason"
                  required
                  rows={4}
                  placeholder="주선자 비공개 메모로 PAST RECORDS에 저장됩니다."
                  className="min-h-[6rem] rounded-xl border border-rose-100/80 bg-white/95 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  종료 확정
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-rose-200/80 bg-white/90 px-5 text-sm font-medium text-slate-600 transition hover:bg-white"
                  onClick={() => {
                    setClosureMode(false);
                    setSelectValue(currentStatus);
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
