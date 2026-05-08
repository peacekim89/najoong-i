import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-900 px-6">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-slate-700">404</div>
        <p className="text-slate-400">페이지를 찾을 수 없어요</p>
        <Link
          href="/"
          className="inline-block mt-4 rounded-full bg-sky-500 px-6 py-2 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
