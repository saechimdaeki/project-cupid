import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CupidLogo } from "@/components/cupid-logo";
import { NavProfileMenu } from "@/components/nav-profile-menu";
import { cn } from "@/lib/cn";
import { canAccessAdminPanel, canEditCandidates } from "@/lib/role-utils";
import type { Membership } from "@/lib/types";

type GlobalNavProps = {
  membership?: Membership | null;
  active?: "dashboard" | "candidates" | "profile" | "admin";
};

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-5 py-2.5 text-base font-semibold transition-colors duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function GlobalNav({ membership, active = "dashboard" }: GlobalNavProps) {
  const isLoggedIn = membership?.status === "approved";
  const isSuper = isLoggedIn && canAccessAdminPanel(membership.role);
  const isEditor = isLoggedIn && canEditCandidates(membership.role);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/50 bg-white/40 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-2.5 md:px-8 lg:px-12">
        {/* LEFT: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full border border-white/60 bg-white/70 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm transition hover:bg-white/90"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-orange-50 text-primary">
            <CupidLogo size={16} />
          </span>
          <span className="text-sm font-semibold text-foreground">
            <span className="sm:hidden">Cupid</span>
            <span className="hidden sm:inline">Project Cupid</span>
          </span>
        </Link>

        {/* CENTER: Navigation (md+, super_admin only) */}
        {isSuper ? (
          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 py-1.5 shadow-sm backdrop-blur-sm md:flex"
            aria-label="관리 메뉴"
          >
            <NavLink
              href="/dashboard"
              label="대시보드"
              isActive={active === "dashboard" || active === "candidates"}
            />
            <NavLink href="/admin" label="승인·권한 관리" isActive={active === "admin"} />
          </nav>
        ) : null}

        {/* RIGHT: Actions + Profile */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2 md:gap-3">
            {isEditor ? (
              <Link
                href="/candidates/new"
                className="hidden items-center gap-1.5 rounded-full border border-white/60 bg-white/70 px-4 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white/90 md:inline-flex"
              >
                <Plus className="size-3.5" />
                매물 등록
              </Link>
            ) : null}

            <NavProfileMenu
              fullName={membership.full_name}
              username={membership.username}
              role={membership.role}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            className="h-9 rounded-full border-white/60 bg-white/70 px-5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white/90"
            render={<Link href="/login" />}
          >
            로그인
          </Button>
        )}
      </div>
    </header>
  );
}
