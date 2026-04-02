import Link from "next/link";
import { PendingStatusGuard } from "@/components/pending-status-guard";

type PendingPageProps = {
  searchParams: Promise<{
    reason?: string;
    code?: string;
    uid?: string;
    status?: string;
    role?: string;
  }>;
};

export default async function PendingPage({ searchParams }: PendingPageProps) {
  const { reason, code, uid, status, role } = await searchParams;
  const pendingMessage =
    reason || status || role || code || uid
      ? "아직 계정 승인이 끝나지 않았습니다. 승인 완료 후 다시 자동으로 입장할 수 있습니다."
      : null;

  return (
    <main className="authWrap">
      <PendingStatusGuard />
      <section className="authLayout">
        <article className="authPanel">
          <p className="eyebrow">Approval Pending</p>
          <h1 className="max-w-[10ch] text-[clamp(2rem,5.2vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[#24161c]">
            saechimdaeki에게
            <br />
            카톡이나 개인 연락으로
            <br />
            승인 요청을 보내세요
          </h1>
          <p className="heroSubtitle">
            이 서비스는 신뢰 기반 소개팅 운영 도구라서 승인 전에는 데이터 보드에 접근하지 못합니다.
          </p>
          {pendingMessage ? <div className="notice">{pendingMessage}</div> : null}
          <div className="heroActions">
            <Link className="primaryButton" href="/admin">
              승인 관리 보기
            </Link>
            <Link className="ghostButton" href="/">
              홈으로
            </Link>
          </div>
        </article>

        <article className="sideCard">
          <div className="processItem">
            <div className="processIndex">1</div>
            <strong>회원가입 완료</strong>
            <span>id와 이름 기준으로 접근 요청이 생성됩니다.</span>
          </div>
          <div className="processItem">
            <div className="processIndex">2</div>
            <strong>슈퍼어드민 권한 부여</strong>
            <span>viewer, admin 중 어떤 범위까지 열지 검토한 뒤 승인합니다.</span>
          </div>
          <div className="processItem">
            <div className="processIndex">3</div>
            <strong>승인 후 입장</strong>
            <span>승인되면 매물 보드와 상세 이력이 열립니다.</span>
          </div>
        </article>
      </section>
    </main>
  );
}
