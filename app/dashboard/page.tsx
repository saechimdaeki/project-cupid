import Link from "next/link";
import { CandidateCard } from "@/components/candidate-card";
import { StatusBadge } from "@/components/status-badge";
import { getCandidates, getCurrentMembershipWithFallback, getMatchRecords } from "@/lib/data";
import { canEditCandidates, roleLabel } from "@/lib/permissions";

type DashboardPageProps = {
  searchParams: Promise<{ filter?: string; message?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { filter, message } = await searchParams;
  const membership = await getCurrentMembershipWithFallback();
  const [allCandidates, recentMatches] = await Promise.all([
    getCandidates(),
    getMatchRecords(),
  ]);
  const visibleCandidates = filter
    ? allCandidates.filter((candidate) => candidate.status === filter)
    : allCandidates;

  if (!membership) {
    return null;
  }

  return (
    <main className="pageFrame">
      <div className="landingWrap">
        <div className="topbar">
          <div className="brandLockup">
            <div className="brandMark">C</div>
            <div className="brandText">
              <strong>Project Cupid</strong>
              <span>{membership.full_name} · {roleLabel(membership.role)}</span>
            </div>
          </div>
          <div className="headerActions">
            {canEditCandidates(membership.role) ? (
              <Link className="primaryButton" href="/candidates/new">
                매물 등록
              </Link>
            ) : null}
            <StatusBadge>총 {allCandidates.length}건</StatusBadge>
            <StatusBadge tone="warning">진행중 {allCandidates.filter((item) => item.status === "matched").length}</StatusBadge>
            <StatusBadge tone="success">커플/졸업 {allCandidates.filter((item) => item.status === "couple" || item.status === "graduated").length}</StatusBadge>
          </div>
        </div>

        <section className="dashboardHero">
          <div className="dashboardHeroCopy">
            <p className="eyebrow">Couple Making Desk</p>
            <h1 className="pageTitle">
              {membership.role === "viewer"
                ? "지금 보드에 올라온 사람들을 먼저 훑고, 소개 후보를 좁혀갑니다"
                : "오늘은 누구를 누구와 연결할지, 감정의 흐름까지 보면서 판단합니다"}
            </h1>
            <p className="pageMeta">
              {membership.role === "viewer"
                ? "뷰어는 목록과 상태만 확인합니다. 상세 프로필, 사진, 매칭 이력은 어드민 이상 권한에서만 엽니다."
                : "좋은 대시보드는 숫자만 보여주지 않습니다. 지금 소개를 넣어야 할 사람, 이미 온도가 올라간 사람, 커플로 넘어간 사람을 서로 다른 결로 읽히게 만들어야 합니다."}
            </p>
            {message === "viewer-role" ? (
              <div className="notice">뷰어 권한은 상세 페이지에 들어갈 수 없습니다.</div>
            ) : message === "editor-role" ? (
              <div className="notice">viewer 권한은 매물 등록 페이지에 들어갈 수 없습니다.</div>
            ) : null}
          </div>
          <div className="dashboardHeartline">
            <div className="heartNode left" />
            <div className="heartArc" />
            <div className="heartNode right" />
          </div>
        </section>

        <section className="metricStrip">
          <article className="metricCard">
            <p className="eyebrow">Active Board</p>
            <strong>{allCandidates.filter((item) => item.status === "active").length}</strong>
            <span>지금 바로 연결 가능한 매물</span>
          </article>
          <article className="metricCard">
            <p className="eyebrow">In Progress</p>
            <strong>{allCandidates.filter((item) => item.status === "matched").length}</strong>
            <span>소개 이후 후속 만남 진행 중</span>
          </article>
          <article className="metricCard">
            <p className="eyebrow">Couple</p>
            <strong>{allCandidates.filter((item) => item.status === "couple").length}</strong>
            <span>커플 성사 상태</span>
          </article>
          <article className="metricCard">
            <p className="eyebrow">Timeline</p>
            <strong>{recentMatches.length}</strong>
            <span>누적 매칭 이력</span>
          </article>
        </section>

        <section className="dashboardLayout">
          <div>
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Curated Inventory</p>
                <h2 className="pageTitle">지금 연결 가능한 사람들</h2>
                <p className="pageMeta">카드 하나하나가 소개 판단의 단서가 되도록, 조건과 인상이 함께 보이게 구성합니다.</p>
              </div>
            </div>

            {visibleCandidates.length ? (
              <div className="candidateGrid">
                {visibleCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} role={membership.role} />
                ))}
              </div>
            ) : (
              <div className="emptyState dashboardEmptyState">
                <strong>아직 등록된 매물이 없습니다.</strong>
                <span>첫 매물을 등록하면 여기서 바로 리스트와 상태를 관리할 수 있습니다.</span>
                {canEditCandidates(membership.role) ? (
                  <div className="heroActions">
                    <Link className="primaryButton" href="/candidates/new">
                      첫 매물 등록하기
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <aside className="glassCard">
            <p className="eyebrow">Recent Outcomes</p>
            <h3>최근 매칭 타임라인</h3>
            <div className="timelineList">
              {recentMatches.map((record) => (
                <article key={record.id} className="timelineItem">
                  <div className="cardTop">
                    <h4>{record.counterpart_label}</h4>
                    <StatusBadge tone={record.outcome === "couple" ? "success" : "warning"}>
                      {record.outcome}
                    </StatusBadge>
                  </div>
                  <p>{record.summary}</p>
                  <div className="historyMeta">
                    <span>{record.matchmaker_name}</span>
                    <span>{record.happened_on}</span>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
