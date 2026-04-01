import { cache } from "react";
import { redirect } from "next/navigation";

import { demoViewer } from "@/lib/demo-data";
import type { AppRole, ViewerProfile } from "@/types/domain";

export const getViewer = cache(async (): Promise<ViewerProfile | null> => {
  return demoViewer;
});

export async function requireApprovedViewer() {
  const viewer = await getViewer();

  if (!viewer) {
    redirect("/signin");
  }

  if (viewer.approvalStatus !== "approved") {
    redirect("/pending");
  }

  return viewer;
}

export async function requireRole(roles: AppRole[]) {
  const viewer = await requireApprovedViewer();

  if (!roles.includes(viewer.role)) {
    redirect("/dashboard");
  }

  return viewer;
}

