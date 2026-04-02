import Link from "next/link";
import { notFound } from "next/navigation";
import { BackNavButton } from "@/components/back-nav-button";
import { PersonPreview } from "@/components/person-preview";
import { StatusBadge } from "@/components/status-badge";
import {
  createMatchRecord,
  deleteMatchRecord,
  updateCandidateStatus,
} from "@/lib/admin-actions";
import { getCandidateById, getCandidatePhotos, getMatchRecords } from "@/lib/data";
import { canEditCandidates, getCurrentMembership } from "@/lib/permissions";
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
    candidate.region ? { tone: "warm", value: candidate.region } : null,
    candidate.religion ? { tone: "sage", value: candidate.religion } : null,
    candidate.mbti ? { tone: "default", value: candidate.mbti } : null,
    candidate.work_summary ? { tone: "strong", value: candidate.work_summary } : null,
  ].filter(Boolean) as Array<{
    tone: "default" | "warm" | "sage" | "strong";
    value: string;
  }>;
}

function buildTagMeta(tag: string, index: number) {
  const tones = ["warm", "sage", "strong"] as const;
  const labels = ["성향", "조건", "포인트"] as const;

  return {
    tone: tones[index % tones.length],
    label: labels[index % labels.length],
    value: tag,
  };
}

function groupMatchRecords(records: MatchRecord[]) {
  return MATCH_COLUMNS.map((column) => ({
    ...column,
    records: records.filter((record) => record.outcome === column.outcome),
  }));
}

export default async function CandidateDetailPage({
  params,
  searchParams,
}: CandidateDetailPageProps) {
  const { id } = await params;
  const { message } = await searchParams;
  const candidate = await getCandidateById(id);

  if (!candidate) {
    notFound();
  }

  const [history, photos, membership] = await Promise.all([
    getMatchRecords(candidate.id),
    getCandidatePhotos(candidate.id),
    getCurrentMembership(),
  ]);
  const counterpartCandidate = candidate.paired_candidate_id
    ? await getCandidateById(candidate.paired_candidate_id)
    : null;
  const canOperate = membership?.role ? canEditCandidates(membership.role) : false;
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
    <main className="pageFrame workspacePage">
      <div className="landingWrap">
        <div className="pageHeader">
          <div>
            <p className="eyebrow">Candidate Detail</p>
            <h1 className="pageTitle">매물 상세</h1>
            <p className="pageMeta">
              프로필 열람을 넘어 수정, 상태 판단, 매칭 기록 관리까지 한 화면에서 이어지는 운영 데스크입니다.
            </p>
          </div>
          <div className="heroActions">
            {canOperate ? (
              <>
                <Link className="primaryButton" href={`/profiles/${candidate.id}/edit`}>
                  프로필 수정
                </Link>
                <a className="ghostButton" href="#match-desk">
                  매칭 기록 추가
                </a>
              </>
            ) : null}
            <BackNavButton />
            <Link className="ghostButton" href="/dashboard">
              대시보드
            </Link>
            <Link className="ghostButton" href="/">
              홈으로
            </Link>
          </div>
        </div>

        <section className="detailHero">
          <article className="detailPanel portraitPanel">
            <PersonPreview
              imageUrl={candidate.image_url}
              gender={candidate.gender}
              className="portraitPreview"
              size="lg"
            />
            <div className="portraitLabel">
              {signalChips.length ? (
                <div className="signalChipRow">
                  {signalChips.map((chip) => (
                    <span key={chip.value} className={`signalChip ${chip.tone}`}>
                      {chip.value}
                    </span>
                  ))}
                </div>
              ) : null}
              <h1 className="detailTitle">{candidate.full_name}</h1>
              <p className="heroSubtitle">
                {candidate.personality_summary || "소개 메모가 아직 등록되지 않았습니다."}
              </p>
              <div className="detailInfoCardGrid">
                {infoCards.length ? (
                  infoCards.map((item) => (
                    <article key={item.label} className="infoPill">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </article>
                  ))
                ) : (
                  <article className="infoPill">
                    <span>기본 정보</span>
                    <strong>아직 추가되지 않았습니다</strong>
                  </article>
                )}
              </div>
            </div>
          </article>

          <article className="detailPanel">
            <p className="eyebrow">Operator Desk</p>
            <div className="operatorCard">
              <div className="cardTop">
                <div>
                  <h3>현재 운영 상태</h3>
                  <p className="subtle">
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
                <div className="detailActionStack">
                  <Link className="primaryButton" href={`/profiles/${candidate.id}/edit`}>
                    프로필 수정
                  </Link>
                  <a className="ghostButton" href="#match-desk">
                    매칭 기록 추가
                  </a>
                  <form action={updateCandidateStatus} className="inlineActionForm">
                    <input type="hidden" name="candidateId" value={candidate.id} />
                    <select name="status" defaultValue={candidate.status}>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button className="secondaryButton" type="submit">
                      상태 변경
                    </button>
                  </form>
                </div>
              ) : null}

              {counterpartCandidate ? (
                <div className="pairedCandidateCard">
                  <div className="pairedCandidateHeader">
                    <div>
                      <p className="eyebrow">
                        {candidate.status === "couple" ? "Current Couple" : "Current Match"}
                      </p>
                      <h3>현재 연결 상대</h3>
                    </div>
                    <StatusBadge tone={candidate.status === "couple" ? "success" : "warning"}>
                      {candidate.status === "couple" ? "커플완성" : "매칭진행중"}
                    </StatusBadge>
                  </div>

                  <div className="pairedCandidateBody">
                    <div className="pairedCandidatePreview">
                      <PersonPreview
                        imageUrl={counterpartCandidate.image_url}
                        gender={counterpartCandidate.gender}
                        size="sm"
                      />
                    </div>
                    <div className="pairedCandidateCopy">
                      <strong>{counterpartCandidate.full_name}</strong>
                      <span>
                        {[
                          `${counterpartCandidate.birth_year}년생`,
                          counterpartCandidate.gender,
                          counterpartCandidate.occupation,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      <p>
                        {counterpartCandidate.personality_summary ||
                          "상대 후보 소개 메모가 아직 등록되지 않았습니다."}
                      </p>
                      <div className="pairedCandidateActions">
                        <Link
                          className="ghostButton"
                          href={`/profiles/${counterpartCandidate.id}`}
                        >
                          상대 상세 보기
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="sectionBlock">
                <p className="eyebrow">Ideal Type</p>
                <p>{candidate.ideal_type || "아직 입력되지 않았습니다."}</p>
              </div>

              <div className="sectionBlock">
                <p className="eyebrow">Private Notes</p>
                <p>{candidate.notes_private || "비공개 메모가 아직 없습니다."}</p>
              </div>

              {candidate.highlight_tags.length ? (
                <div className="tagRow premiumTagRow">
                  {candidate.highlight_tags.map((tag, index) => {
                    const meta = buildTagMeta(tag, index);

                    return (
                      <span key={tag} className={`tag tone-${meta.tone}`}>
                        <em>{meta.label}</em>
                        <strong>{meta.value}</strong>
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </article>
        </section>

        {matchDeskMessage ? <div className="notice">{matchDeskMessage}</div> : null}

        {canOperate ? (
          <section id="match-desk" className="sectionBlock">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Match Desk</p>
                <h2 className="pageTitle">매칭 기록 추가</h2>
                <p className="pageMeta">
                  소개가 어떻게 흘렀는지 기록을 남기고, 필요하면 후보 상태도 함께 바꿉니다.
                </p>
              </div>
            </div>

            <article className="detailPanel matchComposer">
              <form action={createMatchRecord} className="authForm">
                <input type="hidden" name="candidateId" value={candidate.id} />
                <div className="detailColumns compact">
                  <label>
                    상대 이름 / 라벨
                    <input
                      name="counterpartLabel"
                      placeholder="1991년생 판교 개발자"
                      required
                    />
                  </label>
                  <label>
                    진행 단계
                    <select name="outcome" defaultValue="intro_sent">
                      {MATCH_COLUMNS.map((column) => (
                        <option key={column.outcome} value={column.outcome}>
                          {column.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    날짜
                    <input
                      name="happenedOn"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </label>
                  <label>
                    상태도 함께 변경
                    <select name="nextStatus" defaultValue="keep">
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
                  요약 메모
                  <textarea
                    name="summary"
                    rows={4}
                    placeholder="첫 반응, 대화 흐름, 다음 액션 등을 짧게 남겨주세요."
                    required
                  />
                </label>
                <div className="heroActions">
                  <button className="primaryButton" type="submit">
                    매칭 기록 저장
                  </button>
                </div>
              </form>
            </article>
          </section>
        ) : null}

        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Match Board</p>
              <h2 className="pageTitle">칸반으로 보는 매칭 흐름</h2>
              <p className="pageMeta">
                소개 전달부터 커플까지, 현재 이 후보의 연결 상황을 단계별로 읽을 수 있습니다.
              </p>
            </div>
          </div>

          <div className="matchBoard">
            {groupedHistory.map((column) => (
              <article key={column.outcome} className="matchColumn">
                <div className="matchColumnHeader">
                  <div>
                    <h3>{column.label}</h3>
                    <p>{column.description}</p>
                  </div>
                  <StatusBadge
                    tone={
                      column.outcome === "couple"
                        ? "success"
                        : column.outcome === "first_meeting" ||
                            column.outcome === "dating"
                          ? "warning"
                          : "default"
                    }
                  >
                    {column.records.length}건
                  </StatusBadge>
                </div>

                <div className="matchColumnList">
                  {column.records.length ? (
                    column.records.map((record) => (
                      <article key={record.id} className="matchBoardCard">
                        <div className="cardTop">
                          <div>
                            <h4>{record.counterpart_label}</h4>
                            <p>{MATCH_OUTCOME_LABEL[record.outcome]}</p>
                          </div>
                          {canOperate ? (
                            <form action={deleteMatchRecord}>
                              <input
                                type="hidden"
                                name="candidateId"
                                value={candidate.id}
                              />
                              <input type="hidden" name="recordId" value={record.id} />
                              <button className="ghostButton compact" type="submit">
                                삭제
                              </button>
                            </form>
                          ) : null}
                        </div>
                        <p>{record.summary}</p>
                        <div className="historyMeta">
                          <span>{record.matchmaker_name}</span>
                          <span>{record.happened_on}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="emptyState matchEmptyState">
                      아직 이 단계의 기록이 없습니다.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="detailColumns">
          <article className="detailPanel">
            <p className="eyebrow">Profile Read</p>
            <h3>기본 조건과 인상</h3>
            <div className="timelineList">
              <div className="timelineItem">
                <h4>직장 / 직무</h4>
                <p>{candidate.work_summary || "미입력"}</p>
              </div>
              <div className="timelineItem">
                <h4>학력</h4>
                <p>{candidate.education || "미입력"}</p>
              </div>
              <div className="timelineItem">
                <h4>MBTI</h4>
                <p>{candidate.mbti ?? "미기재"}</p>
              </div>
              <div className="timelineItem">
                <h4>요약 인상</h4>
                <p>{candidate.personality_summary || "미입력"}</p>
              </div>
            </div>
          </article>

          <article className="detailPanel">
            <p className="eyebrow">Photo Gallery</p>
            <h3>등록된 사진</h3>
            <div className="photoGallery">
              {photos.length ? (
                photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="galleryPhoto"
                    style={{ backgroundImage: `url(${photo.image_url})` }}
                  />
                ))
              ) : (
                <div className="emptyState">등록된 사진이 없습니다.</div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
