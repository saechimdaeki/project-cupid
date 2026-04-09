import Link from "next/link";
import { Button } from "@/components/ui/button";

type LandingHeroProps = {
  isLoggedIn?: boolean;
};

export function LandingHero({ isLoggedIn }: LandingHeroProps) {
  return (
    <section className="flex flex-col items-center gap-6 pt-8 text-center sm:pt-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Private Love Studio
      </p>
      <h1 className="text-foreground">좋은 인연을 잇습니다</h1>
      <p className="max-w-[52ch] text-[15px] leading-7 text-muted-foreground">
        승인된 사람만 들어와 사진, 이력, 만남의 흐름을 함께 보며 사랑의 시작을 설계하는 프라이빗
        공간입니다.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button
          className="h-12 rounded-full px-8 shadow-xl transition hover:-translate-y-0.5"
          render={<Link href={isLoggedIn ? "/dashboard" : "/signup"} />}
        >
          {isLoggedIn ? "대시보드로 이동" : "무료로 시작하기"}
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-full px-6 transition"
          render={<a href="#how-it-works" />}
        >
          어떻게 운영되나요?
        </Button>
      </div>
      {isLoggedIn ? null : (
        <p className="text-[13px] leading-5 text-muted-foreground">
          가입은 무료, 승인 후 바로 시작할 수 있습니다
        </p>
      )}
    </section>
  );
}
