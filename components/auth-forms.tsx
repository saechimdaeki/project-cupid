import Link from "next/link";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth-actions";

type AuthFormsProps = {
  initialMessage?: string;
};

export function AuthForms({ initialMessage }: AuthFormsProps) {
  const message = initialMessage ?? "";

  return (
    <div className="authStack">
      <div className="authPanel">
        <p className="eyebrow">Sign Up</p>
        <h2 className="pageTitle">회원가입</h2>
        <p className="pageMeta">id, 이름, password만 입력하면 가입 요청이 생성됩니다.</p>

        {message ? <div className="notice">{message}</div> : null}

        <form className="authForm" action={signUpWithPassword}>
          <label>
            id
            <input
              name="username"
              placeholder="junseong"
              required
              minLength={4}
              maxLength={20}
              pattern="[a-z0-9._-]{4,20}"
            />
          </label>
          <label>
            이름
            <input name="fullName" placeholder="김준성" required minLength={2} />
          </label>
          <label>
            password
            <input name="password" type="password" placeholder="6자 이상" required minLength={6} />
          </label>
          <button className="primaryButton" type="submit">
            가입 요청하기
          </button>
        </form>
      </div>

      <div className="authPanel">
        <p className="eyebrow">Sign In</p>
        <h2 className="pageTitle">로그인</h2>
        <p className="pageMeta">승인된 계정만 보드에 들어갈 수 있습니다.</p>

        <form className="authForm" action={signInWithPassword}>
          <label>
            id
            <input
              name="username"
              placeholder="junseong"
              required
              minLength={4}
              maxLength={20}
              pattern="[a-z0-9._-]{4,20}"
            />
          </label>
          <label>
            password
            <input name="password" type="password" placeholder="비밀번호 입력" required />
          </label>
          <button className="primaryButton" type="submit">
            로그인
          </button>
        </form>

        <div className="heroActions">
          <Link className="ghostButton" href="/">
            랜딩으로 돌아가기
          </Link>
          <Link className="ghostButton" href="/pending">
            승인 대기 페이지
          </Link>
        </div>
      </div>

      <div className="sectionBlock authHint">
        가입 후 `cupid_memberships`에 `username + full_name + pending`으로 들어가고,
        슈퍼어드민이 `viewer` 또는 `admin` 권한을 승인하면 보드 접근이 열립니다.
      </div>
    </div>
  );
}
