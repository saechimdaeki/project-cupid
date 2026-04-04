import { signOut } from "@/lib/auth-actions";
import { roleLabel } from "@/lib/permissions";
import type { Membership } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type AccountPanelProps = {
  membership: Membership;
};

export function AccountPanel({ membership }: AccountPanelProps) {
  return (
    <Card className="accountPanel w-full rounded-[28px] border-border bg-gradient-to-br from-card to-secondary p-5 shadow-[0_14px_40px_rgba(143,95,89,0.1)] lg:min-w-[320px]">
      <CardContent className="accountPanelCopy flex flex-col gap-2 p-0">
        <span className="accountGreeting text-xs font-semibold uppercase tracking-[0.28em] text-primary">환영합니다</span>
        <strong className="text-[clamp(1.75rem,7vw,2.4rem)] font-semibold tracking-[-0.06em] text-foreground">{membership.full_name}님</strong>
        <span className="accountHandle text-sm leading-6 text-muted-foreground sm:text-base">
          @{membership.username} · {roleLabel(membership.role)}
        </span>
      </CardContent>

      <form action={signOut} className="accountPanelForm mt-4">
        <Button
          variant="outline"
          className="accountLogoutButton min-h-12 w-full rounded-full transition hover:-translate-y-0.5"
          type="submit"
        >
          로그아웃
        </Button>
      </form>
    </Card>
  );
}
