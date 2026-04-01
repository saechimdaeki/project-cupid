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

  return (
    <main className="authWrap">
      <PendingStatusGuard />
      <section className="authLayout">
        <article className="authPanel">
          <p className="eyebrow">Approval Pending</p>
          <h1 className="authTitle">가입 요청은 들어왔고, 이제 승인만 남았습니다</h1>
          <p className="heroSubtitle">
            이 서비스는 신뢰 기반 소개팅 운영 도구라서 승인 전에는 데이터 보드에 접근하지 못합니다.
          </p>
          {reason ? (
            <div className="notice">
              pending reason: {reason}
              {status ? ` / status=${status}` : ""}
              {role ? ` / role=${role}` : ""}
              {code ? ` / code=${code}` : ""}
              {uid ? ` / uid=${uid}` : ""}
            </div>
          ) : null}
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
