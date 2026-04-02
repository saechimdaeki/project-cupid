import Link from "next/link";
import { DashboardLogoutButton } from "@/components/dashboard-logout-button";
import { canAccessAdminPanel, canEditCandidates } from "@/lib/role-utils";
import type { Membership } from "@/lib/types";

type GlobalNavProps = {
  membership: Membership;
  active?: "dashboard" | "candidates" | "profile" | "admin";
};

function CenterNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-5 py-2 text-sm font-semibold tracking-[-0.02em] transition-all duration-300 ease-out ${
        active
          ? "bg-rose-500/15 text-rose-600 shadow-[0_4px_20px_rgb(244,114,182,0.2)]"
          : "text-rose-400/90 hover:bg-white/50 hover:text-rose-500"
      }`}
    >
      {label}
    </Link>
  );
}

export function GlobalNav({ membership, active = "dashboard" }: GlobalNavProps) {
  const isSuper = canAccessAdminPanel(membership.role);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/50 bg-white/40 backdrop-blur-lg">
      <div className="relative mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-6 py-3.5 md:px-12 lg:px-24">
        <div className="flex min-w-0 shrink-0 items-center gap-4">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-rose-500 transition hover:text-rose-600"
          >
            Project Cupid
          </Link>
        </div>

        {isSuper ? (
          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-white/60 bg-white/50 px-1.5 py-1 shadow-[inset_0_1px_8px_rgba(244,114,182,0.08)] backdrop-blur-sm md:flex"
            aria-label="관리 메뉴"
          >
            <CenterNavLink
              href="/dashboard"
              label="대시보드"
              active={active === "dashboard" || active === "candidates"}
            />
            <CenterNavLink href="/admin" label="승인·권한 관리" active={active === "admin"} />
          </nav>
        ) : null}

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-3 sm:gap-4">
          {canEditCandidates(membership.role) ? (
            <Link
              href="/candidates/new"
              className="hidden rounded-full border border-rose-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-white sm:inline-flex"
            >
              매물 등록
            </Link>
          ) : null}

          <div className="flex max-w-[min(100%,20rem)] items-center gap-3 rounded-full border border-white/60 bg-white/65 py-1.5 pl-1.5 pr-2 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-md sm:pr-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-semibold text-slate-700">
              {membership.full_name.trim() ? membership.full_name.trim().slice(0, 1) : "?"}
            </div>
            <p className="hidden min-w-0 truncate text-sm font-medium text-slate-600 lg:block">
              환영합니다,{" "}
              <span className="font-semibold text-slate-800">{membership.full_name}</span>님 ❤️
            </p>
            <DashboardLogoutButton className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50 hover:text-rose-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
