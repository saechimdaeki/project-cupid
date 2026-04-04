import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    step: "01",
    title: "가입 요청",
    description: "아이디, 이름, 비밀번호만 입력하면 끝입니다.",
  },
  {
    step: "02",
    title: "관리자 승인",
    description: "신뢰할 수 있는 사람인지 관리자가 확인합니다.",
  },
  {
    step: "03",
    title: "보드 입장",
    description: "승인 후 매칭 보드에 바로 접근할 수 있습니다.",
  },
] as const;

const ROLES = [
  {
    role: "Viewer",
    description: "후보 목록 열람",
  },
  {
    role: "Admin",
    description: "후보 등록 · 매칭 운영",
  },
] as const;

export function SignupInfo() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-2xl border-border/40 bg-card/60 p-0 shadow-md backdrop-blur-sm">
        <CardContent className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            가입 후 흐름
          </p>
          <div className="mt-4 flex flex-col gap-4">
            {STEPS.map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold leading-none text-white">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/40 bg-card/60 p-0 shadow-md backdrop-blur-sm">
        <CardContent className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            권한 안내
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {ROLES.map((item) => (
              <div key={item.role} className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-foreground">{item.role}</span>
                <span className="text-[13px] leading-5 text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-5 text-muted-foreground">
            가입 시 기본 권한은 관리자가 승인 과정에서 지정합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
