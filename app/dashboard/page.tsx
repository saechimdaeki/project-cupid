import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { CandidateCard } from "@/components/candidate-card";
import {
  DashboardFlowBoard,
  type DashboardBoardCandidate,
} from "@/components/dashboard-flow-board";
import { LandingScene } from "@/components/landing-scene";
import { WorkspaceDecorations } from "@/components/workspace-decorations";
import {
  buildTimelineEvents,
  getDashboardCandidates,
  getDashboardTimelineData,
} from "@/lib/data";
import { dashboardPreviewMatchRecords, homePreviewCandidates, previewSceneCandidates } from "@/lib/preview-scene";
import { canEditCandidates, requireApprovedMembership, roleLabel } from "@/lib/permissions";

type DashboardPageProps = {
  searchParams: Promise<{
    filter?: string;
    religion?: string;
    gender?: string;
    q?: string;
    message?: string;
  }>;
};

const heroHeadlineStyle = {
  fontFamily:
    '"SUIT Variable","Pretendard Variable","Apple SD Gothic Neo","Noto Sans KR",sans-serif',
  fontWeight: 800,
  letterSpacing: "-0.08em",
};

const heroBodyStyle = {
  fontFamily:
    '"Pretendard Variable","SUIT Variable","Apple SD Gothic Neo","Noto Sans KR",sans-serif',
};

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <article className="metricCard rounded-[28px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_14px_36px_rgba(143,95,89,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b46d59]">{label}</p>
      <strong className="mt-3 block text-4xl font-semibold tracking-[-0.06em] text-[#24161c]">{value}</strong>
      <span className="mt-2 block text-sm leading-6 text-[#6d5961]">{description}</span>
    </article>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[#725761]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]"
      >
        <option value="">전체</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [
    { filter, religion, gender, q, message },
    membership,
    fetchedCandidates,
    timelineData,
  ] = await Promise.all([
    searchParams,
    requireApprovedMembership(),
    getDashboardCandidates(),
    getDashboardTimelineData(),
  ]);
  const isPreviewMode = fetchedCandidates.length === 0;
  const allCandidates = isPreviewMode ? homePreviewCandidates : fetchedCandidates;
  const recentMatches = isPreviewMode ? dashboardPreviewMatchRecords : timelineData.records;
  const timelineCount = isPreviewMode
    ? dashboardPreviewMatchRecords.length
    : timelineData.totalCount;
  const timelineEvents = buildTimelineEvents(
    recentMatches,
    new Map(allCandidates.map((candidate) => [candidate.id, candidate])),
  );
  const query = (q ?? "").trim().toLowerCase();

  const religionOptions = Array.from(
    new Set(allCandidates.map((candidate) => candidate.religion).filter(Boolean)),
  ).sort();
  const genderOptions = Array.from(
    new Set(allCandidates.map((candidate) => candidate.gender).filter(Boolean)),
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
  const boardCandidates: DashboardBoardCandidate[] = allCandidates.map((candidate) => ({
    id: candidate.id,
    full_name: candidate.full_name,
    birth_year: candidate.birth_year,
    gender: candidate.gender,
    region: candidate.region,
    occupation: candidate.occupation,
    status: candidate.status,
    paired_candidate_id: candidate.paired_candidate_id,
  }));
  const visibleCandidateIds = new Set(visibleCandidates.map((candidate) => candidate.id));
  const visibleBoardCandidates = boardCandidates.filter((candidate) =>
    visibleCandidateIds.has(candidate.id),
  );
  const boardRole = isPreviewMode ? "viewer" : membership.role;

  const heroBadges =
    membership.role === "viewer"
      ? ["프라이빗 보드", "관계 온도", "매칭 흐름"]
      : ["승인 기반 운영", "소개 우선순위", "후속 관리"];
  const heroHeadline =
    membership.role === "viewer"
      ? "오늘 눈여겨볼 인연을 먼저 고릅니다"
      : "인연은, 가장 좋은 타이밍에 이어집니다";
  const heroBody =
    membership.role === "viewer"
      ? "목록과 상태를 먼저 훑으며 지금 주목해야 할 사람을 좁혀갑니다. 상세 프로필과 사진, 매칭 이력은 어드민 이상 권한에서 이어집니다."
      : "조건을 나열하는 보드가 아니라, 사람의 결과 대화의 흐름을 함께 읽어 가장 자연스러운 소개의 순간을 고르는 화면입니다.";

  return (
    <main className="workspacePage min-h-screen bg-[linear-gradient(180deg,#fff8f2_0%,#fff3ec_42%,#fffaf6_100%)] text-[#24161c]">
      <div className="landingWrap relative mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <WorkspaceDecorations density="soft" className="hidden md:block" />
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
              <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5" href="/">
                홈으로
              </Link>
              {canEditCandidates(membership.role) ? (
                <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5" href="/candidates/new">
                  매물 등록
                </Link>
              ) : null}
            </div>
            <AccountPanel membership={membership} />
          </div>
        </header>

        <section className="dashboardHero relative overflow-hidden rounded-[34px] border border-[#ead8cf] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,239,0.96))] p-4 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:p-6 xl:grid xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] xl:items-stretch">
          <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
            <div className="absolute left-[8%] top-[10%] h-44 w-44 rounded-full bg-pink-200/40 blur-3xl" />
            <div className="absolute right-[12%] top-[12%] h-52 w-52 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="absolute bottom-[8%] left-[28%] h-40 w-40 rounded-full bg-rose-100/40 blur-3xl" />
            <span className="blossomPetal petal1" />
            <span className="blossomPetal petal3" />
            <span className="blossomPetal petal5" />
            <span className="floatingHeart heartOne">♥</span>
            <span className="floatingHeart heartTwo">♥</span>
            <span className="loveSpark one" />
            <span className="loveSpark two" />
            <span className="loveSpark three" />
          </div>

          <div className="relative rounded-[30px] border border-[#ead8cf] bg-[linear-gradient(145deg,rgba(255,255,255,0.78),rgba(255,245,239,0.88))] p-6 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-8">
            <div className="flex flex-wrap gap-2">
              {heroBadges.map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-9 items-center rounded-full border border-[#ead8cf] bg-white/82 px-4 text-xs font-semibold text-[#8a6b74] shadow-[0_8px_20px_rgba(143,95,89,0.06)]"
                >
                  {item}
                </span>
              ))}
            </div>

            <p
              className="mt-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]"
              style={heroBodyStyle}
            >
              인연 큐레이션 데스크
            </p>
            <h1
              className="pageTitle mt-4 max-w-[13ch] text-[clamp(2.15rem,8.5vw,4.55rem)] font-semibold leading-[0.94] text-[#24161c]"
              style={heroHeadlineStyle}
            >
              {heroHeadline}
            </h1>
            <p
              className="pageMeta mt-5 max-w-[56ch] text-[15px] leading-7 text-[#6d5961] sm:text-base"
              style={heroBodyStyle}
            >
              {heroBody}
            </p>

            <div className="mt-6 grid gap-3 xl:hidden">
              <div className="rounded-[24px] border border-[#ecdcc8] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,249,241,0.98))] px-4 py-4 shadow-[0_10px_24px_rgba(143,95,89,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b46d59]">
                  오늘의 무드
                </p>
                <strong className="mt-2 block text-lg font-semibold tracking-[-0.05em] text-[#24161c]">
                  조급하지 않게, 가장 자연스러운 연결부터 봅니다
                </strong>
                <p className="mt-2 text-sm leading-6 text-[#6d5961]">
                  모바일에서는 꼭 필요한 신호만 먼저 보여주고, 상세 판단은 아래 보드에서 이어집니다.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <article className="rounded-[24px] border border-[#f0d8dd] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,247,248,0.96))] p-4 shadow-[0_12px_28px_rgba(143,95,89,0.06)]">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b46d59]"
                  style={heroBodyStyle}
                >
                  먼저 건네볼 인연
                </span>
                <strong
                  className="mt-3 block text-xl font-semibold tracking-[-0.05em] text-[#24161c]"
                  style={heroHeadlineStyle}
                >
                  가장 결 좋은 순서
                </strong>
                <p className="mt-2 text-sm leading-6 text-[#6d5961]" style={heroBodyStyle}>
                  오늘 가장 먼저 소개를 건넬 사람부터 차분히 정합니다.
                </p>
              </article>
              <article className="rounded-[24px] border border-[#ecdcc8] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,249,241,0.96))] p-4 shadow-[0_12px_28px_rgba(143,95,89,0.06)]">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b46d59]"
                  style={heroBodyStyle}
                >
                  천천히 무르익는 흐름
                </span>
                <strong
                  className="mt-3 block text-xl font-semibold tracking-[-0.05em] text-[#24161c]"
                  style={heroHeadlineStyle}
                >
                  {allCandidates.filter((item) => item.status === "matched").length}건 이어지는 중
                </strong>
                <p className="mt-2 text-sm leading-6 text-[#6d5961]" style={heroBodyStyle}>
                  한번 시작된 연결은 자연스럽게 다음 만남으로 이어지게 살핍니다.
                </p>
              </article>
              <article className="rounded-[24px] border border-[#dfe8d8] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,251,243,0.96))] p-4 shadow-[0_12px_28px_rgba(143,95,89,0.06)]">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#b46d59]"
                  style={heroBodyStyle}
                >
                  마침내 이어진 마음
                </span>
                <strong
                  className="mt-3 block text-xl font-semibold tracking-[-0.05em] text-[#24161c]"
                  style={heroHeadlineStyle}
                >
                  {allCandidates.filter((item) => item.status === "couple").length}쌍 성사
                </strong>
                <p className="mt-2 text-sm leading-6 text-[#6d5961]" style={heroBodyStyle}>
                  성사된 인연은 다음 소개의 감각이 되도록 조용히 남겨둡니다.
                </p>
              </article>
            </div>
          </div>

          <div className="relative hidden overflow-hidden rounded-[30px] border border-[#ead8cf] bg-white/66 p-3 shadow-[0_18px_44px_rgba(143,95,89,0.08)] xl:block">
            <LandingScene
              leftCandidate={previewSceneCandidates[0]}
              rightCandidate={previewSceneCandidates[1]}
            />
          </div>
          {message === "viewer-role" ? (
            <div className="mt-5 rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#8a6b74]">
              뷰어 권한은 상세 페이지에 들어갈 수 없습니다.
            </div>
          ) : message === "editor-role" ? (
            <div className="mt-5 rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#8a6b74]">
              viewer 권한은 매물 등록 페이지에 들어갈 수 없습니다.
            </div>
          ) : null}
        </section>

        <section className="rounded-[34px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Filter Desk</p>
              <h2 className="mt-3 text-[clamp(1.8rem,8vw,3rem)] font-semibold tracking-[-0.06em] text-[#24161c]">필터로 후보를 바로 좁혀봅니다</h2>
              <p className="mt-3 text-[15px] leading-7 text-[#6d5961] sm:text-base">
                이름, 직업, 지역 검색과 상태/성별/종교 조건을 함께 써서 지금 필요한 매물을 빠르게 찾을 수 있습니다.
              </p>
            </div>
            <form className="grid gap-3 rounded-[28px] border border-[#ead8cf] bg-[#fffaf7] p-4 lg:grid-cols-[minmax(260px,1.7fr)_repeat(3,minmax(150px,0.8fr))_auto] lg:items-end" method="get">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[#725761]">검색</span>
                <input
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="이름, 직업, 지역, 태그 검색"
                  className="min-h-12 rounded-2xl border border-[#ead8cf] bg-white/95 px-4 text-sm font-semibold text-[#37232b]"
                />
              </label>
              <FilterSelect name="filter" label="상태" defaultValue={filter ?? ""} options={["active", "matched", "couple", "graduated", "archived"]} />
              <FilterSelect name="gender" label="성별" defaultValue={gender ?? ""} options={genderOptions} />
              <FilterSelect name="religion" label="종교" defaultValue={religion ?? ""} options={religionOptions} />
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                <button className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5" type="submit">
                  필터 적용
                </button>
                {filter || religion || gender || q ? (
                  <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5" href="/dashboard">
                    초기화
                  </Link>
                ) : null}
              </div>
            </form>
            {filter || religion || gender || q ? (
              <div className="flex flex-wrap gap-2">
                {q ? <span className="rounded-full border border-[#ead8cf] bg-white/90 px-3 py-2 text-xs font-semibold text-[#725861]">검색: {q}</span> : null}
                {filter ? <span className="rounded-full border border-[#ead8cf] bg-white/90 px-3 py-2 text-xs font-semibold text-[#725861]">상태: {filter}</span> : null}
                {gender ? <span className="rounded-full border border-[#ead8cf] bg-white/90 px-3 py-2 text-xs font-semibold text-[#725861]">성별: {gender}</span> : null}
                {religion ? <span className="rounded-full border border-[#ead8cf] bg-white/90 px-3 py-2 text-xs font-semibold text-[#725861]">종교: {religion}</span> : null}
                <span className="rounded-full border border-[#d8b28a] bg-[#fff4ea] px-3 py-2 text-xs font-semibold text-[#9a6548]">{visibleCandidates.length}명 표시 중</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="metricStrip dashboardDeferredSection grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active Board" value={allCandidates.filter((item) => item.status === "active").length} description="지금 바로 연결 가능한 매물" />
          <MetricCard label="In Progress" value={allCandidates.filter((item) => item.status === "matched").length} description="소개 이후 후속 만남 진행 중" />
          <MetricCard label="Couple" value={allCandidates.filter((item) => item.status === "couple").length} description="커플 성사 상태" />
          <MetricCard label="Timeline" value={timelineCount} description="누적 매칭 이력" />
        </section>

        <section className="dashboardDeferredSection rounded-[34px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
          <div className="sectionHeader mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Flow Board</p>
            <h2 className="mt-3 text-[clamp(1.8rem,8vw,3rem)] font-semibold tracking-[-0.06em] text-[#24161c]">지금 관계 흐름이 어떻게 움직이는지 바로 봅니다</h2>
            <p className="mt-3 text-[15px] leading-7 text-[#6d5961] sm:text-base">
              필터 결과가 그대로 운영 칸반에 반영되어, 지금 손대야 할 후보와 이미 감정선이 붙은 후보를 한눈에 나눠볼 수 있습니다.
            </p>
            {isPreviewMode ? (
              <div className="mt-4 rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#8a6b74]">
                아직 실제 매물이 없어 홈 프리뷰 후보를 대시보드에 표시하고 있습니다.
              </div>
            ) : null}
          </div>
          <DashboardFlowBoard
            candidates={visibleBoardCandidates}
            allCandidates={boardCandidates}
            role={boardRole}
          />
        </section>

        <section className="dashboardDeferredSection grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="sectionBlock rounded-[34px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Curated Inventory</p>
            <h2 className="mt-3 text-[clamp(1.8rem,8vw,3rem)] font-semibold tracking-[-0.06em] text-[#24161c]">전체 후보를 카드로 다시 훑어봅니다</h2>
            <p className="mt-3 text-[15px] leading-7 text-[#6d5961] sm:text-base">
              칸반으로 흐름을 본 뒤에는, 카드 리스트에서 세부 인상과 태그를 비교하면서 최종 판단을 정리합니다.
            </p>

            {visibleCandidates.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {visibleCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} role={boardRole} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[28px] border border-[#f0ddd2] bg-[#fff8f3] px-5 py-6 text-center text-[#8a6b74]">
                <strong className="block text-lg text-[#311d24]">아직 등록된 매물이 없습니다.</strong>
                <span className="mt-2 block text-sm">첫 매물을 등록하면 여기서 바로 리스트와 상태를 관리할 수 있습니다.</span>
                {canEditCandidates(membership.role) ? (
                  <div className="mt-4">
                    <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11]" href="/candidates/new">
                      첫 매물 등록하기
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <aside className="sectionBlock rounded-[34px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Recent Outcomes</p>
                <h2 className="mt-3 text-[clamp(1.4rem,7vw,2.1rem)] font-semibold tracking-[-0.05em] text-[#24161c]">최근 매칭 타임라인</h2>
              </div>
              <Link
                href="/timeline"
                className="inline-flex min-h-10 items-center rounded-full border border-[#ead8cf] bg-white/90 px-4 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
              >
                전체보기
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {timelineEvents.slice(0, 6).length ? (
                timelineEvents.slice(0, 6).map((record) => (
                  <article key={record.id} className="rounded-[24px] border border-[#ead8cf] bg-[#fffaf7] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <strong className="text-sm font-semibold text-[#24161c]">{record.title}</strong>
                      <span className="text-xs font-semibold text-[#9a6548]">{record.happened_on}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#6d5961]">{record.summary}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-[24px] border border-[#f0ddd2] bg-[#fff8f3] px-4 py-5 text-sm font-medium text-[#8a6b74]">
                  최근 매칭 기록이 아직 없습니다.
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
