"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  closeMatchWithRecord,
  promoteToCoupleFromDesk,
  setStatusFromDesk,
} from "@/lib/admin-actions";
import type { CandidateStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/status-ui";

const CLOSURE_SELECT_VALUE = "__match_closure__";

// '졸업(graduated)' 제거
const STATUS_OPTIONS: CandidateStatus[] = ["active", "matched", "couple", "archived"];

type OperatorDeskControlsProps = {
  candidateId: string;
  currentStatus: CandidateStatus;
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
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const closureFormRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    setSelectValue(currentStatus);
    setClosureMode(false);
    setInlineError(null);
  }, [currentStatus]);

  if (!canOperate) {
    return null;
  }

  const showCouplePanel = selectValue === "couple" && !closureMode;
  const showClosurePanel = closureMode && selectValue === CLOSURE_SELECT_VALUE;
  const showDefaultButton = !showCouplePanel && !showClosurePanel;

  const handleStatusChange = () => {
    if (isPending) return;
    setInlineError(null);
    startTransition(async () => {
      const result = await setStatusFromDesk(candidateId, selectValue);
      if (result.ok) {
        router.push(`/profiles/${candidateId}?message=status-updated`);
      } else {
        setInlineError(result.error ?? "상태 변경에 실패했습니다.");
      }
    });
  };

  // 커플 확정: isPending으로 더블클릭 방지 (form action 직접 호출 → redirect 포함)
  const handleCoupleConfirm = () => {
    if (isPending) return;
    const formData = new FormData();
    formData.set("candidateId", candidateId);
    formData.set("counterpartId", pairedCandidateId ?? "");
    startTransition(async () => {
      await promoteToCoupleFromDesk(formData);
    });
  };

  // 종료 확정: isPending으로 더블클릭 방지 (form ref에서 FormData 직접 생성)
  const handleCloseMatch = () => {
    if (isPending || !closureFormRef.current) return;
    const closureReason = (closureFormRef.current.elements.namedItem("closureReason") as HTMLTextAreaElement)?.value?.trim();
    if (!closureReason) return;
    const formData = new FormData();
    formData.set("candidateId", candidateId);
    formData.set("closureReason", closureReason);
    startTransition(async () => {
      await closeMatchWithRecord(formData);
    });
  };

  return (
    <div className="mt-5 grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <select
          value={closureMode ? CLOSURE_SELECT_VALUE : selectValue}
          disabled={isPending}
          onChange={(e) => {
            const v = e.target.value;
            if (v === CLOSURE_SELECT_VALUE) {
              setSelectValue(CLOSURE_SELECT_VALUE);
              setClosureMode(true);
              setInlineError(null);
              return;
            }
            setSelectValue(v);
            setClosureMode(false);
            setInlineError(null);
          }}
          className="h-11 min-w-0 flex-1 rounded-xl border border-rose-100/80 bg-white/90 px-4 text-sm text-slate-700 shadow-sm outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
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
          <button
            type="button"
            onClick={handleStatusChange}
            disabled={isPending || selectValue === currentStatus}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-rose-200/80 bg-white/90 px-4 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[7.5rem]"
          >
            {isPending ? "처리 중…" : "상태 변경"}
          </button>
        ) : null}
      </div>

      {inlineError ? (
        <p className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2 text-xs font-medium text-amber-800">
          {inlineError}
        </p>
      ) : null}

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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCoupleConfirm}
                  disabled={isPending}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "처리 중…" : "커플 확정"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-rose-200/80 bg-white/90 px-5 text-sm font-medium text-slate-600 transition hover:bg-white disabled:opacity-60"
                  onClick={() => setSelectValue(currentStatus)}
                >
                  취소
                </button>
              </div>
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
            <form ref={closureFormRef} onSubmit={(e) => e.preventDefault()} className="grid gap-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold text-rose-600/90">
                  종료 사유 (예: 성향 차이, 연락 두절 등)
                </span>
                <textarea
                  name="closureReason"
                  required
                  rows={4}
                  disabled={isPending}
                  placeholder="주선자 비공개 메모로 PAST RECORDS에 저장됩니다."
                  className="min-h-[6rem] rounded-xl border border-rose-100/80 bg-white/95 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCloseMatch}
                  disabled={isPending}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "처리 중…" : "종료 확정"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-rose-200/80 bg-white/90 px-5 text-sm font-medium text-slate-600 transition hover:bg-white disabled:opacity-60"
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
