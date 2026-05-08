"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SaveModal() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setUrl("");
      setStatus("idle");
      setTimeout(() => inputRef.current?.focus(), 100);
    };
    window.addEventListener("nachungi:open-save", handler);
    return () => window.removeEventListener("nachungi:open-save", handler);
  }, []);

  useEffect(() => {
    const sharedUrl = sessionStorage.getItem("nachungi:share-url");
    if (sharedUrl) {
      sessionStorage.removeItem("nachungi:share-url");
      sessionStorage.removeItem("nachungi:share-title");
      setUrl(sharedUrl);
      setOpen(true);
      setStatus("idle");
    }
  }, []);

  async function handleSave() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(res.status === 409 ? "이미 저장된 링크예요" : (data.error ?? "저장 실패"));
        return;
      }
      setStatus("done");
      setTimeout(() => { setOpen(false); router.refresh(); }, 1200);
    } catch {
      setStatus("error");
      setErrorMsg("네트워크 오류");
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      inputRef.current?.focus();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div
        className="relative w-full max-w-lg p-6 space-y-4 shadow-2xl"
        style={{
          background: "var(--color-surface)",
          border: "var(--border-card)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        }}
      >
        {/* 핸들 바 */}
        <div className="flex justify-center -mt-1 mb-1">
          <div className="w-8 h-1 rounded-full" style={{ background: "var(--color-border)" }} />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg" style={{ color: "var(--color-text)", fontFamily: "var(--font-display)", fontWeight: "var(--fw-title)" }}>
            링크 저장
          </h2>
          <button onClick={() => setOpen(false)} style={{ color: "var(--color-text-muted)" }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div
              className="h-14 w-14 flex items-center justify-center"
              style={{
                borderRadius: "var(--radius-fab)",
                background: "color-mix(in srgb, var(--color-accent) 15%, transparent)",
              }}
            >
              <svg width="28" height="28" fill="none" stroke="var(--color-accent)" viewBox="0 0 24 24" style={{ strokeWidth: "var(--icon-stroke)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>저장됐어요!</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>AI가 분석 중이에요</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <input
                ref={inputRef}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="URL을 붙여넣기 하세요"
                disabled={status === "loading"}
                className="w-full px-4 py-3.5 pr-20 text-sm focus:outline-none transition-colors"
                style={{
                  borderRadius: "var(--radius-md)",
                  border: "var(--border-card)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                }}
              />
              <button
                onClick={handlePaste}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                style={{ color: "var(--color-accent)" }}
              >
                붙여넣기
              </button>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500">{errorMsg}</p>
            )}

            <button
              onClick={handleSave}
              disabled={!url.trim() || status === "loading"}
              className="w-full py-3.5 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] theme-btn-primary"
              style={{
                background: "var(--btn-bg)",
                color: "var(--btn-fg)",
                borderRadius: "var(--radius-btn)",
                fontFamily: "var(--font-display)",
                fontWeight: "var(--fw-title)",
              }}
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  AI가 분석 중...
                </span>
              ) : "저장하기"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
