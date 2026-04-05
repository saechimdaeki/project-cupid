"use client";

/**
 * 대시보드 칸반에서 드롭으로만 열리는 페어 매칭 모달.
 *
 * 원인: 공용 `Dialog`(Base UI) Popup은 Floating UI로 위치를 잡으며 `activeTriggerElement`를
 * 기준으로 합니다. 트리거 없이 controlled `open`만 켜지면 참조가 칸반 열·카드 등으로 남거나
 * 불안정해지고, `transform: translate(x,y)` 인라인이 Tailwind 중앙 정렬을 덮어 모달이
 * 레이아웃 플로우 안쪽에 붙어 보일 수 있습니다.
 *
 * 해결: `createPortal(..., document.body)` + `fixed inset-0` 오버레이·flex 중앙 정렬로
 * 뷰포트 기준 레이어를 완전히 분리합니다.
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type DashboardPairMatchDialogProps = {
  open: boolean;
  onClose: () => void;
  /** 보이는 제목 요소의 id — `aria-labelledby` */
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
};

export function DashboardPairMatchDialog({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: DashboardPairMatchDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const node = panelRef.current?.querySelector<HTMLElement>(
      "select, button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex='-1'])",
    );
    node?.focus();
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 isolate z-[200]" data-dashboard-pair-match-portal="">
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 sm:p-6"
        role="presentation"
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={cn(
            "pointer-events-auto max-h-[min(90vh,44rem)] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/60 bg-white p-5 text-slate-800 shadow-[0_24px_80px_rgba(15,23,42,0.25)] sm:p-6",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
