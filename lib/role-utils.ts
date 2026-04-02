import type { AppRole } from "@/lib/types";

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
