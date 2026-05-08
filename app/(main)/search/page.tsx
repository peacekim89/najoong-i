"use client";

import { useState, useRef, useTransition } from "react";
import ItemCard from "@/components/ui/ItemCard";
import type { SearchResult } from "@/types";

const SUGGESTIONS = [
  "지난주에 본 맛있는 파스타 레시피",
  "리액트 최신 트렌드",
  "발리 여행 계획",
  "다이어트 운동법",
  "요즘 핫한 AI 툴",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(q?: string) {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;

    setSearched(true);
    startTransition(async () => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    });
  }

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      {/* 검색 헤더 */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-3 backdrop-blur-lg"
        style={{ background: "var(--color-bg-blur, var(--color-bg))", borderBottom: "var(--nav-border)" }}
      >
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: "var(--color-text-muted)", strokeWidth: "var(--icon-stroke)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="흐릿하게 기억해도 찾아드려요"
              className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors"
              style={{
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface)",
                border: "var(--border-card)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
              }}
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults(null); setSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-muted)" }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {query && (
            <button
              onClick={() => handleSearch()}
              disabled={isPending}
              className="px-4 py-3 text-sm font-semibold disabled:opacity-60 transition-colors"
              style={{
                borderRadius: "var(--radius-btn)",
                background: "var(--btn-bg)",
                color: "var(--btn-fg)",
                fontFamily: "var(--font-body)",
              }}
            >
              검색
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 검색 전: 추천 검색어 */}
        {!searched && (
          <div className="space-y-3">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}
            >
              이런 식으로 검색해보세요
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); handleSearch(s); }}
                  className="flex items-center gap-3 px-4 py-3 text-left active:scale-[0.99] transition-transform"
                  style={{
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-surface)",
                    border: "var(--border-card)",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)", color: "var(--color-accent)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 로딩 */}
        {isPending && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div
              className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>AI가 검색하는 중...</p>
          </div>
        )}

        {/* 결과 */}
        {!isPending && results !== null && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text)", fontWeight: "var(--fw-title)" }}>"{query}"</span> 검색 결과 {results.length}개
              </p>
            </div>

            {results.length === 0 ? (
              <NoResults query={query} />
            ) : (
              <div className="space-y-3">
                {results.map(({ item, match_reason }) => (
                  <ItemCard
                    key={item.id}
                    item={item as Parameters<typeof ItemCard>[0]["item"]}
                    matchReason={match_reason}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center py-16 text-center space-y-3">
      <div className="text-5xl">🔍</div>
      <p className="font-medium" style={{ color: "var(--color-text)" }}>"{query}"에 대한 결과가 없어요</p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        저장된 링크가 적거나<br />다른 표현으로 검색해보세요
      </p>
    </div>
  );
}
