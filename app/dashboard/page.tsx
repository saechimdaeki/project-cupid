import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { CandidateCard } from "@/components/candidate-card";
import { DashboardFlowBoard } from "@/components/dashboard-flow-board";
import { StatusBadge } from "@/components/status-badge";
import { getCandidates, getCurrentMembershipWithFallback, getMatchRecords } from "@/lib/data";
import { canEditCandidates, roleLabel } from "@/lib/permissions";

type DashboardPageProps = {
  searchParams: Promise<{
    filter?: string;
    religion?: string;
    gender?: string;
    q?: string;
    message?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { filter, religion, gender, q, message } = await searchParams;
  const membership = await getCurrentMembershipWithFallback();
  const [allCandidates, recentMatches] = await Promise.all([
    getCandidates(),
    getMatchRecords(),
  ]);
  const query = (q ?? "").trim().toLowerCase();
  const religionOptions = Array.from(
    new Set(
      allCandidates
        .map((candidate) => candidate.religion)
        .filter(Boolean),
    ),
  ).sort();
  const genderOptions = Array.from(
    new Set(
      allCandidates
        .map((candidate) => candidate.gender)
        .filter(Boolean),
    ),
  ).sort();
  const visibleCandidates = allCandidates.filter((candidate) => {
    if (filter && candidate.status !== filter) {
      return false;
    }

    if (religion && candidate.religion !== religion) {
      return false;
    }

    if (gender && candidate.gender !== gender) {
      return false;
    }

    if (query) {
      const haystack = [
        candidate.full_name,
        candidate.region,
        candidate.occupation,
        candidate.work_summary,
        candidate.religion,
        candidate.personality_summary,
        ...candidate.highlight_tags,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
  if (!membership) {
    return null;
  }

  return (
    <main className="pageFrame workspacePage">
      <div className="landingWrap">
        <div className="topbar">
          <Link href="/" className="brandLockup">
            <div className="brandMark">C</div>
            <div className="brandText">
              <strong>Project Cupid</strong>
              <span>{membership.full_name} · {roleLabel(membership.role)}</span>
            </div>
          </Link>
          <div className="topbarCluster">
            <div className="headerActions topbarButtons">
              <Link className="ghostButton" href="/">
                홈으로
              </Link>
              {canEditCandidates(membership.role) ? (
                <Link className="primaryButton" href="/candidates/new">
                  매물 등록
                </Link>
              ) : null}
            </div>
            <AccountPanel membership={membership} />
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

        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Filter Desk</p>
              <h2 className="pageTitle">필터로 후보를 바로 좁혀봅니다</h2>
              <p className="pageMeta">
                이름, 직업, 지역 검색과 상태/성별/종교 조건을 함께 써서 지금 필요한 매물을 빠르게 찾을 수 있습니다.
              </p>
            </div>
          </div>

          <form className="filterToolbar" method="get">
            <label className="filterField search">
              <span>검색</span>
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="이름, 직업, 지역, 태그 검색"
              />
            </label>
            <label className="filterField">
              <span>상태</span>
              <select name="filter" defaultValue={filter ?? ""}>
                <option value="">전체</option>
                <option value="active">active</option>
                <option value="matched">matched</option>
                <option value="couple">couple</option>
                <option value="graduated">graduated</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <label className="filterField">
              <span>성별</span>
              <select name="gender" defaultValue={gender ?? ""}>
                <option value="">전체</option>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="filterField">
              <span>종교</span>
              <select name="religion" defaultValue={religion ?? ""}>
                <option value="">전체</option>
                {religionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <div className="filterActions">
              <button className="primaryButton" type="submit">
                필터 적용
              </button>
              {filter || religion || gender || q ? (
                <Link className="ghostButton" href="/dashboard">
                  초기화
                </Link>
              ) : null}
            </div>
          </form>

          {filter || religion || gender || q ? (
            <div className="activeFilterRow">
              {q ? <span className="activeFilterChip">검색: {q}</span> : null}
              {filter ? <span className="activeFilterChip">상태: {filter}</span> : null}
              {gender ? <span className="activeFilterChip">성별: {gender}</span> : null}
              {religion ? (
                <span className="activeFilterChip">종교: {religion}</span>
              ) : null}
              <span className="activeFilterCount">
                {visibleCandidates.length}명 표시 중
              </span>
            </div>
          ) : null}
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

        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Flow Board</p>
              <h2 className="pageTitle">지금 관계 흐름이 어떻게 움직이는지 바로 봅니다</h2>
              <p className="pageMeta">
                필터 결과가 그대로 운영 칸반에 반영되어, 지금 손대야 할 후보와 이미 감정선이 붙은 후보를 한눈에 나눠볼 수 있습니다.
              </p>
            </div>
          </div>

          <DashboardFlowBoard
            candidates={visibleCandidates}
            allCandidates={allCandidates}
            role={membership.role}
          />
        </section>

        <section className="dashboardLayout">
          <div>
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Curated Inventory</p>
                <h2 className="pageTitle">전체 후보를 카드로 다시 훑어봅니다</h2>
                <p className="pageMeta">칸반으로 흐름을 본 뒤에는, 카드 리스트에서 세부 인상과 태그를 비교하면서 최종 판단을 정리합니다.</p>
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
