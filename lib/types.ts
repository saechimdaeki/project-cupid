export type MembershipStatus = "pending" | "approved" | "rejected";
export type AppRole = "super_admin" | "admin" | "viewer";
export type CandidateStatus =
  | "active"
  | "matched"
  | "couple"
  | "graduated"
  | "archived";
export type MatchOutcome =
  | "intro_sent"
  | "first_meeting"
  | "dating"
  | "couple"
  | "closed";

export type Candidate = {
  id: string;
  full_name: string;
  birth_year: number;
  gender: string;
  region: string;
  occupation: string;
  work_summary: string;
  education: string;
  religion: string;
  mbti: string | null;
  personality_summary: string;
  ideal_type: string;
  notes_private: string;
  status: CandidateStatus;
  highlight_tags: string[];
  image_url: string | null;
  paired_candidate_id: string | null;
  created_at: string;
  created_by_name?: string;
};

export type CandidatePhoto = {
  id: string;
  candidate_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type MatchRecord = {
  id: string;
  candidate_id: string;
  counterpart_label: string;
  counterpart_candidate_id?: string | null;
  matchmaker_name: string;
  outcome: MatchOutcome;
  summary: string;
  happened_on: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  summary: string;
  happened_on: string;
  outcome: MatchOutcome;
  candidate_ids: string[];
};

export type Membership = {
  user_id: string;
  username: string;
  full_name: string;
  role: AppRole;
  status: MembershipStatus;
  approved_by: string | null;
  approved_at?: string | null;
  created_at: string;
};
