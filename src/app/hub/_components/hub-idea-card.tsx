"use client";

import Link from "next/link";
import type { IdeaItem, IdeaStatus } from "@/lib/mock-data";

type HubIdeaCardProps = {
  idea: IdeaItem;
};

function getStatusMeta(status: IdeaStatus | string): {
  label: string;
  color: string;
} {
  if (status === "INBOX") {
    return { label: "Inbox", color: "#5227FF" };
  }
  if (status === "DEV") {
    return { label: "En cours", color: "#22c55e" };
  }
  if (status === "ARCHIVE") {
    return { label: "Archives", color: "#64748b" };
  }
  return { label: String(status), color: "#6b7280" };
}

export function HubIdeaCard({ idea }: HubIdeaCardProps) {
  const label = idea.label;
  const end = label.indexOf("]");
  const tgi = end === -1 ? null : label.slice(0, end + 1);
  const title = end === -1 ? label : label.slice(end + 1).trim();

  const statusMeta = getStatusMeta(idea.status);
  const linksCount = idea.managerLinks?.length ?? 0;
  const hasRichContent = !!idea.managerContent?.trim() || linksCount > 0;

  return (
    <div className="rounded-2xl border border-zinc-900 bg-[#060010] px-5 py-4 text-[13px] text-zinc-100 shadow-[0_0_24px_rgba(0,0,0,0.6)] transition hover:border-zinc-700 hover:bg-[#090013]">
      <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          {tgi && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-200">
              {tgi}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px]"
            style={{ color: statusMeta.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: statusMeta.color }}
            />
            {statusMeta.label}
          </span>
          {linksCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">
              {linksCount} lien(s)
            </span>
          )}
          {hasRichContent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Enrichie
            </span>
          )}
        </div>
        <span className="text-zinc-500">ID interne&nbsp;: {idea.id}</span>
      </div>

      <Link
        href={`/idea/${idea.id}`}
        className="block text-[15px] font-medium text-zinc-50 hover:underline"
      >
        {title}
      </Link>

      {idea.managerContent && (
        <div className="mt-1 line-clamp-2 text-[12px] text-zinc-400">
          {idea.managerContent}
        </div>
      )}
    </div>
  );
}
