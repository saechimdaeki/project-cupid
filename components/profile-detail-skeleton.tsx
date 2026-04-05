import { StudioPageShell } from "@/components/studio-page-shell";

/** Suspense fallback — 프로필 상세 레이아웃과 유사한 가벼운 스켈레톤 */
export function ProfileDetailSkeleton() {
  return (
    <StudioPageShell petalCount={58}>
      <main className="overflow-x-hidden pb-32 pt-24 text-slate-800 sm:pb-40">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 md:px-8 lg:px-12">
          <section className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,28rem)] xl:items-start">
            <article className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-rose-200/25 backdrop-blur-md">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
                <div className="min-w-0 p-4 sm:p-5 lg:p-6">
                  <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-b from-rose-50/80 to-white/40 p-2 sm:p-3">
                    <div className="mb-2 h-4 w-32 animate-pulse rounded bg-rose-100/70" />
                    <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-white/60" />
                  </div>
                </div>
                <div className="flex flex-col gap-4 p-6 sm:p-8 lg:py-10">
                  <div className="h-4 w-40 animate-pulse rounded bg-rose-100/60" />
                  <div className="h-10 max-w-md animate-pulse rounded-lg bg-slate-200/50" />
                  <div className="h-20 max-w-prose animate-pulse rounded-xl bg-slate-100/80" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-rose-50/90" />
                    ))}
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="h-28 animate-pulse rounded-2xl bg-white/60" />
                    <div className="h-28 animate-pulse rounded-2xl bg-white/60" />
                  </div>
                </div>
              </div>
            </article>
            <aside className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:p-7">
              <div className="h-4 w-36 animate-pulse rounded bg-rose-100/60" />
              <div className="mt-3 h-8 w-48 animate-pulse rounded-lg bg-slate-200/50" />
              <div className="mt-5 grid gap-3">
                <div className="h-11 animate-pulse rounded-full bg-rose-200/40" />
                <div className="h-24 animate-pulse rounded-2xl bg-rose-50/50" />
              </div>
              <div className="mt-6 h-36 animate-pulse rounded-2xl bg-slate-100/70" />
            </aside>
          </section>

          <section className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,min(28rem,1fr))] xl:items-start">
            <div className="h-80 animate-pulse rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:h-96" />
            <div className="h-72 animate-pulse rounded-3xl border border-slate-200/90 bg-slate-50 shadow-lg backdrop-blur-md" />
          </section>

          <section className="h-48 animate-pulse rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-rose-200/20 backdrop-blur-md sm:h-56" />
        </div>
      </main>
    </StudioPageShell>
  );
}
