import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import { canEditCandidates } from "@/lib/permissions";
import type { Membership } from "@/lib/types";

type AppShellProps = {
  membership: Membership | null;
  children: React.ReactNode;
};

export function AppShell({ membership, children }: AppShellProps) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="shellBrand">
          <div className="brandLockup">
            <div className="brandMark">C</div>
            <div className="brandText">
              <strong>Project Cupid</strong>
              <span>Private Matchmaking Desk</span>
            </div>
          </div>
          <p className="muted">
            신뢰 가능한 중매자만 접근하는 비공개 소개팅 운영 공간
          </p>
        </div>

        <nav className="nav">
          <Link href="/dashboard">매물 보드</Link>
          <Link href="/dashboard?filter=active">활성 매물</Link>
          <Link href="/dashboard?filter=couple">커플/졸업</Link>
          {membership?.role && canEditCandidates(membership.role) ? (
            <Link href="/candidates/new">매물 등록</Link>
          ) : null}
          <Link href="/pending">승인 대기</Link>
          {membership?.role === "super_admin" ? <Link href="/admin">승인 관리</Link> : null}
        </nav>

        <div className="sidebarCard">
          <p className="eyebrow">Current Viewer</p>
          <strong>{membership?.full_name ?? "데모 관리자"}</strong>
          <p className="muted">
            {membership?.role === "super_admin" ? "슈퍼 어드민" : "승인된 중매자"}
          </p>

          <form action={signOut}>
            <button className="secondaryButton" type="submit">
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
