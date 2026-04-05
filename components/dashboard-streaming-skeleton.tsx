/** Suspense fallback — ManagerDashboard 레이아웃과 유사한 스켈레톤 (벚꽃 이펙트 없이 가볍게) */
export function DashboardStreamingSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 to-orange-50/50 text-slate-800">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_22%_0%,rgba(255,228,230,0.6),transparent_46%),radial-gradient(ellipse_at_82%_28%,rgba(255,237,213,0.48),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(255,241,242,0.52),transparent_55%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-8 overflow-x-hidden px-4 pb-32 pt-24 md:pb-20 md:px-8 lg:px-12">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 min-w-[7rem] flex-1 animate-pulse rounded-2xl bg-white/70 shadow-sm sm:min-w-[8.5rem]"
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md">
          <div className="h-10 w-full max-w-md animate-pulse rounded-xl bg-rose-100/60" />
          <div className="hidden h-9 max-w-xl animate-pulse rounded-xl bg-rose-50/80 lg:block" />
        </div>

        <div className="hidden gap-5 lg:grid lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[22rem] animate-pulse rounded-[26px] border border-white/70 bg-white/50 p-5 shadow-sm"
            />
          ))}
        </div>

        <div className="h-[28rem] animate-pulse rounded-[26px] border border-white/60 bg-white/50 lg:hidden" />
      </main>
    </div>
  );
}
