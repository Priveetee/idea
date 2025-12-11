"use client";

type HubIdeaLink = {
  id: string;
  label: string;
  url: string;
};

type HubIdeaBullet = {
  id: string;
  text: string;
};

type HubIdeaItem = {
  id: string;
  label: string;
  status: string;
  managerSummary?: string;
  managerContent?: string;
  managerLinks?: HubIdeaLink[];
  managerBullets?: HubIdeaBullet[];
  managerNote?: string;
};

type HubIdeaHeaderBodyProps = {
  idea: HubIdeaItem;
  label: string;
  title: string;
  totalReactions: number;
};

export function HubIdeaHeaderBody({
  idea,
  label,
  title,
  totalReactions,
}: HubIdeaHeaderBodyProps) {
  const end = label.indexOf("]");
  const tgi = end === -1 ? null : label.slice(0, end + 1);

  return (
    <div className="px-8 pt-6 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            {tgi && (
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 font-mono text-[11px] text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                {tgi}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {idea.status === "INBOX" ? "Inbox" : idea.status}
            </span>
            {totalReactions > 0 && (
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-300">
                {totalReactions} réaction{totalReactions > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <h1 className="text-lg font-semibold leading-snug text-zinc-50">
            {title}
          </h1>
        </div>
      </div>
    </div>
  );
}
