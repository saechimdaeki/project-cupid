import Link from "next/link";
import { CandidateAvatarThumb } from "@/components/candidate-avatar-thumb";
import { CandidateVisibilityControl } from "@/components/candidate-visibility-control";
import { GlobalNav } from "@/components/global-nav";
import { Badge } from "@/components/ui/badge";
import { getManagedCandidates } from "@/lib/data";
import { requireMembershipRole } from "@/lib/permissions";
import { getStatusBadgeClass, getStatusLabel } from "@/lib/status-ui";

type ManageCandidatesPageProps = {
  searchParams: Promise<{ scope?: string }>;
};

export default async function ManageCandidatesPage({
  searchParams,
}: ManageCandidatesPageProps) {
  const membership = await requireMembershipRole(["admin", "super_admin"]);
  const { scope } = await searchParams;
  const resolvedScope =
    membership.role === "super_admin" && scope === "all" ? "all" : "mine";
  const candidates = await getManagedCandidates(membership, resolvedScope);

  return (
    <>
      <GlobalNav membership={membership} active="candidates" />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary px-4 pb-24 pt-24 text-foreground md:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
          <section className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400/90">
                  Candidate Visibility
                </p>
                <h1 className="mt-3 text-[clamp(2rem,6vw,3.4rem)] font-semibold tracking-[-0.06em] text-slate-800">
                  내 매물 관리
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  비활성화한 매물은 대시보드와 비교 리스트에서 숨겨집니다. 등록자 본인과
                  슈퍼어드민만 변경할 수 있습니다.
                </p>
              </div>

              {membership.role === "super_admin" ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/85 p-1 shadow-sm">
                  <Link
                    href="/candidates/manage"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      resolvedScope === "mine"
                        ? "bg-rose-500 text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    내가 등록한 매물
                  </Link>
                  <Link
                    href="/candidates/manage?scope=all"
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      resolvedScope === "all"
                        ? "bg-rose-500 text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    전체 매물
                  </Link>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-2 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {resolvedScope === "all" ? "전체 매물" : "내가 등록한 매물"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  총 {candidates.length}건
                </p>
              </div>
              <Link
                href="/candidates/new"
                className="inline-flex h-10 items-center rounded-full bg-rose-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
              >
                매물 등록
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {candidates.length ? (
                candidates.map((candidate) => {
                  const isVisible = candidate.status !== "archived";

                  return (
                    <article
                      key={candidate.id}
                      className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <CandidateAvatarThumb
                          imageUrl={candidate.image_url}
                          gender={candidate.gender}
                          className="h-14 w-14"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-base font-semibold text-slate-800">
                              {candidate.full_name || `${String(candidate.birth_year).slice(-2)}년생 후보`}
                            </p>
                            <Badge
                              variant="outline"
                              className={getStatusBadgeClass(candidate.status)}
                            >
                              {getStatusLabel(candidate.status)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                isVisible
                                  ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                  : "border-slate-200 bg-slate-100 text-slate-600"
                              }
                            >
                              {isVisible ? "활성" : "비활성화"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {[candidate.region, candidate.occupation, candidate.work_summary]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                      </div>

                      <div className="md:min-w-[260px]">
                        <CandidateVisibilityControl
                          candidateId={candidate.id}
                          isVisible={isVisible}
                          canManage
                          variant="inline"
                        />
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center text-sm text-slate-500">
                  표시할 매물이 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
