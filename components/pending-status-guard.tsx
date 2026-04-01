"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PendingStatusGuard() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    let isActive = true;

    async function syncStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isActive) {
        return;
      }

      const { data: membership } = await supabase
        .from("cupid_memberships")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (membership?.status === "approved") {
        router.replace("/dashboard");
        router.refresh();
      }
    }

    void syncStatus();

    return () => {
      isActive = false;
    };
  }, [router]);

  return null;
}
