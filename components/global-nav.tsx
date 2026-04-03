import Link from "next/link";
import { DashboardLogoutButton } from "@/components/dashboard-logout-button";
import { canAccessAdminPanel, canEditCandidates } from "@/lib/role-utils";
import type { Membership } from "@/lib/types";

type GlobalNavProps = {
  membership: Membership;
  active?: "dashboard" | "candidates" | "profile" | "admin";
};

function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/50 bg-white/45 backdrop-blur-lg">
      <div className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-4 py-3 md:gap-3 md:px-8 md:py-3.5 lg:px-12">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3 md:gap-4">
          <Link
            href="/"
            className="font-serif text-lg font-bold tracking-[0.12em] text-rose-500 transition hover:text-rose-600 md:tracking-[0.18em] md:text-2xl"
          >
            PROJECT CUPID
          </Link>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-2 py-1.5 text-xs font-semibold text-rose-600 shadow-sm backdrop-blur-sm transition hover:border-rose-200 hover:bg-white/85 md:px-3 md:py-2 md:text-sm"
            aria-label="홈으로 이동"
          >
            <HomeIcon />
            <span className="hidden sm:inline">홈</span>
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

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-3 md:gap-4">
          {canEditCandidates(membership.role) ? (
            <Link
              href="/candidates/new"
              className="hidden rounded-full border border-rose-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-white sm:inline-flex"
            >
              매물 등록
            </Link>
          ) : null}

          <div className="flex max-w-none items-center gap-2 rounded-full border border-white/60 bg-white/65 py-1.5 pl-1.5 pr-1.5 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-md md:max-w-[min(100%,20rem)] md:gap-3 md:pr-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-semibold text-slate-700 md:h-10 md:w-10">
              {membership.full_name.trim() ? membership.full_name.trim().slice(0, 1) : "?"}
            </div>
            <p className="hidden min-w-0 truncate text-sm font-medium text-slate-600 md:block">
              환영합니다,{" "}
              <span className="font-semibold text-slate-800">{membership.full_name}</span>님 ❤️
            </p>
            <DashboardLogoutButton className="shrink-0 rounded-full px-2 py-1.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 md:px-3" />
          </div>
        </div>
      </div>
    </header>
  );
}
