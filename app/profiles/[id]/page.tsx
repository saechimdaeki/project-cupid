import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlobalNav } from "@/components/global-nav";
import { PersonPreview } from "@/components/person-preview";
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
      return "border-blue-100 bg-blue-50 text-blue-600";
    case "couple":
      return "border-emerald-100 bg-emerald-50 text-emerald-600";
    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600";
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

function getMetaChips(candidate: NonNullable<Awaited<ReturnType<typeof getCandidateById>>>) {
  return [
    `${candidate.birth_year}년생`,
    candidate.gender || null,
    candidate.height_text ? `키 ${candidate.height_text}` : null,
    candidate.region || null,
    candidate.religion ? `종교 ${candidate.religion}` : null,
    candidate.mbti || null,
  ].filter(Boolean) as string[];
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
  const metaChips = getMetaChips(candidate);
  const groupedRecords = groupRecords(records);
  const deskMessage = getDeskMessage(message);

  return (
    <>
      <GlobalNav membership={membership} active="profile" />

      <main className="min-h-screen bg-slate-50 py-24 text-slate-800">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 md:px-12 lg:px-24">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_24rem]">
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
                <div className="relative min-h-[320px] bg-slate-100">
                  <PersonPreview
                    imageUrl={heroImageUrl}
                    gender={candidate.gender}
                    className="min-h-[320px] bg-slate-100 lg:min-h-[560px]"
                    fetchPriority="high"
                    loading="eager"
                    size="lg"
                    fit="cover"
                    position="center"
                  />
                </div>

                <div className="flex flex-col p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Candidate Profile
                      </p>
                      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-800 sm:text-4xl">
                        {getTitle(candidate)}
                      </h1>
                      <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
                        {candidate.personality_summary || "소개 메모가 아직 등록되지 않았습니다."}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadgeClass(candidate.status)}`}
                    >
                      {getStatusLabel(candidate.status)}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {metaChips.map((chip) => (
                      <span
                        key={chip}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                      >
                        {chip}
                      </span>
                    ))}
                    {candidate.highlight_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <article className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        직장 / 직무
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {candidate.work_summary || "미입력"}
                      </p>
                    </article>
                    <article className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
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

            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600"
                  >
                    상태 변경
                  </button>
                </form>
              </div>

              {counterpartCandidate ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Current Pair
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {counterpartCandidate.full_name} · {getTitle(counterpartCandidate)}
                  </p>
                  <Link
                    href={`/profiles/${counterpartCandidate.id}`}
                    className="mt-3 inline-flex text-sm font-medium text-indigo-600"
                  >
                    상대 상세 보기
                  </Link>
                </div>
              ) : null}

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Private Memo
                </p>
                <p className="mt-2 min-h-28 text-sm leading-7 text-slate-600">
                  {candidate.notes_private || "비공개 메모가 아직 없습니다."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600"
                >
                  대시보드
                </Link>
                <Link
                  href="/candidates/new"
                  className="inline-flex h-10 items-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600"
                >
                  매물 등록
                </Link>
              </div>
            </aside>
          </section>

          {deskMessage ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              {deskMessage}
            </div>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Match Flow
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                  칸반 흐름
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {groupedRecords.map((group) => (
                <article key={group.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-800">{group.label}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {group.records.length}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {group.records.length ? (
                      group.records.map((record) => (
                        <article key={record.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
                        아직 기록이 없습니다.
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                  <article key={item.label} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.value}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Photo Gallery
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                등록된 사진
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {photos.length ? (
                  photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
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
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500">
                    등록된 사진이 없습니다.
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
      </main>
    </>
  );
}
