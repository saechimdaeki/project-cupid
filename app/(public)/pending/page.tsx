import { redirect } from "next/navigation";
import { PendingInviteView } from "@/components/pending-invite-view";
import { getCurrentMembership } from "@/lib/permissions";

type PendingPageProps = {
  searchParams: Promise<{
    reason?: string;
    code?: string;
    uid?: string;
    status?: string;
    role?: string;
  }>;
};

export default async function PendingPage({ searchParams }: PendingPageProps) {
  const membership = await getCurrentMembership();

  if (!membership) {
    redirect("/login");
  }

  if (membership.status === "approved") {
    redirect("/dashboard");
  }

  const { reason, code, uid, status, role } = await searchParams;
  const pendingMessage =
    reason || status || role || code || uid
      ? "아직 계정 승인이 끝나지 않았습니다. 승인 완료 후 다시 자동으로 입장할 수 있습니다."
      : null;

  const contactLabel = process.env.NEXT_PUBLIC_CUPID_APPROVAL_CONTACT?.trim() || "saechimdaeki";

  return (
    <PendingInviteView
      membership={membership}
      contactLabel={contactLabel}
      pendingMessage={pendingMessage}
    />
  );
}
