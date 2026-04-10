import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { WorkspaceDecorations } from "@/components/workspace-decorations";
import { getTimelinePageData } from "@/lib/data";
import { requireApprovedMembership, roleLabel } from "@/lib/permissions";

type TimelinePageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const [membership, timelineData] = await Promise.all([
    requireApprovedMembership(),
    getTimelinePageData(page),
  ]);
  const timelineEvents = timelineData.events;
  const totalPages = Math.max(1, Math.ceil(timelineData.totalCount / timelineData.pageSize));
  const currentPage = Math.min(Math.max(1, timelineData.page), totalPages);

  return (
    <main className="workspacePage min-h-screen bg-[linear-gradient(180deg,#fff8f2_0%,#fff3ec_42%,#fffaf6_100%)] text-[#24161c]">
      <div className="landingWrap relative mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-8 pb-32 pt-4 md:pb-10 lg:px-12">
        <WorkspaceDecorations />

        <header className="flex flex-col gap-4 rounded-[30px] border border-[#ead8cf] bg-white/85 p-4 shadow-[0_14px_40px_rgba(143,95,89,0.08)] backdrop-blur-sm lg:flex-row lg:items-start lg:justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[#e9d7cf] bg-gradient-to-br from-[#fffaf7] to-[#fff1e8] text-2xl font-semibold text-[#d1a06b]">
              C
            </div>
            <div className="min-w-0">
              <strong className="block text-[clamp(1.1rem,4vw,1.8rem)] font-semibold tracking-[-0.04em] text-[#24161c]">
                Project Cupid
              </strong>
              <span className="block text-sm leading-6 text-[#7a636b] sm:text-base">
                {membership.full_name} · {roleLabel(membership.role)}
              </span>
            </div>
          </Link>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[340px]">
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
                href="/dashboard"
              >
                대시보드
              </Link>
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
                href="/"
              >
                홈으로
              </Link>
            </div>
            <AccountPanel membership={membership} />
          </div>
        </header>

        <section className="sectionBlock rounded-[34px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
            Full Timeline
          </p>
          <h1 className="mt-3 text-[clamp(2rem,8vw,3.6rem)] font-semibold tracking-[-0.08em] text-[#24161c]">
            전체 매칭 타임라인
          </h1>
          <p className="mt-3 max-w-[64ch] text-[15px] leading-7 text-[#6d5961] sm:text-base">
            같은 이벤트가 양쪽 후보에 각각 저장되더라도, 전체 보기에서는 한 번만 읽히도록
            정리했습니다.
          </p>

          <div className="mt-6 grid gap-4">
            {timelineEvents.length ? (
              timelineEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[26px] border border-[#ead8cf] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,247,242,0.96))] p-5 shadow-[0_12px_28px_rgba(143,95,89,0.06)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[clamp(1.2rem,4vw,1.8rem)] font-semibold tracking-[-0.05em] text-[#24161c]">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#6d5961]">{event.summary}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#a16a4c]">
                      {event.happened_on}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[26px] border border-dashed border-[#e6d5ca] bg-[#fffaf6] px-5 py-10 text-center text-sm leading-7 text-[#8b6a63]">
                아직 기록된 매칭 타임라인이 없습니다.
              </div>
            )}
          </div>

          {totalPages > 1 ? (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-[24px] border border-[#ead8cf] bg-white/80 px-4 py-4 text-sm text-[#6d5961] shadow-[0_12px_28px_rgba(143,95,89,0.06)] sm:flex-row">
              <p>
                페이지 <span className="font-semibold text-[#24161c]">{currentPage}</span> /{" "}
                <span className="font-semibold text-[#24161c]">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Link
                  href={currentPage > 1 ? `/timeline?page=${currentPage - 1}` : "/timeline"}
                  className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 font-semibold transition ${
                    currentPage > 1
                      ? "border border-[#ead8cf] bg-white text-[#24161c] hover:-translate-y-0.5"
                      : "cursor-not-allowed border border-[#f2e5de] bg-[#fff8f3] text-[#b79a90]"
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  이전
                </Link>
                <Link
                  href={`/timeline?page=${currentPage + 1}`}
                  className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 font-semibold transition ${
                    currentPage < totalPages
                      ? "border border-[#ead8cf] bg-white text-[#24161c] hover:-translate-y-0.5"
                      : "pointer-events-none cursor-not-allowed border border-[#f2e5de] bg-[#fff8f3] text-[#b79a90]"
                  }`}
                  aria-disabled={currentPage >= totalPages}
                >
                  다음
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
