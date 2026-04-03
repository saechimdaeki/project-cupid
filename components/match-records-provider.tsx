"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MatchOutcome, MatchRecord } from "@/lib/types";

export type MatchRecordsContextValue = {
  matchRecords: MatchRecord[];
  /** 칸반·데스크가 동일 배열을 바꿀 때: id 일치 행의 outcome만 덮어씀 */
  handleRecordOutcomeChange: (matchId: string, outcome: MatchOutcome) => void;
  removeRecordById: (matchId: string) => void;
};

const MatchRecordsContext = createContext<MatchRecordsContextValue | null>(null);

export function MatchRecordsProvider({
  initialRecords,
  children,
}: {
  initialRecords: MatchRecord[];
  children: ReactNode;
}) {
  const [matchRecords, setMatchRecords] = useState<MatchRecord[]>(initialRecords);
  const serialized = useMemo(
    () =>
      initialRecords
        .map((r) => `${r.id}:${r.outcome}:${r.summary}:${r.happened_on}`)
        .sort()
        .join("|"),
    [initialRecords],
  );

  // serialized만 의존: RSC가 매번 새 배열 참조를 넘겨도 내용이 같으면 동기화하지 않음
  useEffect(() => {
    setMatchRecords(initialRecords);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialRecords는 serialized 변경 시점의 서버 스냅샷
  }, [serialized]);

  const handleRecordOutcomeChange = useCallback((matchId: string, outcome: MatchOutcome) => {
    setMatchRecords((prev) =>
      prev.map((record) => (record.id === matchId ? { ...record, outcome } : record)),
    );
  }, []);

  const removeRecordById = useCallback((matchId: string) => {
    setMatchRecords((prev) => prev.filter((r) => r.id !== matchId));
  }, []);

  const value = useMemo(
    () => ({ matchRecords, handleRecordOutcomeChange, removeRecordById }),
    [matchRecords, handleRecordOutcomeChange, removeRecordById],
  );

  return <MatchRecordsContext.Provider value={value}>{children}</MatchRecordsContext.Provider>;
}

export function useMatchRecords() {
  const ctx = useContext(MatchRecordsContext);
  if (!ctx) {
    throw new Error("useMatchRecords는 MatchRecordsProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
