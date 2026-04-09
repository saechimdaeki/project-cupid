"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setCandidateVisibility } from "@/lib/admin-actions";
import { cn } from "@/lib/cn";

type CandidateVisibilityControlProps = {
  candidateId: string;
  isVisible: boolean;
  canManage: boolean;
  variant?: "card" | "inline";
};

export function CandidateVisibilityControl({
  candidateId,
  isVisible,
  canManage,
  variant = "card",
}: CandidateVisibilityControlProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextVisible = !isVisible;

  const handleToggle = () => {
    if (!canManage || isPending) return;

    setFeedback(null);
    startTransition(async () => {
      const result = await setCandidateVisibility(candidateId, nextVisible);

      if (!result.ok) {
        setFeedback(result.error ?? "노출 상태를 변경하지 못했습니다.");
        return;
      }

      setFeedback(result.message ?? null);
      router.refresh();
    });
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-end gap-3">
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-700">{isVisible ? "활성" : "비활성화"}</p>
          <p className="text-[11px] text-slate-400">비활성화 시 대시보드에서 숨김</p>
        </div>
        <button
          type="button"
          disabled={!canManage || isPending}
          onClick={handleToggle}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold shadow-sm transition",
            isVisible
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-rose-500 text-white hover:bg-rose-600",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isPending ? "처리 중..." : isVisible ? "비활성화" : "활성화"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Listing Visibility
          </p>
          <h3 className="mt-2 text-sm font-semibold text-slate-800">대시보드 노출</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            비활성화하면 대시보드와 비교 리스트에서 숨겨집니다.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
            isVisible
              ? "border-emerald-100 bg-emerald-50 text-emerald-600"
              : "border-slate-200 bg-slate-100 text-slate-600",
          )}
        >
          {isVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          {isVisible ? "활성" : "비활성화"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {canManage ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleToggle}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60",
              isVisible ? "bg-slate-900 hover:bg-slate-800" : "bg-rose-500 hover:bg-rose-600",
            )}
          >
            {isPending ? "처리 중..." : isVisible ? "비활성화" : "활성화"}
          </button>
        ) : (
          <p className="text-sm text-slate-400">
            등록자 본인 또는 슈퍼어드민만 변경할 수 있습니다.
          </p>
        )}
      </div>

      {feedback ? <p className="mt-3 text-sm text-slate-500">{feedback}</p> : null}
    </div>
  );
}
