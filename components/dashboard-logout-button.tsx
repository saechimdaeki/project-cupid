"use client";

import { useTransition } from "react";
import { signOut } from "@/lib/auth-actions";

function clearClientAuthMirror() {
  try {
    window.localStorage.removeItem("isLoggedIn");
    window.localStorage.removeItem("userRole");
    window.localStorage.removeItem("userName");
  } catch {
    /* ignore */
  }
}

type DashboardLogoutButtonProps = {
  className?: string;
};

export function DashboardLogoutButton({ className }: DashboardLogoutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        clearClientAuthMirror();
        startTransition(async () => {
          try {
            await signOut();
          } catch {
            /* redirect() from server action */
          }
          window.location.reload();
        });
      }}
    >
      로그아웃
    </button>
  );
}
