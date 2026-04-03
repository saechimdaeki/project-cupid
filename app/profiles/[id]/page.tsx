import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobalNav } from "@/components/global-nav";
import { ProfilePortrait } from "@/components/profile-portrait";
import { StudioPageShell } from "@/components/studio-page-shell";
import { deleteMatchRecord, updateCandidateStatus } from "@/lib/admin-actions";
import { getCandidateById, getCandidatePhotos, getMatchRecords } from "@/lib/data";
import { canEditCandidates, requireMembershipRole } from "@/lib/permissions";
import { getStatusBadgeClass, getStatusLabel } from "@/lib/status-ui";
import type { MatchOutcome, MatchRecord } from "@/lib/types";

type CandidateDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

const STATUS_OPTIONS = ["active", "matched", "couple", "archived"] as const;

const MATCH_GROUPS: Array<{
  key: "ongoing" | "couple" | "closed";
  label: string;
  outcomes: MatchOutcome[];
}> = [
  {
    key: "ongoing",
    label: "진행 중",
    outcomes: ["intro_sent", "first_meeting", "dating"],
  },
  {
    key: "couple",
    label: "커플완성",
    outcomes: ["couple"],
  },
  {
    key: "closed",
    label: "종료",
    outcomes: ["closed"],
  },
];

function getOutcomeLabel(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":
      return "소개 시작";
    case "first_meeting":
      return "첫 만남";
    case "dating":
      return "후속 진행";
    case "couple":
      return "커플완성";
    case "closed":
      return "종료";
  }
}

function getOutcomeBadgeClass(outcome: MatchOutcome) {
  switch (outcome) {
    case "intro_sent":
    case "first_meeting":
    case "dating":
      return "border-rose-200/80 bg-rose-50 text-rose-600";
    case "couple":
      return "border-orange-200/80 bg-orange-50 text-orange-700";
    case "closed":
      return "border-rose-100 bg-white/80 text-slate-500";
  }
}

function isRenderableImageUrl(value: string | null | undefined) {
  return Boolean(
    value &&
      (value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")),
  );
}

function getTitle(candidate: NonNullable<Awaited<ReturnType<typeof getCandidateById>>>) {
  const year = String(candidate.birth_year).slice(-2);
  return `${year} ${candidate.occupation || candidate.full_name}`;
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
  return message ?? null;
}

function groupRecords(records: MatchRecord[]) {
  return MATCH_GROUPS.map((group) => ({
    ...group,
    records: records.filter((record) => group.outcomes.includes(record.outcome)),
  }));
}

export default async function CandidateDetailPage({
  params,
  searchParams,
}: CandidateDetailPageProps) {
  const { id } = await params;
  const { message } = await searchParams;
  const [membership, candidate] = await Promise.all([
    requireMembershipRole(["admin", "super_admin"]),
    getCandidateById(id),
  ]);

  if (!candidate) {
    notFound();
  }

  const [photos, records, counterpartCandidate] = await Promise.all([
    getCandidatePhotos(candidate.id),
    getMatchRecords(candidate.id),
    candidate.paired_candidate_id ? getCandidateById(candidate.paired_candidate_id) : Promise.resolve(null),
  ]);

  const canOperate = canEditCandidates(membership.role);
  const heroImageUrl = isRenderableImageUrl(candidate.image_url) ? candidate.image_url : null;
  const counterpartHeroUrl =
    counterpartCandidate && isRenderableImageUrl(counterpartCandidate.image_url)
      ? counterpartCandidate.image_url
      : null;
  const metaChips = getStudioMetaChips(candidate);
  const groupedRecords = groupRecords(records);
  const deskMessage = getDeskMessage(message);

  return (
    <>
      <GlobalNav membership={membership} active="profile" />

      <StudioPageShell petalCount={58}>
        <main className="overflow-x-hidden pb-32 pt-24 text-slate-800 sm:pb-40">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 md:px-8 lg:px-12">
          <section className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,28rem)] xl:items-start">
            <article className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-rose-200/25 backdrop-blur-md">
              <div className="grid gap-0 lg:grid-cols-[minmax(340px,0.95fr)_minmax(0,1.15fr)]">
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-b from-rose-50/80 to-white/40 p-2 shadow-[0_28px_70px_rgba(244,114,182,0.28)] backdrop-blur-sm sm:p-3">
                    <p className="mb-2 px-1 text-center text-xs font-semibold text-rose-600/90 sm:text-left">
                      {candidate.full_name}
                      <span className="mt-0.5 block font-normal text-slate-500">대표 사진</span>
                    </p>
                    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
                      <ProfilePortrait
                        imageUrl={heroImageUrl}
                        sizes="(max-width: 1024px) 100vw, 42vw"
                        roundedClassName="rounded-3xl"
                        priority
                        className="min-h-[280px] max-h-[min(85vh,720px)] w-full sm:min-h-[320px] lg:min-h-[400px]"
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

                <form action={updateCandidateStatus} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <input type="hidden" name="candidateId" value={candidate.id} />
                  <select
                    name="status"
                    defaultValue={candidate.status}
                    className="h-11 rounded-xl border border-rose-100/80 bg-white/90 px-4 text-sm text-slate-700 shadow-sm outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-rose-200/80 bg-white/90 px-4 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-50"
                  >
                    상태 변경
                  </button>
                </form>
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
                        {counterpartCandidate.full_name}
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

          <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-8">
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

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {groupedRecords.map((group) => (
                <article key={group.key} className="rounded-2xl border border-white/50 bg-white/60 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-800">{group.label}</h3>
                    <span className="rounded-full bg-rose-100/80 px-3 py-1 text-xs font-semibold text-rose-600">
                      {group.records.length}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {group.records.length ? (
                      group.records.map((record) => (
                        <article key={record.id} className="rounded-xl border border-rose-100/50 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800">
                                {record.counterpart_label}
                              </h4>
                              <p className="mt-1 text-xs text-slate-400">{record.happened_on}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getOutcomeBadgeClass(record.outcome)}`}
                              >
                                {getOutcomeLabel(record.outcome)}
                              </span>
                              {canOperate ? (
                                <form action={deleteMatchRecord}>
                                  <input type="hidden" name="candidateId" value={candidate.id} />
                                  <input type="hidden" name="recordId" value={record.id} />
                                  <button
                                    type="submit"
                                    className="text-[11px] font-medium text-slate-400 hover:text-slate-700"
                                  >
                                    삭제
                                  </button>
                                </form>
                              ) : null}
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{record.summary}</p>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-rose-200/60 bg-white/70 px-4 py-8 text-sm text-slate-500">
                        아직 기록이 없습니다.
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <article className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">
                Profile Read
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                소개 판단 메모
              </h3>
              <div className="mt-5 grid gap-3">
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
            </article>

            <article className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">
                Photo Gallery
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                등록된 사진
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {photos.length ? (
                  photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-rose-100/60 bg-rose-50/30 shadow-[0_12px_36px_rgba(244,114,182,0.15)]"
                    >
                      <Image
                        src={photo.image_url}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 24vw, (min-width: 640px) 40vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-rose-200/60 bg-white/70 px-4 py-10 text-sm text-slate-500 backdrop-blur-sm">
                    등록된 사진이 없습니다.
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
        </main>
      </StudioPageShell>
    </>
  );
}
