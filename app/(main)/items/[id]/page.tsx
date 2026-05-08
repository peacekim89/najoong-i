"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { Item } from "@/types";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((r) => r.json())
      .then((d) => setItem(d.item))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("삭제할까요?")) return;
    setDeleting(true);
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    router.push("/home");
    router.refresh();
  }

  if (loading) return <LoadingSkeleton />;
  if (!item) return (
    <div className="flex items-center justify-center min-h-dvh" style={{ color: "var(--color-text-muted)" }}>
      찾을 수 없어요
    </div>
  );

  const domain = (() => {
    try { return new URL(item.original_url).hostname.replace("www.", ""); } catch { return ""; }
  })();

  return (
    <div className="min-h-dvh" style={{ background: "var(--color-bg)" }}>
      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 backdrop-blur-lg"
        style={{ background: "var(--color-bg-blur, var(--color-bg))", borderBottom: "var(--nav-border)" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          뒤로
        </button>
        <div className="flex items-center gap-3">
          <a
            href={item.original_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-400 disabled:opacity-40 transition-colors"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 썸네일 */}
      {item.thumbnail_url && (
        <div className="relative h-52 w-full" style={{ background: "var(--color-surface-2)" }}>
          <Image src={item.thumbnail_url} alt={item.title} fill className="object-cover" unoptimized />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, transparent 50%)" }} />
        </div>
      )}

      <div className="px-5 py-5 space-y-5">
        {/* 메타 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-3 py-1 text-xs font-semibold"
            style={{
              borderRadius: "var(--radius-chip)",
              background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
              color: "var(--color-accent)",
              fontFamily: "var(--font-body)",
            }}
          >
            {item.category}
          </span>
          {domain && <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{domain}</span>}
          <span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>
            {new Date(item.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>

        {/* 제목 */}
        <h1
          className="text-xl leading-snug"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-display)",
            fontWeight: "var(--fw-title)",
          }}
        >
          {item.title}
        </h1>

        {/* AI 요약 */}
        <div
          className="p-4 space-y-2"
          style={{
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface)",
            border: "var(--border-card)",
          }}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-accent)" }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI 요약
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
            {item.summary}
          </p>
        </div>

        {/* 태그 */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs"
                style={{
                  borderRadius: "var(--radius-chip)",
                  background: "var(--color-surface)",
                  border: "var(--border-card)",
                  color: "var(--color-tag)",
                  fontFamily: "var(--font-body)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 원본 링크 */}
        <a
          href={item.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold transition-colors"
          style={{
            borderRadius: "var(--radius-btn)",
            border: "var(--border-card)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          원본 링크 열기
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-dvh animate-pulse" style={{ background: "var(--color-bg)" }}>
      <div className="h-12" style={{ background: "var(--color-surface)", borderBottom: "var(--nav-border)" }} />
      <div className="h-52" style={{ background: "var(--color-surface-2)" }} />
      <div className="px-5 py-5 space-y-4">
        <div className="h-4 w-24 rounded" style={{ background: "var(--color-surface)" }} />
        <div className="h-7 w-3/4 rounded" style={{ background: "var(--color-surface)" }} />
        <div className="h-24 rounded" style={{ background: "var(--color-surface)", borderRadius: "var(--radius-md)" }} />
      </div>
    </div>
  );
}
