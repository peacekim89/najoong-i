"use client";

const CATEGORIES = [
  "전체", "영상", "레시피", "여행", "쇼핑", "뉴스",
  "개발", "디자인", "비즈니스", "건강", "교육", "엔터테인먼트", "기타",
];

interface Props {
  selected: string;
  onChange: (cat: string) => void;
}

export default function CategoryTabs({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`theme-chip flex-shrink-0 text-xs font-medium transition-all duration-150 whitespace-nowrap px-3.5 py-1.5 ${isActive ? "chip-active" : ""}`}
            style={{
              borderRadius: "var(--radius-chip)",
              border: isActive ? "none" : "1.5px solid var(--color-border)",
              background: isActive ? "var(--color-accent)" : "var(--color-surface)",
              color: isActive ? "var(--btn-fg)" : "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              fontWeight: isActive ? "var(--fw-title)" : 500,
              boxShadow: isActive ? "var(--shadow-fab)" : "none",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
