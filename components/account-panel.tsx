import { signOut } from "@/lib/auth-actions";
import { roleLabel } from "@/lib/permissions";
import type { Membership } from "@/lib/types";

type AccountPanelProps = {
  membership: Membership;
};

export function AccountPanel({ membership }: AccountPanelProps) {
  return (
    <section className="accountPanel">
      <div className="accountPanelCopy">
        <span className="accountGreeting">환영합니다</span>
        <strong>{membership.full_name}님</strong>
        <span className="accountHandle">
          @{membership.username} · {roleLabel(membership.role)}
        </span>
      </div>

      <form action={signOut} className="accountPanelForm">
        <button className="secondaryButton accountLogoutButton" type="submit">
          로그아웃
        </button>
      </form>
    </section>
  );
}
