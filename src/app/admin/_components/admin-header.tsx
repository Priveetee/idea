"use client";

type AdminHeaderProps = {
  totalIdeas: number;
  inboxCount: number;
  devCount: number;
  archiveCount: number;
};

export function AdminHeader({
  totalIdeas,
  inboxCount,
  devCount,
  archiveCount,
}: AdminHeaderProps) {
  return (
    <header className="mb-10 flex items-end justify-between">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">
          Idea
          <span className="text-[#5227FF]">.admin</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Vue manager · Tri et qualification des idées issues des liens TGI
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right text-xs text-zinc-500">
          <div>
            Total idées:{" "}
            <span className="font-semibold text-zinc-200">{totalIdeas}</span>
          </div>
          <div className="mt-0.5">
            Inbox:{" "}
            <span className="font-semibold text-zinc-200">{inboxCount}</span> ·
            Dev:{" "}
            <span className="font-semibold text-emerald-400">{devCount}</span> ·
            Archives:{" "}
            <span className="font-semibold text-zinc-400">{archiveCount}</span>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
        >
          Rafraîchir le flux
        </button>
      </div>
    </header>
  );
}
