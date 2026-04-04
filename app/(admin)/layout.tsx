import { BottomNav } from "@/components/bottom-nav";
import { requireApprovedMembership } from "@/lib/permissions";

export default async function AdminLayout({
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
