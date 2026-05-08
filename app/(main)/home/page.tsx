"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ItemCard from "@/components/ui/ItemCard";
import CategoryTabs from "@/components/ui/CategoryTabs";
import SaveModal from "@/components/ui/SaveModal";
import type { Item } from "@/types";

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [category, setCategory] = useState("전체");

  // 첫 방문 → 온보딩
  useEffect(() => {
    if (!localStorage.getItem("nachungi:onboarded")) {
      window.location.replace("/onboarding");
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(async (cat: string, cur: string | null, reset = false) => {
    setLoading(true);
    const params = new URLSearchParams({ category: cat });
    if (cur) params.set("cursor", cur);

    const res = await fetch(`/api/items?${params}`);
    const data = await res.json();

    if (res.ok) {
      setItems((prev) => reset ? data.items : [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setCursor(data.items?.at(-1)?.created_at ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setItems([]);
    setCursor(null);
    fetchItems(category, null, true);
  }, [category, fetchItems]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current?.disconnect();
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          fetchItems(category, cursor);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [hasMore, loading, cursor, category, fetchItems]);

  return (
    <>
      <SaveModal />
      <div
        className="sticky top-0 z-10 backdrop-blur-lg"
        style={{ background: "var(--color-bg-blur, var(--color-bg))", borderBottom: "var(--nav-border)" }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1
            className="text-xl"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--fw-logo)",
            }}
          >
            나중이
          </h1>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("nachungi:open-save"))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold active:scale-95 transition-transform"
            style={{
              background: "var(--btn-bg)",
              color: "var(--btn-fg)",
              borderRadius: "var(--radius-btn)",
              fontFamily: "var(--font-body)",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            저장
          </button>
        </div>
        <CategoryTabs selected={category} onChange={setCategory} />
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading && items.length === 0 ? (
          <SkeletonList />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} />)
        )}

        <div ref={sentinelRef} className="h-4" />
        {loading && items.length > 0 && (
          <div className="flex justify-center py-4">
            <div
              className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </div>
    </>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden animate-pulse"
          style={{
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface)",
            border: "var(--border-card)",
          }}
        >
          <div className="h-40" style={{ background: "var(--color-surface-2)" }} />
          <div className="p-4 space-y-2.5">
            <div className="h-3 w-16 rounded" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-4 w-3/4 rounded" style={{ background: "var(--color-surface-2)" }} />
            <div className="h-3 w-full rounded" style={{ background: "var(--color-surface-2)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="text-5xl">📎</div>
      <p className="text-base font-medium" style={{ color: "var(--color-text)" }}>아직 저장된 링크가 없어요</p>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>URL을 붙여넣거나 공유해서 저장해보세요</p>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("nachungi:open-save"))}
        className="mt-2 px-5 py-2.5 text-sm font-semibold active:scale-95 transition-all"
        style={{
          background: "var(--btn-bg)",
          color: "var(--btn-fg)",
          borderRadius: "var(--radius-btn)",
          fontFamily: "var(--font-body)",
        }}
      >
        첫 링크 저장하기
      </button>
    </div>
  );
}
