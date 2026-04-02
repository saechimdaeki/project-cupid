import { signOut } from "@/lib/auth-actions";
import { roleLabel } from "@/lib/permissions";
import type { Membership } from "@/lib/types";

type AccountPanelProps = {
  membership: Membership;
};

export function AccountPanel({ membership }: AccountPanelProps) {
  return (
    <section className="accountPanel w-full rounded-[28px] border border-[#ead8cf] bg-gradient-to-br from-white to-[#fff6ef] p-5 shadow-[0_14px_40px_rgba(143,95,89,0.1)] lg:min-w-[320px]">
      <div className="accountPanelCopy flex flex-col gap-2">
        <span className="accountGreeting text-xs font-semibold uppercase tracking-[0.28em] text-[#b46d59]">환영합니다</span>
        <strong className="text-[clamp(1.75rem,7vw,2.4rem)] font-semibold tracking-[-0.06em] text-[#24161c]">{membership.full_name}님</strong>
        <span className="accountHandle text-sm leading-6 text-[#7a636b] sm:text-base">
          @{membership.username} · {roleLabel(membership.role)}
        </span>
      </div>

      <form action={signOut} className="accountPanelForm mt-4">
        <button
          className="accountLogoutButton inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
          type="submit"
        >
          로그아웃
        </button>
      </form>
    </section>
  );
}
