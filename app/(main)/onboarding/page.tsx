"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dispatchTheme, type ThemeId } from "@/components/ThemeProvider";

const THEME_OPTIONS: { id: ThemeId; emoji: string; label: string; sub: string; swatch: string[] }[] = [
  { id: "roze",     emoji: "🌸", label: "Rosé Journal",    sub: "감성적",    swatch: ["#fdf6f9", "#f472b6", "#e879f9"] },
  { id: "midnight", emoji: "🌙", label: "Midnight Focus",  sub: "집중형",    swatch: ["#08080f", "#818cf8", "#38bdf8"] },
  { id: "workday",  emoji: "💼", label: "Workday Minimal", sub: "깔끔한",    swatch: ["#f9fafb", "#2563eb", "#1e40af"] },
  { id: "campus",   emoji: "🎒", label: "Campus Fresh",    sub: "활기찬",    swatch: ["#fffef5", "#16a34a", "#facc15"] },
];

const STEPS = [
  {
    emoji: "📎",
    title: "저장만 해",
    desc: "유튜브, 인스타, 어느 링크든\nURL을 붙여넣으면 끝이에요",
  },
  {
    emoji: "🤖",
    title: "AI가 다 해줘",
    desc: "요약 2줄, 태그 3개, 카테고리까지\n자동으로 정리해드려요",
  },
  {
    emoji: "🔍",
    title: "흐릿해도 찾아줘",
    desc: "\"지난달에 본 파스타 레시피\"\n이렇게 검색해도 찾아드려요",
  },
  {
    emoji: "📱",
    title: "어디서든 1초 저장",
    desc: "Android에서 공유 버튼,\n크롬 확장으로 1클릭 저장",
  },
];

const TOTAL = STEPS.length + 1; // theme picker is step 0

export default function OnboardingPage() {
  const [step, setStep] = useState(0); // 0 = theme picker, 1~4 = feature slides
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("roze");
  const router = useRouter();

  function finish() {
    dispatchTheme(selectedTheme);
    localStorage.setItem("nachungi:onboarded", "1");
    router.replace("/home");
  }

  function handleThemePick(id: ThemeId) {
    setSelectedTheme(id);
    dispatchTheme(id);
  }

  const isThemeStep = step === 0;
  const featureStep = step - 1;
  const s = isThemeStep ? null : STEPS[featureStep];

  return (
    <div className="flex flex-col min-h-dvh px-6" style={{ background: "var(--color-bg)" }}>
      {/* 스킵 */}
      <div className="flex justify-end pt-6 pb-2">
        <button
          onClick={finish}
          className="text-sm transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          건너뛰기
        </button>
      </div>

      {/* 슬라이드 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {isThemeStep ? (
          /* 테마 선택 */
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <h2
                className="text-2xl"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--fw-logo)",
                }}
              >
                나만의 테마 고르기
              </h2>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>언제든 설정에서 바꿀 수 있어요</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map((t) => {
                const isActive = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemePick(t.id)}
                    className="p-4 text-left space-y-3 transition-all active:scale-[0.97]"
                    style={{
                      borderRadius: "var(--radius-md)",
                      background: isActive
                        ? "color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))"
                        : "var(--color-surface)",
                      border: isActive ? `2px solid var(--color-accent)` : "var(--border-card)",
                      boxShadow: isActive ? "var(--shadow-fab)" : "var(--shadow-card)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{t.emoji}</span>
                      <div className="flex gap-1">
                        {t.swatch.map((c) => (
                          <div key={c} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{t.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* 기능 슬라이드 */
          <div className="space-y-8">
            <div
              className="w-40 h-40 mx-auto flex items-center justify-center text-7xl"
              style={{
                borderRadius: "var(--radius-lg)",
                background: "color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))",
                border: "var(--border-card)",
              }}
            >
              {s!.emoji}
            </div>
            <div className="space-y-3">
              <h2
                className="text-2xl"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-display)",
                  fontWeight: "var(--fw-logo)",
                }}
              >
                {s!.title}
              </h2>
              <p
                className="text-base leading-relaxed whitespace-pre-line"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
              >
                {s!.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 도트 인디케이터 */}
      <div className="flex justify-center gap-2 pb-6">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? "24px" : "8px",
              height: "8px",
              background: i === step ? "var(--color-accent)" : "var(--color-surface-2)",
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="pb-12 space-y-3">
        {step < TOTAL - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full py-4 font-bold text-base active:scale-95 transition-all"
            style={{
              borderRadius: "var(--radius-btn)",
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--fw-title)",
            }}
          >
            다음
          </button>
        ) : (
          <button
            onClick={finish}
            className="w-full py-4 font-bold text-base active:scale-95 transition-all"
            style={{
              borderRadius: "var(--radius-btn)",
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--fw-title)",
              boxShadow: "var(--shadow-fab)",
            }}
          >
            시작하기 🚀
          </button>
        )}
      </div>
    </div>
  );
}
