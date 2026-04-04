const STEPS = [
  {
    step: "01",
    title: "가입 신청",
    description: "이메일로 간편하게 가입하고, 관리자에게 승인을 요청합니다.",
  },
  {
    step: "02",
    title: "후보 등록",
    description: "승인된 운영자가 지인의 사진, 이력, 성향을 정성스럽게 등록합니다.",
  },
  {
    step: "03",
    title: "매칭 시작",
    description: "어울리는 두 사람을 연결하고, 설렘의 흐름을 함께 기록합니다.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="flex flex-col items-center gap-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        How It Works
      </p>
      <h2 className="text-center text-foreground">
        행복한 연결을 다정하게 설계합니다
      </h2>

      <div className="mt-4 grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((item) => (
          <div
            key={item.step}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-card/60 p-6 text-center shadow-md backdrop-blur-sm"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-md">
              {item.step}
            </span>
            <h3 className="text-foreground">{item.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
