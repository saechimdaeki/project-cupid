import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingFooterCta() {
  return (
    <section className="flex flex-col items-center gap-6 rounded-[28px] border border-border/40 bg-card/60 p-8 text-center shadow-xl backdrop-blur-lg sm:p-12">
      <h2 className="text-foreground">
        사랑이 피어나는 스튜디오,
        <br />
        지금 함께하세요
      </h2>
      <p className="max-w-[50ch] text-[15px] leading-7 text-muted-foreground">
        설렘과 행복의 기운 속에서, 좋은 인연의 시작을 더 다정하게 준비합니다.
      </p>
      <Button
        className="h-12 rounded-full px-8 shadow-xl transition hover:-translate-y-0.5"
        render={<Link href="/login" />}
      >
        무료로 시작하기
      </Button>
      <p className="text-[13px] leading-5 text-muted-foreground">
        별도 결제 없이, 승인만으로 바로 이용 가능합니다
      </p>
    </section>
  );
}
