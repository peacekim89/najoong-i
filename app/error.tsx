"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-900 px-6">
      <div className="text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-slate-400">문제가 발생했어요</p>
        <button
          onClick={reset}
          className="inline-block mt-4 rounded-full bg-sky-500 px-6 py-2 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
