import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    label: "비공개 매칭 보드",
    title: "내 사람만 등록하는 프라이빗 공간",
    description:
      "믿을 수 있는 지인의 사진, 이력, 성향을 꼼꼼하게 기록하고 비공개로 관리합니다. 외부에 노출되지 않는 안전한 풀입니다.",
  },
  {
    label: "매칭 흐름 추적",
    title: "소개부터 커플까지 한눈에",
    description:
      "소개 → 첫 만남 → 교제 → 커플. 설렘의 모든 단계를 기록하고 함께 지켜봅니다. 놓치는 흐름이 없습니다.",
  },
  {
    label: "VVIP 운영 권한",
    title: "검증된 사람만 들어오는 스튜디오",
    description:
      "가입 후 관리자 승인을 거쳐야 접근할 수 있습니다. 3단계 권한으로 열람 범위를 세밀하게 조절합니다.",
  },
  {
    label: "사진 · 이력 · 온도 기록",
    title: "쌓일수록 정확해지는 매칭",
    description:
      "누구와 언제 만났는지, 결과는 어땠는지. 이력이 쌓일수록 더 따뜻하고 정확한 연결이 가능합니다.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section className="flex flex-col items-center gap-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Core Features
      </p>
      <h2 className="text-center text-foreground">설렘을 설계하는 도구들</h2>
      <p className="max-w-[52ch] text-center text-[15px] leading-7 text-muted-foreground">
        좋은 인연이 자연스럽게 이어지도록, 다정하고 단단한 흐름을 함께 만들어갑니다.
      </p>

      <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card
            key={feature.label}
            className="rounded-2xl border-border/40 bg-card/60 p-0 shadow-md backdrop-blur-sm transition hover:shadow-lg"
          >
            <CardContent className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {feature.label}
              </p>
              <h3 className="mt-3 text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
