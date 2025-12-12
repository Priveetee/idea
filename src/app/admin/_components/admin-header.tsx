"use client";

type AdminHeaderProps = {
  totalIdeas: number;
  inboxCount: number;
  devCount: number;
  archiveCount: number;
  registrationsOpen: boolean;
  toggleRegistrations: () => void;
};

export function AdminHeader({
  totalIdeas,
  inboxCount,
  devCount,
  archiveCount,
  registrationsOpen,
  toggleRegistrations,
}: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-900 pb-4 text-sm text-zinc-200">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Idea.admin
        </div>
        <div className="mt-1 text-lg font-semibold text-zinc-50">
          Vue manager
        </div>
        <div className="mt-1 text-[11px] text-zinc-500">
          Total: {totalIdeas} · Inbox: {inboxCount} · Dev: {devCount} ·
          Archives: {archiveCount}
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span
          className={
            registrationsOpen
              ? "rounded-full bg-emerald-950/50 px-3 py-1 text-emerald-300"
              : "rounded-full bg-zinc-900 px-3 py-1 text-zinc-400"
          }
        >
          Inscriptions {registrationsOpen ? "ouvertes" : "fermées"}
        </span>
        <button
          type="button"
          onClick={toggleRegistrations}
          className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[11px] text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800"
        >
          {registrationsOpen
            ? "Fermer les inscriptions"
            : "Ouvrir les inscriptions"}
        </button>
      </div>
    </header>
  );
}
