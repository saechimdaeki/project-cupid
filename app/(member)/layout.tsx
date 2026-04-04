import { BottomNav } from "@/components/bottom-nav";
import { requireApprovedMembership } from "@/lib/permissions";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const membership = await requireApprovedMembership();

  return (
    <>
      {children}
      <BottomNav role={membership.role} />
    </>
  );
}
