"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { type DashboardBoardCandidate } from "./dashboard-flow-board";
import { DashboardContent } from "./dashboard-content";
import { DashboardToolbar } from "./dashboard-toolbar";
import { DashboardViewMode } from "@/lib/types";
import type { AppRole, Candidate, TimelineEvent } from "@/lib/types";

type DashboardWorkspaceProps = {
  candidates: Candidate[];
  timelineEvents: TimelineEvent[];
  role: AppRole;
  initialView?: DashboardViewMode;
};

export function DashboardWorkspace({
  candidates,
  timelineEvents,
  role,
  initialView = DashboardViewMode.FLOW,
}: DashboardWorkspaceProps) {
  const [view, setView] = useState<DashboardViewMode>(initialView);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [religion, setReligion] = useState("");
  const deferredSearch = useDeferredValue(search);

  const genderOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.gender).filter(Boolean))).sort(),
    [candidates],
  );
  const religionOptions = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.religion).filter(Boolean))).sort(),
    [candidates],
  );

  const filteredCandidates = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (status && candidate.status !== status) return false;
      if (gender && candidate.gender !== gender) return false;
      if (religion && candidate.religion !== religion) return false;
      if (!query) return true;
      const haystack = [
        candidate.full_name, candidate.occupation, candidate.region,
        candidate.work_summary, candidate.personality_summary, candidate.notes_private,
        ...candidate.highlight_tags,
      ].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [candidates, deferredSearch, gender, religion, status]);

  const boardCandidates: DashboardBoardCandidate[] = useMemo(
    () =>
      candidates.map((candidate) => ({
        id: candidate.id,
        full_name: candidate.full_name,
        birth_year: candidate.birth_year,
        height_text: candidate.height_text,
        gender: candidate.gender,
        region: candidate.region,
        occupation: candidate.occupation,
        work_summary: candidate.work_summary,
        religion: candidate.religion,
        personality_summary: candidate.personality_summary,
        highlight_tags: candidate.highlight_tags,
        notes_private: candidate.notes_private,
        status: candidate.status,
        paired_candidate_id: candidate.paired_candidate_id,
        image_url: candidate.image_url,
        created_at: candidate.created_at,
      })),
    [candidates],
  );

  const visibleBoardCandidates = useMemo(() => {
    const ids = new Set(filteredCandidates.map((candidate) => candidate.id));
    return boardCandidates.filter((candidate) => ids.has(candidate.id));
  }, [boardCandidates, filteredCandidates]);

  return (
    <>
      <DashboardToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        gender={gender}
        onGenderChange={setGender}
        religion={religion}
        onReligionChange={setReligion}
        genderOptions={genderOptions}
        religionOptions={religionOptions}
        filteredCount={filteredCandidates.length}
      />

      <DashboardContent
        view={view}
        filteredCandidates={filteredCandidates}
        boardCandidates={boardCandidates}
        visibleBoardCandidates={visibleBoardCandidates}
        timelineEvents={timelineEvents}
        role={role}
      />
    </>
  );
}
