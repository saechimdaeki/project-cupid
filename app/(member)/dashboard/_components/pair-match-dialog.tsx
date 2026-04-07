"use client";

import { Heart, Link2, Users } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatCandidateBrief } from "@/lib/candidate-display";
import type { DashboardBoardCandidate } from "./dashboard-flow-board";

export type PairMatchDialogProps = {
  open: boolean;
  onClose: () => void;
  targetStatus: "matched" | "couple";
  candidateName: string;
  counterpartId: string;
  onCounterpartChange: (id: string | null) => void;
  pairOptions: DashboardBoardCandidate[];
  isPending: boolean;
  onConfirm: () => void;
};

export function PairMatchDialog({
  open,
  onClose,
  targetStatus,
  candidateName,
  counterpartId,
  onCounterpartChange,
  pairOptions,
  isPending,
  onConfirm,
}: PairMatchDialogProps) {
  const isMatched = targetStatus === "matched";
  const selectedCandidate = pairOptions.find((candidate) => candidate.id === counterpartId) ?? null;
  const selectedLabel = selectedCandidate
    ? `${formatCandidateBrief(selectedCandidate)} · ${selectedCandidate.gender}`
    : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{candidateName}와 연결할 후보 선택</DialogTitle>
          <DialogDescription>
            선택한 후보와 두 사람의 상태가 함께 이동합니다.
          </DialogDescription>
        </DialogHeader>

        {pairOptions.length > 0 ? (
          <div className="grid gap-2">
            <Label htmlFor="counterpart-select">상대 후보</Label>
            <Select value={counterpartId} onValueChange={onCounterpartChange}>
              <SelectTrigger id="counterpart-select" className="w-full">
                <SelectValue placeholder="후보를 선택하세요">
                  {selectedLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pairOptions.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {formatCandidateBrief(candidate)} · {candidate.gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Users className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              현재 연결 가능한 반대 성별 후보가 없습니다.
            </p>
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            취소
          </DialogClose>
          <Button disabled={isPending || !counterpartId} onClick={onConfirm}>
            {isMatched ? "매칭진행중으로 이동" : "커플완성으로 확정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
