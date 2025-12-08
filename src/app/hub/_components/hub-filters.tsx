"use client";

type HubFiltersProps = {
  status: "ALL" | "INBOX" | "DEV" | "ARCHIVE";
  onStatusChange: (_status: "ALL" | "INBOX" | "DEV" | "ARCHIVE") => void;
  query: string;
  onQueryChange: (_value: string) => void;
};

const STATUS_LABEL: Record<HubFiltersProps["status"], string> = {
  ALL: "Toutes",
  INBOX: "Inbox",
  DEV: "En cours",
  ARCHIVE: "Archives",
};

export function HubFilters({
  status,
  onStatusChange,
  query,
  onQueryChange,
}: HubFiltersProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4 text-[11px] text-zinc-400">
      <div className="inline-flex gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-1">
        {(
          ["ALL", "INBOX", "DEV", "ARCHIVE"] as HubFiltersProps["status"][]
        ).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={`rounded-full px-3 py-1 ${
              status === value
                ? "bg-[#5227FF] text-zinc-50"
                : "text-zinc-400 hover:bg-zinc-900"
            }`}
          >
            {STATUS_LABEL[value]}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Filtrer par titre ou TGI..."
        className="h-8 w-60 rounded-full border border-zinc-700 bg-zinc-950 px-3 text-[11px] text-zinc-100 outline-none focus:border-[#5227FF]"
      />
    </div>
  );
}
