import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSubmitButton } from "@/components/form-submit-button";
import { GenderToggleField } from "@/components/gender-toggle-field";
import { GlobalNav } from "@/components/global-nav";
import { PhotoUploadField } from "@/components/photo-upload-field";
import { cn } from "@/lib/cn";
import { createCandidate } from "@/lib/admin-actions";
import { requireMembershipRole } from "@/lib/permissions";

type NewCandidatePageProps = {
  searchParams: Promise<{ message?: string }>;
};

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="flex flex-wrap items-center gap-2 text-[0.96rem] font-bold text-secondary-foreground">
      <span>{children}</span>
      <Badge
        variant={required ? "default" : "secondary"}
        className={cn(
          "text-[11px] font-semibold",
          required
            ? "bg-secondary text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        {required ? "[필수]" : "[선택]"}
      </Badge>
    </span>
  );
}

export default async function NewCandidatePage({ searchParams }: NewCandidatePageProps) {
  const membership = await requireMembershipRole(["admin", "super_admin"]);
  const { message } = await searchParams;
  const submissionKey = crypto.randomUUID();

  return (
    <>
      <GlobalNav membership={membership} active="candidates" />
      <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-background to-secondary text-foreground">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-32 pt-24 md:pb-10 md:px-8 lg:px-12">
        <Card className="flex flex-col gap-4 rounded-[34px] border-border bg-gradient-to-br from-card to-secondary p-6 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <CardContent className="p-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">Candidate Studio</p>
            <h1 className="mt-4 text-[clamp(2.2rem,9vw,4.2rem)] font-semibold tracking-[-0.08em] text-foreground">새 매물 등록</h1>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-7 text-muted-foreground sm:text-base">
              admin과 super_admin은 기본 프로필, 태그, 사진 갤러리까지 함께 등록할 수 있습니다.
            </p>
          </CardContent>
          <div className="flex w-full shrink-0 sm:w-auto">
            <Button
              variant="outline"
              className="min-h-14 w-full rounded-full border-border bg-card/90 px-8 text-base font-semibold text-foreground sm:min-w-[10.5rem] sm:w-auto"
              render={<Link href="/dashboard" />}
            >
              대시보드
            </Button>
          </div>
        </Card>

        {message ? (
          <div className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-medium text-muted-foreground">
            {message}
          </div>
        ) : null}

        <form action={createCandidate} className="grid gap-5">
          <input type="hidden" name="submissionKey" value={submissionKey} />
          <section className="grid gap-5 xl:grid-cols-2">
            <Card className="rounded-[30px] border-border bg-card/90 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
              <CardContent className="p-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">Basic Info</p>
                <h2 className="mt-3 text-[clamp(1.6rem,7vw,2.4rem)] font-semibold tracking-[-0.05em] text-foreground">기본 프로필</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  필수 입력: 지역, 출생연도, 성별, 직업 · 이름은 비워두면 카드에 &quot;NN년생 직업&quot;만 표시됩니다.
                </p>
                <div className="mt-6 grid gap-4">
                  <Label className="grid gap-2">
                    <FieldLabel>이름</FieldLabel>
                    <Input
                      name="fullName"
                      placeholder="[선택] 예: 김OO 또는 비워두기 (대시보드는 93년생 기자 형태로 구분)"
                      className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground"
                    />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel required>출생연도</FieldLabel>
                    <Input name="birthYear" type="number" placeholder="[필수] 예: 1994" required className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>키</FieldLabel>
                    <Input name="heightText" placeholder="[선택] 예: 168cm / 모름" defaultValue="모름" className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <GenderToggleField name="gender" required />
                  <Label className="grid gap-2">
                    <FieldLabel required>지역</FieldLabel>
                    <Input name="region" placeholder="[필수] 예: 서울" required className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel required>직업</FieldLabel>
                    <Input name="occupation" placeholder="[필수] 예: 기획자" required className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>직장 / 직무</FieldLabel>
                    <Input name="workSummary" placeholder="[선택] 예: INNOVATE · 서비스 기획" className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>학력</FieldLabel>
                    <Input name="education" placeholder="[선택] 예: 연세대학교" className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>종교</FieldLabel>
                    <Input name="religion" placeholder="[선택] 예: 무교" className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>MBTI</FieldLabel>
                    <Input name="mbti" placeholder="[선택] 예: ENFJ" className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>상태</FieldLabel>
                    <Input name="status" placeholder="[선택] 기본값 active" defaultValue="active" className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-border bg-card/90 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
              <CardContent className="p-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">Story & Photos</p>
                <h2 className="mt-3 text-[clamp(1.6rem,7vw,2.4rem)] font-semibold tracking-[-0.05em] text-foreground">소개 판단용 정보</h2>
                <div className="mt-6 grid gap-4">
                  <Label className="grid gap-2">
                    <FieldLabel>인상 요약</FieldLabel>
                    <Textarea name="personalitySummary" rows={4} placeholder="[선택] 차분하고 센스가 있으며..." className="rounded-[22px] border-border bg-white/95 px-4 py-3 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>이상형</FieldLabel>
                    <Textarea name="idealType" rows={3} placeholder="[선택] 성실하고 유머가 있으며..." className="rounded-[22px] border-border bg-white/95 px-4 py-3 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>비공개 메모</FieldLabel>
                    <Textarea name="notesPrivate" rows={4} placeholder="[선택] 주말 취향, 비흡연 여부 등" className="rounded-[22px] border-border bg-white/95 px-4 py-3 text-sm font-semibold text-foreground" />
                  </Label>
                  <Label className="grid gap-2">
                    <FieldLabel>태그</FieldLabel>
                    <Input name="highlightTags" placeholder="[선택] 예: 대화잘함, 서울거주, 비흡연" className="min-h-12 rounded-2xl border-border bg-white/95 px-4 text-sm font-semibold text-foreground" />
                  </Label>
                  <PhotoUploadField storageFolderId={submissionKey} />
                  <FormSubmitButton
                    idleLabel="매물 등록하기"
                    pendingLabel="등록 중..."
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-gradient-to-r from-accent to-primary px-6 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="mt-4 rounded-2xl border border-border bg-secondary px-4 py-4 text-sm leading-6 text-muted-foreground">
                  지역, 출생연도, 성별, 직업은 필수입니다. 이름은 알 수 없으면 비워도 됩니다. 나머지는 선택 입력입니다. 사진은 private bucket에 저장되고, 상세 화면에서는 signed URL로만 열립니다.
                </div>
              </CardContent>
            </Card>
          </section>
        </form>
      </div>
      </main>
    </>
  );
}
