import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobalNav } from "@/components/global-nav";
import { ProfileInteractiveGallery } from "@/components/profile-interactive-gallery";
import { ProfilePortrait } from "@/components/profile-portrait";
import { StudioPageShell } from "@/components/studio-page-shell";
import { MatchRecordsProvider } from "@/components/match-records-provider";
import { OperatorDeskControls } from "@/components/operator-desk-controls";
import { ProfileMatchKanban } from "@/components/profile-match-kanban";
import { ProfilePastMatchRecords } from "@/components/profile-past-match-records";
import {
  getCandidateById,
  getCandidatePhotos,
  getCandidatesBasicByIdsWithSignedImages,
  getMatchRecords,
} from "@/lib/data";
import { canEditCandidates, requireMembershipRole } from "@/lib/permissions";
import { getStatusBadgeClass, getStatusLabel } from "@/lib/status-ui";
import { getCandidateCardTitle, getCandidateGalleryLabel } from "@/lib/candidate-display";
import type { Candidate, CandidatePhoto } from "@/lib/types";

type CandidateDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

function isRenderableImageUrl(value: string | null | undefined) {
  return Boolean(
    value &&
      (value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")),
  );
}

function getTitle(candidate: NonNullable<Awaited<ReturnType<typeof getCandidateById>>>) {
  return getCandidateCardTitle(candidate);
}

function getStudioMetaChips(candidate: NonNullable<Awaited<ReturnType<typeof getCandidateById>>>) {
  const items: { label: string; tone: "rose" | "peach" }[] = [
    { label: `${candidate.birth_year}년생`, tone: "rose" },
  ];
  if (candidate.gender) items.push({ label: candidate.gender, tone: "peach" });
  if (candidate.height_text) items.push({ label: `키 ${candidate.height_text}`, tone: "rose" });
  if (candidate.region) items.push({ label: candidate.region, tone: "peach" });
  if (candidate.religion) items.push({ label: `종교 ${candidate.religion}`, tone: "rose" });
  if (candidate.mbti) items.push({ label: candidate.mbti, tone: "peach" });
  if (candidate.occupation) items.push({ label: candidate.occupation, tone: "rose" });
  return items;
}

function getDeskMessage(message?: string) {
  if (message === "updated") return "프로필 수정이 반영되었습니다.";
  if (message === "match-created") return "새 매칭 기록이 추가되었습니다.";
  if (message === "match-deleted") return "매칭 기록이 정리되었습니다.";
  if (message === "status-updated") return "후보 상태가 업데이트되었습니다.";
  if (message === "match-invalid") return "매칭 기록 입력값을 다시 확인해주세요.";
  if (message === "match-closed") return "매칭이 종료 처리되었고 과거 이력에 반영되었습니다.";
  if (message === "couple-confirmed") return "커플완성으로 확정되었습니다.";
  return message ?? null;
}

function buildProfileGalleryUrls(candidate: Candidate, photos: CandidatePhoto[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (url: string | null | undefined) => {
    if (!isRenderableImageUrl(url) || seen.has(url!)) return;
    seen.add(url!);
    out.push(url!);
  };
  add(candidate.image_url);
  for (const photo of photos) {
    add(photo.image_url);
  }
  return out;
}

export default async function CandidateDetailPage({
  params,
  searchParams,
}: CandidateDetailPageProps) {
  const { id } = await params;
  const { message } = await searchParams;
  const [membership, candidate, photos, records] = await Promise.all([
    requireMembershipRole(["admin", "super_admin"]),
    getCandidateById(id),
    getCandidatePhotos(id),
    getMatchRecords(id),
  ]);

  if (!candidate) {
    notFound();
  }

  const pastCounterpartIds = [
    ...new Set(
      records
        .filter((record) => record.outcome === "closed")
        .map((r) => r.counterpart_candidate_id)
        .filter(Boolean) as string[],
    ),
  ];

  const relatedCandidateIds = [
    ...new Set(
      [candidate.paired_candidate_id, ...pastCounterpartIds].filter((x): x is string => Boolean(x)),
    ),
  ];

  const relatedCandidates = relatedCandidateIds.length
    ? await getCandidatesBasicByIdsWithSignedImages(relatedCandidateIds)
    : [];

  const relatedById = new Map(relatedCandidates.map((c) => [c.id, c]));
  const counterpartCandidate = candidate.paired_candidate_id
    ? relatedById.get(candidate.paired_candidate_id) ?? null
    : null;

  const counterpartsById = Object.fromEntries(
    pastCounterpartIds
      .map((pid) => {
        const c = relatedById.get(pid);
        return c ? ([pid, c] as const) : null;
      })
      .filter((entry): entry is [string, Candidate] => entry != null),
  ) as Record<string, Candidate>;

  const canOperate = canEditCandidates(membership.role);
  const galleryImageUrls = buildProfileGalleryUrls(candidate, photos);
  const counterpartHeroUrl =
    counterpartCandidate && isRenderableImageUrl(counterpartCandidate.image_url)
      ? counterpartCandidate.image_url
      : null;
  const metaChips = getStudioMetaChips(candidate);
  const deskMessage = getDeskMessage(message);

  return (
    <>
      <GlobalNav membership={membership} active="profile" />

      <StudioPageShell petalCount={58}>
        <main className="overflow-x-hidden pb-32 pt-24 text-slate-800 sm:pb-40">
          <MatchRecordsProvider initialRecords={records}>
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 md:px-8 lg:px-12">
          <section className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,28rem)] xl:items-start">
            <article className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-rose-200/25 backdrop-blur-md">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
                <div className="min-w-0 p-4 sm:p-5 lg:p-6">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-b from-rose-50/80 to-white/40 p-2 shadow-[0_28px_70px_rgba(244,114,182,0.28)] backdrop-blur-sm sm:p-3">
                    <p className="mb-2 px-1 text-center text-xs font-semibold text-rose-600/90 sm:text-left">
                      {getCandidateGalleryLabel(candidate)}
                      <span className="mt-0.5 block font-normal text-slate-500">프로필 갤러리</span>
                    </p>
                    <div className="relative w-full">
                      <ProfileInteractiveGallery
                        images={galleryImageUrls}
                        sizes="(max-width: 1024px) 100vw, 48vw"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col p-6 sm:p-8 lg:py-10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">
                        Candidate Profile
                      </p>
                      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-800 sm:text-4xl">
                        {getTitle(candidate)}
                      </h1>
                      <p className="mt-3 max-w-prose text-sm leading-7 text-slate-500 sm:text-base">
                        {candidate.personality_summary || "소개 메모가 아직 등록되지 않았습니다."}
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        매물 등록{" "}
                        <span className="font-medium text-slate-600">
                          {candidate.created_by_name ?? "기록 없음"}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(candidate.status)}`}
                    >
                      {getStatusLabel(candidate.status)}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {metaChips.map((chip, chipIndex) => (
                      <span
                        key={`${chip.label}-${chipIndex}`}
                        className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                          chip.tone === "rose"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {chip.label}
                      </span>
                    ))}
                    {candidate.highlight_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-rose-200/60 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-rose-600 backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <article className="rounded-2xl border border-white/50 bg-white/60 p-5 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
                        직장 / 직무
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {candidate.work_summary || "미입력"}
                      </p>
                    </article>
                    <article className="rounded-2xl border border-white/50 bg-white/60 p-5 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
                        학력 / 이상형
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {[candidate.education || "학력 미입력", candidate.ideal_type || "이상형 미입력"].join(" · ")}
                      </p>
                    </article>
                  </div>
                </div>
              </div>
            </article>

            <aside className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">
                    Operator Desk
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                    운영 데스크
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(candidate.status)}`}
                >
                  {getStatusLabel(candidate.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {canOperate ? (
                  <Link
                    href={`/profiles/${candidate.id}/edit`}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-rose-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                  >
                    프로필 수정
                  </Link>
                ) : null}

                <OperatorDeskControls
                  candidateId={candidate.id}
                  currentStatus={candidate.status}
                  pairedCandidateId={candidate.paired_candidate_id}
                  canOperate={canOperate}
                />
              </div>

              {counterpartCandidate ? (
                <div className="mt-6 rounded-2xl border border-orange-100/70 bg-orange-50/50 p-4 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-500/90">
                    Current Pair · 연결 중
                  </p>
                  <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="w-full max-w-[200px] shrink-0 border border-white/80 bg-rose-50 shadow-[0_12px_36px_rgba(251,146,60,0.2)] sm:max-w-[176px]">
                      <ProfilePortrait
                        imageUrl={counterpartHeroUrl}
                        sizes="200px"
                        roundedClassName="rounded-2xl"
                        className="border-0"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="text-base font-semibold text-slate-800">
                        {getCandidateGalleryLabel(counterpartCandidate)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {getTitle(counterpartCandidate)}
                      </p>
                      <Link
                        href={`/profiles/${counterpartCandidate.id}`}
                        className="mt-4 inline-flex text-sm font-semibold text-rose-600 underline-offset-2 hover:text-rose-700 hover:underline"
                      >
                        상대 상세 보기
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 rounded-2xl border border-rose-100/60 bg-rose-50/40 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
                  Private Memo
                </p>
                <p className="mt-2 min-h-28 text-sm leading-7 text-slate-600">
                  {candidate.notes_private || "비공개 메모가 아직 없습니다."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition hover:border-rose-200 hover:text-rose-600"
                >
                  대시보드
                </Link>
                <Link
                  href="/candidates/new"
                  className="inline-flex h-10 items-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition hover:border-rose-200 hover:text-rose-600"
                >
                  매물 등록
                </Link>
              </div>
            </aside>
          </section>

          {deskMessage ? (
            <div className="rounded-2xl border border-rose-100/80 bg-white/85 px-4 py-3 text-sm text-slate-600 shadow-lg shadow-rose-200/15 backdrop-blur-md">
              {deskMessage}
            </div>
          ) : null}

          <section className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,min(28rem,1fr))] xl:items-start">
            <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">
                    Match Flow
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                    칸반 흐름
                  </h2>
                </div>
              </div>

              <ProfileMatchKanban candidateId={candidate.id} canOperate={canOperate} />
            </div>

            <aside className="rounded-3xl border border-slate-200/90 bg-slate-50 p-6 shadow-lg shadow-slate-200/30 backdrop-blur-md sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Past Records
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-700 sm:text-2xl">
                  과거 매칭 이력
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  커플로 이어지지 않고 종료된 만남만 모아, 다음 주선 시 참고할 수 있게 정리했습니다.
                </p>
              </div>

              <ProfilePastMatchRecords
                candidateId={candidate.id}
                canOperate={canOperate}
                counterpartsById={counterpartsById}
              />
            </aside>
          </section>

          <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">
              Profile Read
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
              소개 판단 메모
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              사진은 상단 프로필 갤러리에서 썸네일로 전환하고, 메인 사진을 누르면 전체 화면으로 감상할 수 있습니다.
              {galleryImageUrls.length > 0 ? ` (등록 ${galleryImageUrls.length}장)` : null}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: "직장 / 직무", value: candidate.work_summary || "미입력" },
                { label: "학력", value: candidate.education || "미입력" },
                { label: "MBTI", value: candidate.mbti || "미입력" },
                { label: "이상형", value: candidate.ideal_type || "미입력" },
              ].map((item) => (
                <article key={item.label} className="rounded-2xl border border-white/50 bg-white/65 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-400/90">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.value}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
          </MatchRecordsProvider>
        </main>
      </StudioPageShell>
    </>
  );
}
