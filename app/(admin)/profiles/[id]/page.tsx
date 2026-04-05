import { Suspense } from "react";
import { GlobalNav } from "@/components/global-nav";
import { ProfileDetailContent } from "@/components/profile-detail-content";
import { ProfileDetailSkeleton } from "@/components/profile-detail-skeleton";
import { requireMembershipRole } from "@/lib/permissions";

type CandidateDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

export default async function CandidateDetailPage({
  params,
  searchParams,
}: CandidateDetailPageProps) {
  const { id } = await params;
  const { message } = await searchParams;
  const membership = await requireMembershipRole(["admin", "super_admin"]);

  return (
    <>
      <GlobalNav membership={membership} active="profile" />
      <Suspense fallback={<ProfileDetailSkeleton />}>
        <ProfileDetailContent id={id} message={message} membership={membership} />
      </Suspense>
    </>
  );
}
