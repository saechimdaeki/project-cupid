import type { Candidate, MatchRecord, Membership } from "@/lib/types";

export const mockCandidates: Candidate[] = [];

export const mockMatchRecords: MatchRecord[] = [];

export const mockMemberships: Membership[] = [
  {
    user_id: "user-1",
    username: "junseong",
    full_name: "준성 김",
    role: "super_admin",
    status: "approved",
    approved_by: null,
    created_at: "2026-03-15T00:00:00.000Z",
  },
];
