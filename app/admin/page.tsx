import { GlobalNav } from "@/components/global-nav";
import { rejectMembership, updateMembershipRole } from "@/lib/admin-actions";
import { getApprovedMemberships, getPendingMemberships } from "@/lib/data";
import { requireMembershipRole } from "@/lib/permissions";
import type { AppRole, Membership } from "@/lib/types";

type AdminPageProps = {
  searchParams: Promise<{ message?: string }>;
};

function getRoleBadgeClass(role: AppRole) {
  switch (role) {
    case "super_admin":
      return "border-violet-100 bg-violet-50 text-violet-600";
    case "admin":
      return "border-blue-100 bg-blue-50 text-blue-600";
    case "viewer":
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function OverviewCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <strong className="mt-2 block text-3xl font-semibold tracking-[-0.04em] text-slate-800">
        {value}
      </strong>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </article>
  );
}

function PendingMemberCard({ member }: { member: Membership }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {member.full_name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-base font-semibold text-slate-800">
              {member.full_name}
            </strong>
            <p className="truncate text-sm text-slate-500">@{member.username}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadgeClass(member.role)}`}
        >
          {member.role}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">{member.created_at.slice(0, 10)} 등록</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">요청 권한 {member.role}</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <form action={updateMembershipRole} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input type="hidden" name="userId" value={member.user_id} />
          <input type="hidden" name="status" value="approved" />
          <select
            name="role"
            defaultValue={member.role}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none"
          >
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
            <option value="super_admin">super_admin</option>
          </select>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-rose-500 px-4 text-sm font-semibold text-white"
          >
            승인
          </button>
        </form>
        <form action={rejectMembership}>
          <input type="hidden" name="userId" value={member.user_id} />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600"
          >
            거절
          </button>
        </form>
      </div>
    </article>
  );
}

function DirectoryRow({
  member,
  currentUserId,
}: {
  member: Membership;
  currentUserId: string;
}) {
  const isCurrentUser = member.user_id === currentUserId;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:rounded-none md:border-0 md:border-b md:shadow-none">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(120px,0.5fr)_minmax(140px,0.6fr)_minmax(200px,0.8fr)] md:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {member.full_name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-sm font-semibold text-slate-800">
              {member.full_name}
            </strong>
            <p className="truncate text-sm text-slate-500">@{member.username}</p>
          </div>
        </div>

        <div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadgeClass(member.role)}`}
          >
            {member.role}
          </span>
        </div>

        <div className="text-sm text-slate-500">{member.created_at.slice(0, 10)}</div>

        <div className="w-full">
          {isCurrentUser ? (
            <div className="text-sm text-slate-400">현재 로그인 계정</div>
          ) : (
            <form action={updateMembershipRole} className="flex w-full gap-2">
              <input type="hidden" name="userId" value={member.user_id} />
              <input type="hidden" name="status" value="approved" />
              <select
                name="role"
                defaultValue={member.role}
                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none"
              >
                <option value="viewer">viewer</option>
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
              </select>
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-600"
              >
                저장
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

/** 이 페이지와 하위 폼 액션의 권한 변경은 서버에서 super_admin만 통과(requireMembershipRole + canManageRoles). */
export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [{ message }, currentMembership, pendingUsers, managedMembers] = await Promise.all([
    searchParams,
    requireMembershipRole(["super_admin"]),
    getPendingMemberships(),
    getApprovedMemberships(),
  ]);

  return (
    <>
      <GlobalNav membership={currentMembership} active="admin" />

      <main className="min-h-screen bg-slate-50 py-24 text-slate-800">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 md:px-12 lg:px-24">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Super Admin Control</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-800 sm:text-4xl">
                  회원 승인 및 권한 관리
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  승인 대기 인원과 운영 권한을 한 화면에서 빠르게 정리할 수 있도록 단순한 데이터 뷰로 재구성했습니다.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard
              label="승인 대기"
              value={`${pendingUsers.length}`}
              description="검토를 기다리는 계정"
            />
            <OverviewCard
              label="운영 인원"
              value={`${managedMembers.length}`}
              description="현재 접근 가능한 승인 인원"
            />
            <OverviewCard
              label="super_admin"
              value={`${managedMembers.filter((member) => member.role === "super_admin").length}`}
              description="전체 권한을 가진 관리자"
            />
            <OverviewCard
              label="admin / viewer"
              value={`${managedMembers.filter((member) => member.role !== "super_admin").length}`}
              description="일반 운영 인원"
            />
          </section>

          {message ? (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              {message}
            </div>
          ) : null}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Queue</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                  승인 대기 인원
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {pendingUsers.length ? (
                pendingUsers.map((member) => <PendingMemberCard key={member.user_id} member={member} />)
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  현재 승인 대기 중인 계정이 없습니다.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Role Directory</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-800">
                  현재 승인된 운영 인원
                </h2>
              </div>
            </div>

            {managedMembers.length ? (
              <div className="mt-5">
                <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(120px,0.5fr)_minmax(140px,0.6fr)_minmax(200px,0.8fr)] gap-4 border-b border-slate-200 px-4 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:grid">
                  <div>사용자</div>
                  <div>권한</div>
                  <div>등록일</div>
                  <div>권한 변경</div>
                </div>
                <div className="grid gap-3 md:gap-0">
                  {managedMembers.map((member) => (
                    <DirectoryRow
                      key={member.user_id}
                      member={member}
                      currentUserId={currentMembership.user_id}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                아직 승인된 운영 계정이 없습니다.
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
