"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FolderKanban, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/server/actions/auth";
import { canEditCandidates, getRoleLabel } from "@/lib/role-utils";
import type { AppRole } from "@/lib/types";

type NavProfileMenuProps = {
  fullName: string;
  username: string;
  role: AppRole;
};

function clearClientAuthMirror() {
  try {
    window.localStorage.removeItem("isLoggedIn");
    window.localStorage.removeItem("userRole");
    window.localStorage.removeItem("userName");
  } catch {
    /* ignore */
  }
}

export function NavProfileMenu({ fullName, username, role }: NavProfileMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initial = fullName.trim().slice(0, 1) || "?";
  const canManageCandidates = canEditCandidates(role);

  function handleLogout() {
    clearClientAuthMirror();
    startTransition(async () => {
      try {
        await signOut();
      } catch {
        /* redirect() from server action */
      }
      window.location.reload();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-full border border-white/60 bg-white/70 py-1 pl-1 pr-2 shadow-sm backdrop-blur-sm transition hover:bg-white/90 md:gap-2.5 md:pr-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-semibold text-foreground">
          {initial}
        </div>
        <span className="hidden max-w-[8rem] truncate text-sm font-medium text-foreground md:block">
          {fullName}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">{fullName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              @{username} · {getRoleLabel(role)}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {canManageCandidates ? (
          <DropdownMenuItem
            onClick={() => router.push("/candidates/manage")}
            className="cursor-pointer gap-2 px-3 py-2 text-muted-foreground"
          >
            <FolderKanban className="size-4" />내 매물 관리
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          disabled={pending}
          onClick={handleLogout}
          className="cursor-pointer gap-2 px-3 py-2 text-muted-foreground"
        >
          <LogOut className="size-4" />
          {pending ? "로그아웃 중..." : "로그아웃"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
