"use client";

import { useState } from "react";
import { FaPlus, FaLink } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";
import type { AdminIdeaLink } from "../use-admin-ideas";
import { getIconForUrl } from "@/lib/link-icons";

type IdeaLinksEditorProps = {
  links: AdminIdeaLink[];
  onChange: (_: AdminIdeaLink[]) => void;
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function IdeaLinksEditor({ links, onChange }: IdeaLinksEditorProps) {
  const [draftLabel, setDraftLabel] = useState("");
  const [draftUrl, setDraftUrl] = useState("");

  const handleAdd = () => {
    const label = draftLabel.trim();
    const url = draftUrl.trim();
    if (!url) return;
    onChange([
      ...links,
      {
        id: genId("link"),
        label: label || url,
        url,
      },
    ]);
    setDraftLabel("");
    setDraftUrl("");
  };

  const handleRemove = (id: string) => {
    onChange(links.filter((l) => l.id !== id));
  };

  return (
    <div className="rounded-2xl border border-zinc-900 bg-[#050012] px-4 py-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Liens
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-zinc-900 bg-[#030011] p-3">
        <div className="flex items-center gap-2">
          <FaLink className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 focus:border-[#5227FF] focus:outline-none"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder="Label du lien (Notion spec, Loom démo, GitHub, etc.)"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100 focus:border-[#5227FF] focus:outline-none"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            placeholder="https://..."
          />
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1 rounded-full bg-[#5227FF] px-3 py-1 text-[11px] font-medium text-white transition hover:bg-[#3f21c9]"
          >
            <FaPlus className="h-3 w-3" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {links.map((link) => {
          const Icon = getIconForUrl(link.url);
          return (
            <div
              key={link.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center gap-2 text-xs text-zinc-100 hover:text-white"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900">
                  <Icon className="h-3.5 w-3.5 text-zinc-200" />
                </div>
                <div className="flex flex-col">
                  <span className="truncate">{link.label}</span>
                  <span className="truncate text-[10px] text-zinc-500">
                    {link.url}
                  </span>
                </div>
                <FiExternalLink className="ml-auto h-3 w-3 text-zinc-500" />
              </a>
              <button
                type="button"
                onClick={() => handleRemove(link.id)}
                className="rounded-full px-2 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
              >
                ×
              </button>
            </div>
          );
        })}
        {links.length === 0 && (
          <div className="text-[11px] text-zinc-500">
            Aucun lien pour l&apos;instant. Ajoute Notion, Figma, GitHub, Loom,
            etc.
          </div>
        )}
      </div>
    </div>
  );
}
