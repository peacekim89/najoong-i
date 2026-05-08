import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/types";

const CATEGORY_BG: Record<string, string> = {
  영상:        "rgba(239,68,68,0.12)",
  레시피:      "rgba(249,115,22,0.12)",
  여행:        "rgba(16,185,129,0.12)",
  쇼핑:        "rgba(236,72,153,0.12)",
  뉴스:        "rgba(59,130,246,0.12)",
  개발:        "rgba(139,92,246,0.12)",
  디자인:      "rgba(217,70,239,0.12)",
  비즈니스:    "rgba(245,158,11,0.12)",
  건강:        "rgba(20,184,166,0.12)",
  교육:        "rgba(6,182,212,0.12)",
  엔터테인먼트:"rgba(244,63,94,0.12)",
  기타:        "rgba(100,116,139,0.12)",
};
const CATEGORY_FG: Record<string, string> = {
  영상:        "#f87171",
  레시피:      "#fb923c",
  여행:        "#34d399",
  쇼핑:        "#f472b6",
  뉴스:        "#60a5fa",
  개발:        "#a78bfa",
  디자인:      "#e879f9",
  비즈니스:    "#fbbf24",
  건강:        "#2dd4bf",
  교육:        "#22d3ee",
  엔터테인먼트:"#fb7185",
  기타:        "#94a3b8",
};

interface Props {
  item: Item;
  matchReason?: string;
}

export default function ItemCard({ item, matchReason }: Props) {
  const catBg = CATEGORY_BG[item.category] ?? CATEGORY_BG["기타"];
  const catFg = CATEGORY_FG[item.category] ?? CATEGORY_FG["기타"];

  const domain = (() => {
    try { return new URL(item.original_url).hostname.replace("www.", ""); } catch { return ""; }
  })();

  return (
    <Link href={`/items/${item.id}`} className="block group">
      <article
        className="overflow-hidden transition-all duration-200 active:scale-[0.98]"
        style={{
          background: "var(--color-surface)",
          border: "var(--border-card)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {item.thumbnail_url && (
          <div className="relative h-40 w-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
            <Image
              src={item.thumbnail_url}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
          </div>
        )}

        <div className="p-4 space-y-2.5">
          {/* 카테고리 + 도메인 */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2.5 py-0.5"
              style={{
                borderRadius: "var(--radius-chip)",
                background: catBg,
                color: catFg,
                fontFamily: "var(--font-body)",
              }}
            >
              {item.category}
            </span>
            {domain && (
              <span className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                {domain}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h3
            className="text-sm leading-snug line-clamp-2"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--fw-title)",
            }}
          >
            {item.title}
          </h3>

          {/* 요약 */}
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--color-text-muted)" }}>
            {item.summary}
          </p>

          {/* 매칭 이유 */}
          {matchReason && (
            <div
              className="theme-match-reason flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
              style={{
                borderRadius: "var(--radius-sm)",
                background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
                color: "var(--color-accent-deep)",
              }}
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)", flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {matchReason}
            </div>
          )}

          {/* 태그 */}
          {item.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {item.tags.map((tag) => (
                <span key={tag} className="text-xs" style={{ color: "var(--color-tag)", fontFamily: "var(--font-body)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
