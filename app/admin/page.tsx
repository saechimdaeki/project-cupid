import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { StatusBadge } from "@/components/status-badge";
import { LandingScene } from "@/components/landing-scene";
import { WorkspaceDecorations } from "@/components/workspace-decorations";
import { rejectMembership, updateMembershipRole } from "@/lib/admin-actions";
import { getMembershipDirectory, getPendingMemberships } from "@/lib/data";
import { previewSceneCandidates } from "@/lib/preview-scene";
import { requireMembershipRole } from "@/lib/permissions";

type AdminPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [pendingUsers, allMembers, currentMembership] = await Promise.all([
    getPendingMemberships(),
    getMembershipDirectory(),
    requireMembershipRole(["super_admin"]),
  ]);
  const { message } = await searchParams;
  const managedMembers = allMembers.filter((member) => member.status === "approved");

  return (
    <main className="workspacePage min-h-screen bg-[linear-gradient(180deg,#fff8f2_0%,#fff3ec_42%,#fffaf6_100%)] text-[#24161c]">
      <div className="landingWrap relative mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <WorkspaceDecorations />
        {currentMembership ? (
          <header className="flex flex-col gap-4 rounded-[30px] border border-[#ead8cf] bg-white/85 p-4 shadow-[0_14px_40px_rgba(143,95,89,0.08)] backdrop-blur-sm lg:flex-row lg:items-start lg:justify-between">
            <Link href="/" className="flex min-w-0 items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[#e9d7cf] bg-gradient-to-br from-[#fffaf7] to-[#fff1e8] text-2xl font-semibold text-[#d1a06b]">
                C
              </div>
              <div className="min-w-0">
                <strong className="block text-[clamp(1.1rem,4vw,1.8rem)] font-semibold tracking-[-0.04em] text-[#24161c]">Project Cupid</strong>
                <span className="block text-sm leading-6 text-[#7a636b] sm:text-base">{currentMembership.full_name} · 슈퍼어드민</span>
              </div>
            </Link>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[340px]">
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5" href="/">
                  홈으로
                </Link>
                <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24] transition hover:-translate-y-0.5" href="/dashboard">
                  대시보드
                </Link>
                <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11] shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5" href="/candidates/new">
                  매물 등록
                </Link>
              </div>
              <AccountPanel membership={currentMembership} />
            </div>
          </header>
        ) : null}

        <section className="grid gap-5 rounded-[34px] border border-[#ead8cf] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,244,239,0.96))] p-4 shadow-[0_24px_70px_rgba(143,95,89,0.12)] sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <div className="rounded-[30px] border border-[#ead8cf] bg-white/74 p-6 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Super Admin Control</p>
                <h1 className="pageTitle mt-4 text-[clamp(2.2rem,9vw,4.2rem)] font-semibold tracking-[-0.08em] text-[#24161c]">회원 승인과 권한 지정</h1>
                <p className="pageMeta mt-4 max-w-[60ch] text-[15px] leading-7 text-[#6d5961] sm:text-base">
                  super_admin은 전체 관리, admin은 상세·사진·편집, viewer는 목록만 열람하도록 분리합니다.
                </p>
              </div>
              <StatusBadge tone="warning">대기 {pendingUsers.length}명</StatusBadge>
            </div>
          </div>
          <div className="overflow-hidden rounded-[30px] border border-[#ead8cf] bg-white/66 p-3 shadow-[0_18px_44px_rgba(143,95,89,0.08)]">
            <LandingScene
              leftCandidate={previewSceneCandidates[0]}
              rightCandidate={previewSceneCandidates[1]}
            />
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#8a6b74]">
            {message}
          </div>
        ) : null}

        <section className="rounded-[34px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Pending Queue</p>
            <h2 className="mt-3 text-[clamp(1.8rem,8vw,3rem)] font-semibold tracking-[-0.06em] text-[#24161c]">승인 대기 인원</h2>
          </div>
          <div className="grid gap-4">
            {pendingUsers.length ? (
              pendingUsers.map((user) => (
                <article key={user.user_id} className="queueItem rounded-[28px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_14px_36px_rgba(143,95,89,0.08)]">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.05em] text-[#24161c]">{user.full_name}</h3>
                      <p className="mt-1 text-sm text-[#7a636b]">@{user.username}</p>
                    </div>
                    <StatusBadge tone="warning">{user.created_at.slice(0, 10)}</StatusBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#6d5961]">
                    <span className="rounded-full border border-[#ead8cf] bg-[#fffaf7] px-3 py-2">기본 요청 권한: {user.role}</span>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <form action={updateMembershipRole}>
                      <input type="hidden" name="userId" value={user.user_id} />
                      <input type="hidden" name="role" value="viewer" />
                      <input type="hidden" name="status" value="approved" />
                      <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11]" type="submit">
                        뷰어 승인
                      </button>
                    </form>
                    <form action={updateMembershipRole}>
                      <input type="hidden" name="userId" value={user.user_id} />
                      <input type="hidden" name="role" value="admin" />
                      <input type="hidden" name="status" value="approved" />
                      <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24]" type="submit">
                        어드민 승인
                      </button>
                    </form>
                    <form action={rejectMembership}>
                      <input type="hidden" name="userId" value={user.user_id} />
                      <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#f0ddd2] bg-[#fff8f3] px-5 text-sm font-semibold text-[#9a6548]" type="submit">
                        거절
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-[#f0ddd2] bg-[#fff8f3] px-5 py-6 text-center text-[#8a6b74]">
                현재 승인 대기 중인 계정이 없습니다.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[34px] border border-[#ead8cf] bg-white/88 p-5 shadow-[0_18px_44px_rgba(143,95,89,0.08)] sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b46d59]">Role Directory</p>
            <h2 className="mt-3 text-[clamp(1.8rem,8vw,3rem)] font-semibold tracking-[-0.06em] text-[#24161c]">현재 승인된 운영 인원</h2>
          </div>
          <div className="grid gap-4">
            {managedMembers.length ? (
              managedMembers.map((member) => {
                const isCurrentUser = member.user_id === currentMembership?.user_id;
                return (
                  <article key={member.user_id} className="queueItem rounded-[28px] border border-[#ead8cf] bg-white/90 p-5 shadow-[0_14px_36px_rgba(143,95,89,0.08)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.05em] text-[#24161c]">{member.full_name}</h3>
                        <p className="mt-1 text-sm text-[#7a636b]">@{member.username}</p>
                      </div>
                      <StatusBadge tone={member.role === "super_admin" ? "success" : member.role === "admin" ? "warning" : "default"}>
                        {member.role}
                      </StatusBadge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#6d5961]">
                      <span className="rounded-full border border-[#ead8cf] bg-[#fffaf7] px-3 py-2">{member.created_at.slice(0, 10)} 등록</span>
                      <span className="rounded-full border border-[#ead8cf] bg-[#fffaf7] px-3 py-2">{isCurrentUser ? "현재 로그인 계정" : "역할 변경 가능"}</span>
                    </div>
                    <div className="mt-5">
                      {isCurrentUser ? (
                        <div className="rounded-2xl border border-[#f0ddd2] bg-[#fff8f3] px-4 py-3 text-sm font-medium text-[#8a6b74]">
                          현재 로그인한 super_admin 계정은 이 화면에서 권한을 바꾸지 않습니다.
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-3">
                          <form action={updateMembershipRole}>
                            <input type="hidden" name="userId" value={member.user_id} />
                            <input type="hidden" name="role" value="viewer" />
                            <input type="hidden" name="status" value="approved" />
                            <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24]" type="submit">
                              viewer로 변경
                            </button>
                          </form>
                          <form action={updateMembershipRole}>
                            <input type="hidden" name="userId" value={member.user_id} />
                            <input type="hidden" name="role" value="admin" />
                            <input type="hidden" name="status" value="approved" />
                            <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#ead8cf] bg-white/90 px-5 text-sm font-semibold text-[#2d1e24]" type="submit">
                              admin으로 변경
                            </button>
                          </form>
                          <form action={updateMembershipRole}>
                            <input type="hidden" name="userId" value={member.user_id} />
                            <input type="hidden" name="role" value="super_admin" />
                            <input type="hidden" name="status" value="approved" />
                            <button className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#d8b28a] bg-gradient-to-r from-[#f2c98d] to-[#c78662] px-5 text-sm font-semibold text-[#2b1b11]" type="submit">
                              super_admin으로 승격
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[28px] border border-[#f0ddd2] bg-[#fff8f3] px-5 py-6 text-center text-[#8a6b74]">
                아직 승인된 운영 계정이 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
