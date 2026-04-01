"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WelcomeState = {
  full_name: string;
};

export function UserWelcome() {
  const [membership, setMembership] = useState<WelcomeState | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    async function loadMembership() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isActive) {
        return;
      }

      const { data } = await supabase
        .from("cupid_memberships")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (isActive && data) {
        setMembership(data);
      }
    }

    void loadMembership();

    return () => {
      isActive = false;
    };
  }, []);

  if (!membership) {
    return null;
  }

  return (
    <div className="welcomePill">
      환영합니다, <strong>{membership.full_name}</strong>님
    </div>
  );
}
