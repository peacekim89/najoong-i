"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CATEGORIES = [
  { name: "영상",         emoji: "🎬", accent: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.25)" },
  { name: "레시피",       emoji: "🍳", accent: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.25)" },
  { name: "여행",         emoji: "✈️", accent: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.25)" },
  { name: "쇼핑",         emoji: "🛍️", accent: "rgba(236,72,153,0.15)",  border: "rgba(236,72,153,0.25)" },
  { name: "뉴스",         emoji: "📰", accent: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.25)" },
  { name: "개발",         emoji: "💻", accent: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.25)" },
  { name: "디자인",       emoji: "🎨", accent: "rgba(217,70,239,0.15)",  border: "rgba(217,70,239,0.25)" },
  { name: "비즈니스",     emoji: "💼", accent: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.25)" },
  { name: "건강",         emoji: "💪", accent: "rgba(20,184,166,0.15)",  border: "rgba(20,184,166,0.25)" },
  { name: "교육",         emoji: "📚", accent: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.25)" },
  { name: "엔터테인먼트", emoji: "🎮", accent: "rgba(244,63,94,0.15)",   border: "rgba(244,63,94,0.25)" },
  { name: "기타",         emoji: "📎", accent: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.25)" },
];

export default function CategoryPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/items/counts")
      .then((r) => r.json())
      .then((d) => setCounts(d.counts ?? {}));
  }, []);

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      <div className="px-4 pt-6 pb-2">
        <h1
          className="text-xl"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-display)",
            fontWeight: "var(--fw-logo)",
          }}
        >
          카테고리
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>AI가 자동으로 분류했어요</p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4 pb-24">
        {CATEGORIES.map(({ name, emoji, accent, border }) => {
          const count = counts[name] ?? 0;
          return (
            <Link
              key={name}
              href={`/home?category=${encodeURIComponent(name)}`}
              className="p-4 space-y-3 active:scale-95 transition-transform"
              style={{
                borderRadius: "var(--radius-md)",
                background: accent,
                border: `1px solid ${border}`,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <span className="text-3xl">{emoji}</span>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-display)",
                    fontWeight: "var(--fw-title)",
                  }}
                >
                  {name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{count}개</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
