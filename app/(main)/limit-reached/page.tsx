import Link from "next/link";

export default function LimitReachedPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-slate-900 items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="text-6xl">📦</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">저장 한도에 도달했어요</h1>
          <p className="text-slate-400 leading-relaxed">
            무료 플랜은 300개까지 저장할 수 있어요.<br />
            오래된 링크를 삭제하거나 나중에 다시 시도해주세요.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800/60 border border-slate-700/30 p-5 space-y-1 text-left">
          <p className="text-slate-300 text-sm font-medium">현재 상태</p>
          <p className="text-2xl font-bold text-white">300 / 300</p>
          <p className="text-slate-500 text-xs">무료 플랜 한도</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/home"
            className="flex items-center justify-center w-full rounded-2xl bg-sky-500 py-4 text-white font-bold hover:bg-sky-400 active:scale-95 transition-all"
          >
            내 링크 관리하기
          </Link>
          <Link
            href="/settings"
            className="flex items-center justify-center w-full rounded-2xl border border-slate-700 py-4 text-slate-400 text-sm hover:text-white hover:border-slate-600 transition-colors"
          >
            설정으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
