"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const supabase = createClient();

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <h1
            className="text-5xl tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--fw-logo)",
              color: "var(--color-text)",
            }}
          >
            나중이
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            저장만 해.<br />나머지는 내가 할게.
          </p>
        </div>

        {/* 데코 아이콘 */}
        <div className="flex justify-center gap-4 py-2">
          {["💾", "✨", "🔍"].map((e) => (
            <span
              key={e}
              className="flex h-12 w-12 items-center justify-center text-xl"
              style={{
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface-2)",
                border: "var(--border-card)",
              }}
            >
              {e}
            </span>
          ))}
        </div>

        {error && (
          <div
            className="px-4 py-3 text-sm text-red-500"
            style={{ borderRadius: "var(--radius-md)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            로그인에 실패했어요. 다시 시도해주세요.
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-3 bg-white px-6 py-4 text-slate-800 font-semibold text-base active:scale-95 transition-all duration-150"
          style={{
            borderRadius: "var(--radius-btn)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            border: "var(--border-card)",
          }}
        >
          <GoogleIcon />
          Google로 시작하기
        </button>

        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          계속하면 서비스 이용약관 및 개인정보처리방침에 동의합니다
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
