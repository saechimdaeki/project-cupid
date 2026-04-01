"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthContinuePage() {
  const [message, setMessage] = useState("로그인 상태를 확인하는 중입니다...");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function resolveAuth() {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
          window.location.replace("/dashboard");
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 220));
      }

      if (active) {
        setMessage("세션 확인이 지연되고 있습니다. 다시 로그인해주세요.");
      }
    }

    void resolveAuth();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="authWrap authPage">
      <section className="authLayout">
        <article className="authPanel">
          <p className="eyebrow">Auth Sync</p>
          <h1 className="authTitle">로그인 정보를 동기화하고 있습니다</h1>
          <p className="heroSubtitle">{message}</p>
        </article>
      </section>
    </main>
  );
}
