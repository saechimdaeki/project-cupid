import { cache } from "react";
import { redirect } from "next/navigation";
import { mockMemberships } from "@/lib/mock-data";
import {
  canAccessAdmin,
  canAccessAdminPanel,
  canAccessCandidateDetail,
  canEditCandidates,
  canManageRoles,
  getRoleLabel,
  roleLabel,
} from "@/lib/role-utils";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Membership } from "@/lib/types";
export {
  canAccessAdmin,
  canAccessAdminPanel,
  canAccessCandidateDetail,
  canEditCandidates,
  canManageRoles,
  getRoleLabel,
  roleLabel,
};

export const getCurrentMembership = cache(async function getCurrentMembership(): Promise<Membership | null> {
  const supabase = await createClient();

  if (!supabase) {
    return mockMemberships[0] ?? null;
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId =
    !claimsError && claimsData?.claims?.sub ? String(claimsData.claims.sub) : null;

  if (!userId) {
    return null;
  }

  const { data } = await supabase
    .from("cupid_memberships")
    .select("user_id, username, full_name, role, status, approved_by, approved_at, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  return (data as Membership | null) ?? null;
});

export async function requireApprovedMembership() {
  const membership = await getCurrentMembership();

  if (!membership) {
    redirect("/login");
  }

  if (membership.status !== "approved") {
    redirect("/pending");
  }

  return membership;
}

export async function requireMembershipRole(roles: AppRole[]) {
  const membership = await requireApprovedMembership();

  if (!roles.includes(membership.role)) {
    redirect("/dashboard");
  }

  return membership;
}
