"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme, dispatchTheme, type ThemeId } from "@/components/ThemeProvider";
import type { User } from "@supabase/supabase-js";

const FREE_LIMIT = 300;

const THEMES: { id: ThemeId; label: string; sub: string; swatch: string[] }[] = [
  { id: "roze", label: "Rosé Journal", sub: "여성스럽고 감성적", swatch: ["#fdf6f9", "#f472b6", "#e879f9"] },
  { id: "midnight", label: "Midnight Focus", sub: "다크 & 집중형", swatch: ["#08080f", "#818cf8", "#38bdf8"] },
  { id: "workday", label: "Workday Minimal", sub: "깔끔한 직장인용", swatch: ["#f9fafb", "#2563eb", "#1e40af"] },
  { id: "campus", label: "Campus Fresh", sub: "학생 & 활기찬", swatch: ["#fffef5", "#16a34a", "#facc15"] },
];

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [itemCount, setItemCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetch("/api/limits").then((r) => r.json()).then((d) => setItemCount(d.count ?? 0));
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const percent = Math.round((itemCount / FREE_LIMIT) * 100);

  return (
    <div className="min-h-dvh px-4 pt-6 pb-24 space-y-6" style={{ background: "var(--color-bg)" }}>
      <h1
        className="text-xl"
        style={{
          color: "var(--color-text)",
          fontFamily: "var(--font-display)",
          fontWeight: "var(--fw-logo)",
        }}
      >
        설정
      </h1>

      {/* 프로필 */}
      <div
        className="p-5 space-y-1"
        style={{
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface)",
          border: "var(--border-card)",
        }}
      >
        <p
          className="font-semibold"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)", fontWeight: "var(--fw-title)" }}
        >
          {user?.user_metadata?.full_name ?? "사용자"}
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{user?.email}</p>
      </div>

      {/* 사용량 */}
      <div
        className="p-5 space-y-3"
        style={{
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface)",
          border: "var(--border-card)",
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>저장된 링크</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{itemCount} / {FREE_LIMIT}</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percent, 100)}%`,
              background: percent >= 90 ? "#ef4444" : percent >= 70 ? "#f59e0b" : "var(--color-accent)",
            }}
          />
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>무료 플랜 • {FREE_LIMIT - itemCount}개 남음</p>
      </div>

      {/* 테마 선택 */}
      <div className="space-y-3">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--color-text)", fontFamily: "var(--font-display)", fontWeight: "var(--fw-title)" }}
        >
          테마
        </p>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => dispatchTheme(t.id)}
                className="p-4 text-left space-y-2.5 transition-all active:scale-[0.97]"
                style={{
                  borderRadius: "var(--radius-md)",
                  background: isActive ? "color-mix(in srgb, var(--color-accent) 10%, var(--color-surface))" : "var(--color-surface)",
                  border: isActive ? `2px solid var(--color-accent)` : "var(--border-card)",
                }}
              >
                {/* 스와치 */}
                <div className="flex gap-1.5">
                  {t.swatch.map((c) => (
                    <div key={c} className="h-4 w-4 rounded-full border border-black/10" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <p
                    className="text-xs font-semibold leading-tight"
                    style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                  >
                    {t.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{t.sub}</p>
                </div>
                {isActive && (
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    적용 중
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 앱 정보 */}
      <div
        style={{
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface)",
          border: "var(--border-card)",
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "var(--border-card)" }}
        >
          <span className="text-sm" style={{ color: "var(--color-text)" }}>버전</span>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>0.1.0</span>
        </div>
        <a
          href="mailto:feedback@nachungi.app"
          className="flex items-center justify-between px-5 py-4"
        >
          <span className="text-sm" style={{ color: "var(--color-text)" }}>피드백 보내기</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)", color: "var(--color-text-muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* 로그아웃 */}
      <button
        onClick={handleSignOut}
        className="w-full py-4 text-sm font-medium transition-colors"
        style={{
          borderRadius: "var(--radius-btn)",
          border: "1px solid rgba(239,68,68,0.3)",
          color: "#ef4444",
          background: "rgba(239,68,68,0.05)",
          fontFamily: "var(--font-body)",
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
