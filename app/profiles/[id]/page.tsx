import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackNavButton } from "@/components/back-nav-button";
import { PersonPreview } from "@/components/person-preview";
import { StatusBadge } from "@/components/status-badge";
import { WorkspaceDecorations } from "@/components/workspace-decorations";
import {
  createMatchRecord,
  deleteMatchRecord,
  updateCandidateStatus,
} from "@/lib/admin-actions";
import { getCandidateById, getCandidatePhotos, getMatchRecords } from "@/lib/data";
import { canEditCandidates, requireMembershipRole } from "@/lib/permissions";
import type { MatchOutcome, MatchRecord } from "@/lib/types";

type CandidateDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

const MATCH_COLUMNS: Array<{
  outcome: MatchOutcome;
  label: string;
  description: string;
}> = [
  {
    outcome: "intro_sent",
    label: "소개 전달",
    description: "소개 의사와 첫 반응을 확인하는 단계",
  },
  {
    outcome: "first_meeting",
    label: "첫 만남",
    description: "실제 만남과 첫 인상 확인",
  },
  {
    outcome: "dating",
    label: "탐색 중",
    description: "후속 만남이 이어지는 단계",
  },
  {
    outcome: "couple",
    label: "커플",
    description: "관계가 안정적으로 이어진 상태",
  },
  {
    outcome: "closed",
    label: "종료",
    description: "소개를 마무리하고 회고를 남김",
  },
];

const MATCH_OUTCOME_LABEL: Record<MatchOutcome, string> = {
  intro_sent: "소개 전달",
  first_meeting: "첫 만남",
  dating: "탐색 중",
  couple: "커플",
  closed: "종료",
};

const STATUS_OPTIONS = [
  "active",
  "matched",
  "couple",
  "graduated",
  "archived",
] as const;

const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5";
const ghostButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5";
const panelClass =
  "rounded-[30px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_20px_50px_rgba(143,95,89,0.08)] backdrop-blur-sm sm:p-6";

function buildInfoCards(candidate: Awaited<ReturnType<typeof getCandidateById>>) {
  if (!candidate) {
    return [];
  }

  return [
    { label: "출생", value: `${candidate.birth_year}년생` },
    candidate.gender ? { label: "성별", value: candidate.gender } : null,
    candidate.occupation ? { label: "직업", value: candidate.occupation } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
}

function buildSignalChips(candidate: Awaited<ReturnType<typeof getCandidateById>>) {
  if (!candidate) {
    return [];
  }

  return [
    candidate.region ? candidate.region : null,
    candidate.religion ? candidate.religion : null,
    candidate.mbti ? candidate.mbti : null,
    candidate.work_summary ? candidate.work_summary : null,
  ].filter(Boolean) as string[];
}

function buildTagMeta(tag: string, index: number) {
  const tones = [
    "border-[#f0d8dd] bg-[#fff7f8] text-[#8f5f59]",
    "border-[#dfe8d8] bg-[#f7fbf3] text-[#5c7355]",
    "border-[#ecdcc8] bg-[#fff8ef] text-[#7b6049]",
  ];
  const labels = ["성향", "조건", "포인트"] as const;

  return {
    tone: tones[index % tones.length],
    label: labels[index % labels.length],
    value: tag,
  };
}

function isRenderableImageUrl(value: string | null | undefined) {
  return Boolean(
    value &&
      (value.startsWith("/") ||
        value.startsWith("http://") ||
        value.startsWith("https://")),
  );
}

function groupMatchRecords(records: MatchRecord[]) {
  return MATCH_COLUMNS.map((column) => ({
    ...column,
    records: records.filter((record) => record.outcome === column.outcome),
  }));
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-sm font-semibold text-[#7b626a]">{children}</span>
  );
}

export default async function CandidateDetailPage({
  params,
  searchParams,
}: CandidateDetailPageProps) {
  const { id } = await params;
  const { message } = await searchParams;
  const [candidate, history, photos, membership] = await Promise.all([
    getCandidateById(id),
    getMatchRecords(id),
    getCandidatePhotos(id),
    requireMembershipRole(["admin", "super_admin"]),
  ]);

  if (!candidate) {
    notFound();
  }
  const heroImageUrl = isRenderableImageUrl(candidate.image_url)
    ? candidate.image_url
    : photos[0]?.image_url ?? null;
  const counterpartCandidate = candidate.paired_candidate_id
    ? await getCandidateById(candidate.paired_candidate_id)
    : null;
  const canOperate = canEditCandidates(membership.role);
  const infoCards = buildInfoCards(candidate);
  const signalChips = buildSignalChips(candidate);
  const groupedHistory = groupMatchRecords(history);
  const matchDeskMessage =
    message === "updated"
      ? "프로필 수정이 반영되었습니다."
      : message === "match-created"
        ? "새 매칭 기록이 추가되었습니다."
        : message === "match-deleted"
          ? "매칭 기록이 정리되었습니다."
          : message === "status-updated"
            ? "후보 상태가 업데이트되었습니다."
            : message === "match-invalid"
              ? "매칭 기록 입력값을 다시 확인해주세요."
              : message;

  return (
    <main className="workspacePage min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fff8f2_0%,#fff3ec_42%,#fffaf6_100%)] text-[#24161c]">
      <div className="landingWrap relative mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <WorkspaceDecorations />
        <header className="flex flex-col gap-4 rounded-[30px] border border-[#ead8cf] bg-white/85 p-5 shadow-[0_14px_40px_rgba(143,95,89,0.08)] backdrop-blur-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
              Candidate Detail
            </p>
            <h1 className="mt-3 text-[clamp(2.4rem,10vw,4.9rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-[#24161c]">
              매물 상세
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-[#6d5961] sm:text-base">
              프로필 열람을 넘어 수정, 상태 판단, 매칭 기록 관리까지 한 화면에서 이어지는 운영 데스크입니다.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
            {canOperate ? (
              <>
                <Link className={primaryButtonClass} href={`/profiles/${candidate.id}/edit`}>
                  프로필 수정
                </Link>
                <a className={ghostButtonClass} href="#match-desk">
                  매칭 기록 추가
                </a>
              </>
            ) : null}
            <BackNavButton />
            <Link className={ghostButtonClass} href="/dashboard">
              대시보드
            </Link>
            <Link className={ghostButtonClass} href="/">
              홈으로
            </Link>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_380px]">
          <article className="detailPanel overflow-hidden rounded-[34px] border border-[#ead8cf] bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,244,239,0.96))] p-4 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.92fr)] lg:items-stretch">
              <div className="portraitPanel relative overflow-hidden rounded-[28px] bg-[#fff7f2] p-3">
                <PersonPreview
                  imageUrl={heroImageUrl}
                  gender={candidate.gender}
                  className="portraitPreview min-h-[320px] rounded-[24px] sm:min-h-[420px] lg:min-h-[520px]"
                  fetchPriority="high"
                  loading="eager"
                  size="lg"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[24px] bg-gradient-to-t from-[rgba(33,19,26,0.78)] via-[rgba(33,19,26,0.24)] to-transparent p-5 text-white sm:p-6">
                  {signalChips.length ? (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {signalChips.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex min-h-9 items-center rounded-full border border-white/20 bg-white/16 px-4 text-xs font-semibold backdrop-blur-sm sm:text-sm"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <h2 className="text-[clamp(2rem,9vw,4rem)] font-semibold leading-none tracking-[-0.08em]">
                    {candidate.full_name}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/88 sm:text-base">
                    {candidate.personality_summary || "소개 메모가 아직 등록되지 않았습니다."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {infoCards.length ? (
                      infoCards.map((item) => (
                        <article
                          key={item.label}
                          className="rounded-full border border-white/18 bg-white/14 px-4 py-3 backdrop-blur-sm"
                        >
                          <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                            {item.label}
                          </span>
                          <strong className="mt-1 block text-sm font-semibold text-white">
                            {item.value}
                          </strong>
                        </article>
                      ))
                    ) : (
                      <article className="rounded-full border border-white/18 bg-white/14 px-4 py-3 backdrop-blur-sm">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                          기본 정보
                        </span>
                        <strong className="mt-1 block text-sm font-semibold text-white">
                          아직 추가되지 않았습니다
                        </strong>
                      </article>
                    )}
                  </div>
                </div>
              </div>

              <div className={`detailPanel ${panelClass} h-full`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b46d59]">
                      Operator Desk
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#24161c]">
                      현재 운영 상태
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#6d5961]">
                      소개 판단에 필요한 메모와 다음 액션을 한곳에 모았습니다.
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      candidate.status === "couple" || candidate.status === "graduated"
                        ? "success"
                        : candidate.status === "matched"
                          ? "warning"
                          : "default"
                    }
                  >
                    {candidate.status}
                  </StatusBadge>
                </div>

                {canOperate ? (
                  <div className="mt-5 flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link className={primaryButtonClass} href={`/profiles/${candidate.id}/edit`}>
                        프로필 수정
                      </Link>
                      <a className={ghostButtonClass} href="#match-desk">
                        매칭 기록 추가
                      </a>
                    </div>
                    <form action={updateCandidateStatus} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <input type="hidden" name="candidateId" value={candidate.id} />
                      <select
                        name="status"
                        defaultValue={candidate.status}
                        className="min-h-12 rounded-[18px] border border-[#ead8cf] bg-white px-4 text-sm font-medium text-[#2d1e24] outline-none ring-0"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <button className={ghostButtonClass} type="submit">
                        상태 변경
                      </button>
                    </form>
                  </div>
                ) : null}

                {counterpartCandidate ? (
                  <div className="mt-6 rounded-[26px] border border-[#ead8cf] bg-gradient-to-br from-[#fffaf7] via-white to-[#fff4ee] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b46d59]">
                          {candidate.status === "couple" ? "Current Couple" : "Current Match"}
                        </p>
                        <h4 className="mt-2 text-xl font-semibold tracking-[-0.05em] text-[#24161c]">
                          현재 연결 상대
                        </h4>
                      </div>
                      <StatusBadge tone={candidate.status === "couple" ? "success" : "warning"}>
                        {candidate.status === "couple" ? "커플완성" : "매칭진행중"}
                      </StatusBadge>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                      <div className="w-full max-w-[180px] overflow-hidden rounded-[24px] bg-[#fff5ef] p-2">
                        <PersonPreview
                          imageUrl={counterpartCandidate.image_url}
                          gender={counterpartCandidate.gender}
                          size="sm"
                          className="min-h-[180px] rounded-[20px]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-2xl font-semibold tracking-[-0.05em] text-[#24161c]">
                          {counterpartCandidate.full_name}
                        </strong>
                        <span className="mt-2 block text-sm leading-7 text-[#6d5961]">
                          {[
                            `${counterpartCandidate.birth_year}년생`,
                            counterpartCandidate.gender,
                            counterpartCandidate.occupation,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <p className="mt-3 text-sm leading-7 text-[#6d5961]">
                          {counterpartCandidate.personality_summary ||
                            "상대 후보 소개 메모가 아직 등록되지 않았습니다."}
                        </p>
                        <div className="mt-4">
                          <Link
                            className={ghostButtonClass}
                            href={`/profiles/${counterpartCandidate.id}`}
                          >
                            상대 상세 보기
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 grid gap-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b46d59]">
                      Ideal Type
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#6d5961]">
                      {candidate.ideal_type || "아직 입력되지 않았습니다."}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b46d59]">
                      Private Notes
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#6d5961]">
                      {candidate.notes_private || "비공개 메모가 아직 없습니다."}
                    </p>
                  </div>
                  {candidate.highlight_tags.length ? (
                    <div className="flex flex-wrap gap-2">
                      {candidate.highlight_tags.map((tag, index) => {
                        const meta = buildTagMeta(tag, index);

                        return (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${meta.tone}`}
                          >
                            <em className="not-italic opacity-70">{meta.label}</em>
                            <strong>{meta.value}</strong>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        </section>

        {matchDeskMessage ? (
          <div className="rounded-[24px] border border-[#ead8cf] bg-white/88 px-5 py-4 text-sm font-medium text-[#6d5961] shadow-[0_10px_24px_rgba(143,95,89,0.08)]">
            {matchDeskMessage}
          </div>
        ) : null}

        {canOperate ? (
          <section id="match-desk" className={`sectionBlock detailPanel ${panelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
              Match Desk
            </p>
            <h2 className="mt-3 text-[clamp(2rem,7vw,3rem)] font-semibold tracking-[-0.07em] text-[#24161c]">
              매칭 기록 추가
            </h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#6d5961] sm:text-base">
              소개가 어떻게 흘렀는지 기록을 남기고, 필요하면 후보 상태도 함께 바꿉니다.
            </p>

            <form action={createMatchRecord} className="mt-6 grid gap-5">
              <input type="hidden" name="candidateId" value={candidate.id} />
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                <label>
                  <FieldLabel>상대 이름 / 라벨</FieldLabel>
                  <input
                    name="counterpartLabel"
                    placeholder="1991년생 판교 개발자"
                    required
                    className="min-h-12 w-full rounded-[18px] border border-[#ead8cf] bg-white px-4 text-sm font-medium text-[#2d1e24] outline-none ring-0"
                  />
                </label>
                <label>
                  <FieldLabel>진행 단계</FieldLabel>
                  <select
                    name="outcome"
                    defaultValue="intro_sent"
                    className="min-h-12 w-full rounded-[18px] border border-[#ead8cf] bg-white px-4 text-sm font-medium text-[#2d1e24] outline-none ring-0"
                  >
                    {MATCH_COLUMNS.map((column) => (
                      <option key={column.outcome} value={column.outcome}>
                        {column.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <FieldLabel>날짜</FieldLabel>
                  <input
                    name="happenedOn"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                    className="min-h-12 w-full rounded-[18px] border border-[#ead8cf] bg-white px-4 text-sm font-medium text-[#2d1e24] outline-none ring-0"
                  />
                </label>
                <label>
                  <FieldLabel>상태도 함께 변경</FieldLabel>
                  <select
                    name="nextStatus"
                    defaultValue="keep"
                    className="min-h-12 w-full rounded-[18px] border border-[#ead8cf] bg-white px-4 text-sm font-medium text-[#2d1e24] outline-none ring-0"
                  >
                    <option value="keep">현재 상태 유지</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <FieldLabel>요약 메모</FieldLabel>
                <textarea
                  name="summary"
                  rows={4}
                  placeholder="첫 반응, 대화 흐름, 다음 액션 등을 짧게 남겨주세요."
                  required
                  className="min-h-[132px] w-full rounded-[22px] border border-[#ead8cf] bg-white px-4 py-4 text-sm leading-7 text-[#2d1e24] outline-none ring-0"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button className={primaryButtonClass} type="submit">
                  매칭 기록 저장
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className={`sectionBlock detailPanel ${panelClass}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
            Match Board
          </p>
          <h2 className="mt-3 text-[clamp(2rem,7vw,3rem)] font-semibold tracking-[-0.07em] text-[#24161c]">
            칸반으로 보는 매칭 흐름
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#6d5961] sm:text-base">
            소개 전달부터 커플까지, 현재 이 후보의 연결 상황을 단계별로 읽을 수 있습니다.
          </p>

          <div className="mt-6 grid gap-4 xl:grid-cols-5">
            {groupedHistory.map((column) => (
              <article
                key={column.outcome}
                className="rounded-[26px] border border-[#ead8cf] bg-gradient-to-b from-white to-[#fff8f3] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-[-0.04em] text-[#24161c]">
                      {column.label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6d5961]">
                      {column.description}
                    </p>
                  </div>
                  <StatusBadge
                    tone={
                      column.outcome === "couple"
                        ? "success"
                        : column.outcome === "first_meeting" || column.outcome === "dating"
                          ? "warning"
                          : "default"
                    }
                  >
                    {column.records.length}건
                  </StatusBadge>
                </div>

                <div className="mt-4 grid gap-3">
                  {column.records.length ? (
                    column.records.map((record) => (
                      <article
                        key={record.id}
                        className="rounded-[22px] border border-[#efdccf] bg-white/92 p-4 shadow-[0_10px_22px_rgba(143,95,89,0.06)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-semibold text-[#24161c]">
                              {record.counterpart_label}
                            </h4>
                            <p className="mt-1 text-sm text-[#8b6a63]">
                              {MATCH_OUTCOME_LABEL[record.outcome]}
                            </p>
                          </div>
                          {canOperate ? (
                            <form action={deleteMatchRecord}>
                              <input type="hidden" name="candidateId" value={candidate.id} />
                              <input type="hidden" name="recordId" value={record.id} />
                              <button
                                className="inline-flex min-h-9 items-center rounded-full border border-[#ead8cf] bg-white px-3 text-xs font-semibold text-[#5e4850]"
                                type="submit"
                              >
                                삭제
                              </button>
                            </form>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[#6d5961]">{record.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-[#8b6a63]">
                          <span>{record.matchmaker_name}</span>
                          <span>{record.happened_on}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[#e6d5ca] bg-[#fffaf6] px-4 py-8 text-center text-sm leading-7 text-[#8b6a63]">
                      아직 이 단계의 기록이 없습니다.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className={`detailPanel ${panelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
              Profile Read
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#24161c]">
              기본 조건과 인상
            </h3>
            <div className="mt-6 grid gap-3">
              {[
                { label: "직장 / 직무", value: candidate.work_summary || "미입력" },
                { label: "학력", value: candidate.education || "미입력" },
                { label: "MBTI", value: candidate.mbti ?? "미기재" },
                { label: "요약 인상", value: candidate.personality_summary || "미입력" },
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-[22px] border border-[#efdccf] bg-[#fffaf6] p-4"
                >
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b46d59]">
                    {item.label}
                  </h4>
                  <p className="mt-2 text-sm leading-7 text-[#6d5961]">{item.value}</p>
                </article>
              ))}
            </div>
          </article>

          <article className={`detailPanel ${panelClass}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
              Photo Gallery
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#24161c]">
              등록된 사진
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {photos.length ? (
                photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-[4/5] rounded-[24px] border border-[#ead8cf] bg-[#fff5ef] bg-cover bg-center shadow-[0_12px_28px_rgba(143,95,89,0.08)]"
                    style={{ backgroundImage: `url(${photo.image_url})` }}
                  />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[#e6d5ca] bg-[#fffaf6] px-4 py-10 text-center text-sm leading-7 text-[#8b6a63]">
                  등록된 사진이 없습니다.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
