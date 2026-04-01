export type AppRole = "super_admin" | "curator" | "member";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type CandidateStatus =
  | "active"
  | "paused"
  | "matched"
  | "coupled"
  | "graduated";
export type MatchOutcome = "in_progress" | "closed" | "coupled";

export interface ViewerProfile {
  id: string;
  fullName: string;
  role: AppRole;
  approvalStatus: ApprovalStatus;
}

export interface CandidateProfile {
  id: string;
  slug: string;
  headline: string;
  name: string;
  birthYear: number;
  religion: string;
  location: string;
  occupation: string;
  status: CandidateStatus;
  summary: string;
  idealType: string[];
  personalityTags: string[];
  strengths: string[];
  cautions: string[];
  imageHint: string;
  lastUpdatedAt: string;
}

export interface MatchHistoryItem {
  id: string;
  candidateId: string;
  counterpartLabel: string;
  matchmaker: string;
  introducedAt: string;
  stageLabel: string;
  outcome: MatchOutcome;
  story: string;
}

