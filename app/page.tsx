import Link from "next/link";
import { LandingScene } from "@/components/landing-scene";
import { LazyHomeAccountShell } from "@/components/lazy-home-account-shell";
import { LazySplashIntro } from "@/components/lazy-splash-intro";
import { PersonPreview } from "@/components/person-preview";
import { mockCandidates } from "@/lib/mock-data";

function QuickStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-[28px] border border-[#e8d8cf] bg-white/80 p-5 shadow-[0_14px_36px_rgba(143,95,89,0.08)] backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b46d59]">
        {label}
      </p>
      <strong className="mt-3 block text-2xl font-semibold tracking-[-0.04em] text-[#24161c]">
        {value}
      </strong>
      <span className="mt-2 block text-sm leading-6 text-[#6d5961]">{description}</span>
    </article>
  );
}

function InventoryCard({
  title,
  subtitle,
  imageUrl,
  tone,
}: {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  tone: "rose" | "gold";
}) {
  return (
    <article
      className={`overflow-hidden rounded-[28px] border p-4 shadow-[0_16px_36px_rgba(143,95,89,0.1)] ${
        tone === "rose"
          ? "border-[#f0d8dd] bg-gradient-to-br from-white via-[#fff7f8] to-[#fff1ec]"
          : "border-[#ecdcc8] bg-gradient-to-br from-white via-[#fff9f1] to-[#fff4eb]"
      }`}
    >
      <div className="rounded-[22px] bg-white/85 p-3">
        <PersonPreview
          imageUrl={imageUrl}
          size="sm"
          fit="cover"
          position="top"
          className="min-h-[220px] rounded-[20px] bg-[#fffaf7]"
        />
      </div>
      <div className="px-1 pb-1 pt-4">
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#24161c]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#6d5961]">{subtitle}</p>
      </div>
    </article>
  );
}

export default function HomePage() {
  const previewCandidates = mockCandidates.slice(0, 2);
  const leftCandidate = previewCandidates[0];
  const rightCandidate = previewCandidates[1] ?? previewCandidates[0];

  return (
    <main className="landingPage relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fff8f2_0%,#fff3ec_42%,#fffaf6_100%)] text-[#24161c]">
      <LazySplashIntro />
      <div className="landingWrap mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden">
          <span className="pageGlow glowLeft" />
          <span className="pageGlow glowRight" />
          <span className="blossomPetal petal1" />
          <span className="blossomPetal petal2" />
          <span className="blossomPetal petal3" />
          <span className="blossomPetal petal4" />
          <span className="blossomPetal petal5" />
          <span className="floatingHeart heartOne">♥</span>
          <span className="floatingHeart heartTwo">♥</span>
          <span className="floatingHeart heartThree">♥</span>
          <span className="floatingHeart heartFour">♥</span>
          <div className="absolute left-[8%] top-16 h-24 w-24 rounded-full bg-pink-200/30 blur-3xl" />
          <div className="absolute right-[12%] top-24 h-28 w-28 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute left-[18%] top-48 text-3xl text-pink-300/60">❀</div>
          <div className="absolute right-[18%] top-64 text-2xl text-pink-300/50">❀</div>
          <div className="absolute left-[12%] top-[34rem] text-xl text-rose-300/40">❀</div>
          <div className="absolute right-[10%] top-[26rem] text-xl text-rose-300/40">❀</div>
          <div className="absolute left-[9%] top-[52rem] text-2xl text-pink-300/40">❀</div>
        </div>
        <header className="flex flex-col gap-4 rounded-[30px] border border-[#ead8cf] bg-white/85 p-4 shadow-[0_14px_40px_rgba(143,95,89,0.08)] backdrop-blur-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[#e9d7cf] bg-gradient-to-br from-[#fffaf7] to-[#fff1e8] text-2xl font-semibold text-[#d1a06b]">
              C
            </div>
            <div className="min-w-0">
              <strong className="block text-[clamp(1.1rem,4vw,1.9rem)] font-semibold tracking-[-0.04em] text-[#24161c]">
                Project Cupid
              </strong>
              <span className="block text-sm leading-6 text-[#7a636b] sm:text-base">
                Private Matchmaking Workspace
              </span>
            </div>
          </div>

          <LazyHomeAccountShell />
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-stretch">
          <article className="overflow-hidden rounded-[34px] border border-[#ead8cf] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,239,0.96))] p-6 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:p-7 lg:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
              Private Matchmaking Studio
            </p>
            <h1 className="mt-4 max-w-[12ch] text-[clamp(2.4rem,11vw,5.3rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-[#24161c]">
              좋은 인연을
              <br />
              잇습니다
            </h1>
            <p className="mt-5 max-w-[58ch] text-[15px] leading-7 text-[#6d5961] sm:text-base">
              승인된 사람만 들어와 사진, 이력, 만남의 흐름을 함께 보며 소개를 설계하는
              프라이빗 매칭 스튜디오입니다. 모바일에서도 바로 읽히도록 홈 화면부터
              가볍고 단단하게 다시 정리합니다.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["비공개 매칭 보드", "사진 · 이력 · 온도 기록", "admin · super_admin 운영"].map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-9 items-center rounded-full border border-[#ead8cf] bg-white/80 px-4 text-xs font-semibold text-[#6d5961] sm:text-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-6 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5"
                href="/dashboard"
              >
                대시보드로 이동
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-6 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5"
                href="/dashboard?filter=active"
              >
                소개 흐름 보기
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <QuickStat label="Access Model" value="3단계 권한" description="viewer, admin, super_admin으로 분리" />
              <QuickStat label="Candidate Photos" value={`${mockCandidates.length}건`} description="대표 사진과 상세 갤러리를 함께 관리" />
              <QuickStat label="Trusted Flow" value="승인 기반 운영" description="누가 어디까지 볼지 화면 단위로 제어" />
            </div>
          </article>

          <aside className="relative overflow-hidden rounded-[34px] border border-[#ead8cf] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,246,240,0.98))] p-3 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:p-4">
            <div className="mb-3 flex items-center justify-between px-2 pt-2 sm:px-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b46d59]">
                Cupid Preview
              </p>
              <span className="inline-flex min-h-9 items-center rounded-full border border-[#ead8cf] bg-white/85 px-3 text-xs font-semibold text-[#725861]">
                love in motion
              </span>
            </div>
            <LandingScene leftCandidate={leftCandidate} rightCandidate={rightCandidate} />
          </aside>
        </section>

        <section className="rounded-[34px] border border-[#ead8cf] bg-white/85 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">
                Preview Inventory
              </p>
              <h2 className="mt-3 text-[clamp(1.8rem,8vw,3rem)] font-semibold tracking-[-0.06em] text-[#24161c]">
                승인된 사람만 보는 실제 매물 보드
              </h2>
              <p className="mt-3 max-w-[60ch] text-[15px] leading-7 text-[#6d5961] sm:text-base">
                viewer는 여기까지, admin 이상은 상세와 사진 갤러리로 이어집니다.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {mockCandidates.map((candidate, index) => (
              <InventoryCard
                key={candidate.id}
                tone={index % 2 === 0 ? "rose" : "gold"}
                imageUrl={candidate.image_url}
                title={`${candidate.full_name} · ${candidate.region}`}
                subtitle={`${candidate.birth_year}년생 · ${candidate.gender} · ${candidate.occupation}`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
