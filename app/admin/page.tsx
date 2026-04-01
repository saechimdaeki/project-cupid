import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { updateMembershipRole, rejectMembership } from "@/lib/admin-actions";
import { getCurrentMembership } from "@/lib/permissions";
import { getMembershipDirectory, getPendingMemberships } from "@/lib/data";

type AdminPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [pendingUsers, allMembers, currentMembership] = await Promise.all([
    getPendingMemberships(),
    getMembershipDirectory(),
    getCurrentMembership(),
  ]);
  const { message } = await searchParams;
  const managedMembers = allMembers.filter((member) => member.status === "approved");

  return (
    <main className="pageFrame">
      <div className="landingWrap">
        <div className="pageHeader">
          <div>
            <p className="eyebrow">Super Admin Control</p>
            <h1 className="pageTitle">회원 승인과 권한 지정</h1>
            <p className="pageMeta">super_admin은 전체 관리, admin은 상세·사진·편집, viewer는 목록만 열람하도록 분리합니다.</p>
          </div>
          <div className="heroActions">
            <StatusBadge tone="warning">대기 {pendingUsers.length}명</StatusBadge>
            <Link className="primaryButton" href="/candidates/new">
              매물 등록
            </Link>
          </div>
        </div>

        {message ? <div className="notice">{message}</div> : null}

        <section className="queueList">
          {pendingUsers.length ? (
            pendingUsers.map((user) => (
              <article key={user.user_id} className="queueItem">
                <div className="cardTop">
                  <div>
                    <h4>{user.full_name}</h4>
                    <p>@{user.username}</p>
                  </div>
                  <StatusBadge>{user.created_at.slice(0, 10)}</StatusBadge>
                </div>
                <div className="historyMeta">
                  <span>기본 요청 권한: {user.role}</span>
                </div>
                <div className="heroActions">
                  <form action={updateMembershipRole}>
                    <input type="hidden" name="userId" value={user.user_id} />
                    <input type="hidden" name="role" value="viewer" />
                    <input type="hidden" name="status" value="approved" />
                    <button className="primaryButton" type="submit">
                      뷰어 승인
                    </button>
                  </form>
                  <form action={updateMembershipRole}>
                    <input type="hidden" name="userId" value={user.user_id} />
                    <input type="hidden" name="role" value="admin" />
                    <input type="hidden" name="status" value="approved" />
                    <button className="ghostButton" type="submit">
                      어드민 승인
                    </button>
                  </form>
                  <form action={rejectMembership}>
                    <input type="hidden" name="userId" value={user.user_id} />
                    <button className="ghostButton" type="submit">
                      거절
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <div className="emptyState">현재 승인 대기 중인 계정이 없습니다.</div>
          )}
        </section>

        <section className="sectionBlock">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">Role Directory</p>
              <h2 className="pageTitle">현재 승인된 운영 인원</h2>
              <p className="pageMeta">super_admin은 기존 운영자의 역할도 여기서 바로 조정합니다.</p>
            </div>
          </div>

          <div className="queueList">
            {managedMembers.length ? (
              managedMembers.map((member) => {
                const isCurrentUser = member.user_id === currentMembership?.user_id;

                return (
                  <article key={member.user_id} className="queueItem">
                    <div className="cardTop">
                      <div>
                        <h4>{member.full_name}</h4>
                        <p>@{member.username}</p>
                      </div>
                      <StatusBadge tone={member.role === "super_admin" ? "success" : member.role === "admin" ? "warning" : "default"}>
                        {member.role}
                      </StatusBadge>
                    </div>
                    <div className="historyMeta">
                      <span>{member.created_at.slice(0, 10)} 등록</span>
                      <span>{isCurrentUser ? "현재 로그인 계정" : "역할 변경 가능"}</span>
                    </div>
                    <div className="heroActions">
                      {isCurrentUser ? (
                        <div className="viewerHint">현재 로그인한 super_admin 계정은 이 화면에서 권한을 바꾸지 않습니다.</div>
                      ) : (
                        <>
                          <form action={updateMembershipRole}>
                            <input type="hidden" name="userId" value={member.user_id} />
                            <input type="hidden" name="role" value="viewer" />
                            <input type="hidden" name="status" value="approved" />
                            <button className="ghostButton" type="submit">
                              viewer로 변경
                            </button>
                          </form>
                          <form action={updateMembershipRole}>
                            <input type="hidden" name="userId" value={member.user_id} />
                            <input type="hidden" name="role" value="admin" />
                            <input type="hidden" name="status" value="approved" />
                            <button className="ghostButton" type="submit">
                              admin으로 변경
                            </button>
                          </form>
                          <form action={updateMembershipRole}>
                            <input type="hidden" name="userId" value={member.user_id} />
                            <input type="hidden" name="role" value="super_admin" />
                            <input type="hidden" name="status" value="approved" />
                            <button className="primaryButton" type="submit">
                              super_admin으로 승격
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="emptyState">아직 승인된 운영 계정이 없습니다.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
