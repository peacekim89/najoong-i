"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

// Android PWA Web Share Target 수신 페이지
function SaveHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const url = searchParams.get("url") || searchParams.get("text") || "";
    const title = searchParams.get("title") || "";

    if (!url) {
      router.replace("/home");
      return;
    }

    // home으로 이동하면서 SaveModal을 자동으로 열기
    sessionStorage.setItem("nachungi:share-url", url);
    sessionStorage.setItem("nachungi:share-title", title);
    router.replace("/home");
  }, [searchParams, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">저장 준비 중...</p>
      </div>
    </div>
  );
}

export default function SavePage() {
  return (
    <Suspense>
      <SaveHandler />
    </Suspense>
  );
}
