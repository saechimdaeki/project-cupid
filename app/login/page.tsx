import Link from "next/link";
import { AuthForms } from "@/components/auth-forms";

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

function StepCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{step}</p>
      <strong className="mt-2 block text-base font-semibold text-slate-800">{title}</strong>
      <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
    </article>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 py-10 text-slate-800">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1600px] flex-col justify-center px-6 md:px-12 lg:px-24">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-slate-500 transition hover:text-slate-800">
            Project Cupid
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.92fr)] lg:items-center">
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <p className="text-sm font-medium text-rose-500">Trusted Match Network</p>
            <h1 className="mt-3 text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-slate-800">
              신뢰하는 사람만
              <br />
              승인받고 입장합니다
            </h1>
            <p className="mt-5 max-w-[56ch] text-sm leading-7 text-slate-500 sm:text-base">
              가입부터 승인, 보드 입장까지 하나의 흐름으로 정리했습니다. 감성은 유지하되
              인증 경험은 훨씬 더 가볍고 편안하게 느껴지도록 재설계했습니다.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StepCard
                step="Step 1"
                title="아이디 가입"
                body="아이디, 이름, 비밀번호만 입력"
              />
              <StepCard
                step="Step 2"
                title="승인 대기"
                body="pending 상태로 승인 큐에 등록"
              />
              <StepCard
                step="Step 3"
                title="보드 입장"
                body="승인 후 대시보드 접근 가능"
              />
            </div>
          </article>

          <AuthForms initialMessage={message} />
        </section>
      </div>
    </main>
  );
}
