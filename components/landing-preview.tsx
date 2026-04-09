import { Card, CardContent } from "@/components/ui/card";
import { PersonPreview } from "@/components/person-preview";
import { cn } from "@/lib/cn";

const FEMALE = {
  imageUrl: "/99년생 여자 기획자.png",
  label: "96년생 · 서울 마포",
  subtitle: "브랜드 마케터 · 뷰티 스타트업",
};
const MALE = {
  imageUrl: "/94년생 남자 개발자.png",
  label: "92년생 · 판교",
  subtitle: "백엔드 개발자 · 핀테크 스타트업",
};

function ProfileCard({
  imageUrl,
  name,
  subtitle,
  className,
}: {
  imageUrl: string | null;
  name: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "w-52 rounded-[28px] border-border/50 bg-card/70 p-0 shadow-xl backdrop-blur-lg",
        className,
      )}
    >
      <CardContent className="p-3">
        <div className="overflow-hidden rounded-[20px] border border-border/30 bg-secondary/40">
          <PersonPreview
            imageUrl={imageUrl}
            size="sm"
            fit="cover"
            position="top"
            className="h-56 bg-secondary/40"
          />
        </div>
        <div className="px-1 pb-1 pt-3">
          <strong className="block text-sm font-semibold text-foreground">{name}</strong>
          <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LandingPreview() {
  return (
    <section className="flex flex-col items-center gap-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Cupid Preview
      </p>
      <h2 className="text-center text-foreground">더 따뜻하고 더 설레는 무드 속에서</h2>
      <p className="max-w-[50ch] text-center text-[15px] leading-7 text-muted-foreground">
        한 사람의 행복한 만남을 정성스럽게 준비합니다. 실제 프로필이 이렇게 보입니다.
      </p>

      <div className="relative mt-4 flex w-full items-center justify-center">
        <div className="relative h-[26rem] w-full max-w-xl">
          <ProfileCard
            imageUrl={FEMALE.imageUrl}
            name={FEMALE.label}
            subtitle={FEMALE.subtitle}
            className="absolute left-4 top-4 rotate-[-8deg] sm:left-12"
          />
          <ProfileCard
            imageUrl={MALE.imageUrl}
            name={MALE.label}
            subtitle={MALE.subtitle}
            className="absolute bottom-4 right-4 rotate-[6deg] sm:right-12"
          />

          <svg viewBox="0 0 500 350" className="absolute inset-0 size-full" aria-hidden="true">
            <defs>
              <linearGradient id="preview-beam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(251 113 133 / 0.22)" />
                <stop offset="50%" stopColor="rgb(251 191 36 / 0.18)" />
                <stop offset="100%" stopColor="rgb(244 114 182 / 0.18)" />
              </linearGradient>
            </defs>
            <path
              d="M100 140 C200 60, 300 240, 400 160"
              fill="none"
              stroke="url(#preview-beam)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/50 bg-card/80 px-4 py-2 text-[13px] font-medium leading-5 text-muted-foreground shadow-md backdrop-blur">
            설렘의 시작
          </div>
        </div>
      </div>
    </section>
  );
}
