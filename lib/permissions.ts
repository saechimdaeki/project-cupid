import { mockMemberships } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Membership } from "@/lib/types";

const detailRoles = new Set<AppRole>(["super_admin", "admin"]);

export function getRoleLabel(role: AppRole) {
  switch (role) {
    case "super_admin":
      return "슈퍼어드민";
    case "admin":
      return "어드민";
    case "viewer":
      return "뷰어";
  }
}

export const roleLabel = getRoleLabel;

export function canAccessAdminPanel(role: AppRole) {
  return role === "super_admin";
}

export function canAccessAdmin(role: AppRole) {
  return canAccessAdminPanel(role);
}

export function canAccessCandidateDetail(role: AppRole) {
  return detailRoles.has(role);
}

export function canEditCandidates(role: AppRole) {
  return detailRoles.has(role);
}

export function canManageRoles(role: AppRole) {
  return role === "super_admin";
}

export async function getCurrentMembership(): Promise<Membership | null> {
  const supabase = await createClient();

  if (!supabase) {
    return mockMemberships[0] ?? null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("cupid_memberships")
    .select("user_id, username, full_name, role, status, approved_by, approved_at, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data as Membership | null) ?? null;
}
