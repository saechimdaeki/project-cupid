import Link from "next/link";
import { AuthForms } from "@/components/auth-forms";

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="authWrap authPage">
      <div className="authHeart heartOne">♥</div>
      <div className="authHeart heartTwo">♥</div>
      <div className="authHeart heartThree">♥</div>
      <section className="authLayout">
        <div className="heroCard authShowcase">
          <p className="eyebrow">Trusted Match Network</p>
          <h1 className="authTitle">신뢰하는 사람만 승인받고 입장합니다</h1>
          <p className="heroSubtitle">
            id와 password로 가입하고, 슈퍼어드민이 그 id를 승인하면
            그때부터 보드 접근이 열립니다.
          </p>

          <div className="heroStats">
            <div className="statTile">
              <p className="eyebrow">Step 1</p>
              <strong>아이디 가입</strong>
              <span>아이디, 이름, 비밀번호만 입력</span>
            </div>
            <div className="statTile">
              <p className="eyebrow">Step 2</p>
              <strong>승인 대기</strong>
              <span>pending 상태로 등록</span>
            </div>
            <div className="statTile">
              <p className="eyebrow">Step 3</p>
              <strong>보드 입장</strong>
              <span>승인 후 대시보드 열람</span>
            </div>
          </div>
        </div>

        <AuthForms initialMessage={message} />
      </section>
    </main>
  );
}
