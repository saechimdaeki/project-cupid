const STATS = [
  { value: "3단계", label: "권한 모델", description: "viewer · admin · super admin" },
  { value: "비공개", label: "매칭 보드", description: "승인된 운영자만 접근" },
  { value: "전 과정", label: "흐름 추적", description: "소개부터 커플까지 기록" },
] as const;

export function LandingTrust() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/40 bg-card/60 px-5 py-6 text-center shadow-md backdrop-blur-sm"
        >
          <strong className="text-2xl font-semibold text-foreground">{stat.value}</strong>
          <p className="text-sm font-medium text-foreground">{stat.label}</p>
          <p className="text-[13px] leading-5 text-muted-foreground">{stat.description}</p>
        </div>
      ))}
    </section>
  );
}
