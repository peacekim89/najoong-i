"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "홈",
    icon: (sw: number) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="theme-icon" style={{ strokeWidth: sw }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "검색",
    icon: (sw: number) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="theme-icon" style={{ strokeWidth: sw }}>
        <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: "/category",
    label: "분류",
    icon: (sw: number) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="theme-icon" style={{ strokeWidth: sw }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 11h16M4 16h16" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "설정",
    icon: (sw: number) => (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="theme-icon" style={{ strokeWidth: sw }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-theme-surface/95 backdrop-blur-lg safe-bottom"
      style={{ borderTop: "var(--nav-border)" }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        {/* FAB — 중앙 저장 버튼 */}
        <button
          className="flex flex-col items-center gap-0.5 px-2 py-1"
          onClick={() => window.dispatchEvent(new CustomEvent("nachungi:open-save"))}
        >
          <div
            className="flex h-11 w-11 -mt-4 items-center justify-center"
            style={{
              background: "var(--btn-bg)",
              borderRadius: "var(--radius-fab)",
              boxShadow: "var(--shadow-fab)",
              border: "var(--border-fab, none)",
            }}
          >
            <svg width="18" height="18" fill="none" stroke="var(--btn-fg)" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
              <path d="M12 4v16M4 12h16" />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-theme-muted">저장</span>
        </button>

        {NAV_ITEMS.slice(2).map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({ item, active }: { item: typeof NAV_ITEMS[0]; active: boolean }) {
  const sw = active ? Number("var(--icon-stroke)".replace("var(--icon-stroke)", "2")) : 1.75;
  return (
    <Link
      href={item.href}
      className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors"
      style={{ color: active ? "var(--color-accent)" : "var(--color-text-muted)" }}
    >
      {item.icon(active ? 2.2 : 1.75)}
      <span className="text-[10px] font-medium" style={{ fontFamily: "var(--font-body)" }}>
        {item.label}
      </span>
    </Link>
  );
}
