"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Folder from "@/components/ui/folder";
import type { IdeaStatus, IdeaItem, FolderConfig } from "@/lib/mock-data";

type AdminSidebarProps = {
  folders: FolderConfig[];
  ideas: IdeaItem[];
  activeStatus: IdeaStatus | string;
  changeStatusAction: (_: IdeaStatus | string) => void;
  renameFolderAction: (_: { id: string; label: string }) => void;
  changeFolderColorAction: (_: { id: string; color: string }) => void;
};

const PALETTE_COLORS = [
  "#5227FF",
  "#3b82f6",
  "#0ea5e9",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#6366f1",
  "#14b8a6",
  "#64748b",
];

export function AdminSidebar({
  folders,
  ideas,
  activeStatus,
  changeStatusAction,
  renameFolderAction,
  changeFolderColorAction,
}: AdminSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [colorMenuId, setColorMenuId] = useState<string | null>(null);

  const getCountForFolder = (folderId: string) =>
    ideas.filter((idea) => idea.status === folderId).length;

  const startEditing = (folder: FolderConfig) => {
    setEditingId(folder.id as string);
    setDraftLabel(folder.label);
    setColorMenuId(null);
  };

  const commitEditing = () => {
    if (!editingId) return;
    const trimmed = draftLabel.trim();
    if (trimmed) {
      renameFolderAction({ id: editingId, label: trimmed });
    }
    setEditingId(null);
  };

  const toggleColorMenu = (id: string) => {
    setColorMenuId((current) => (current === id ? null : id));
    setEditingId(null);
  };

  const handleColorChange = (id: string, color: string) => {
    changeFolderColorAction({ id, color });
    setColorMenuId(null);
  };

  return (
    <div className="col-span-2 border-r border-zinc-800/60">
      <div className="folders-scroll h-[calc(100vh-80px)] overflow-y-auto pt-10 pb-8">
        <div className="flex flex-col items-center gap-9">
          {folders.map((folder) => {
            const count = getCountForFolder(folder.id as string);
            const isActive = activeStatus === folder.id;
            const isEditing = editingId === folder.id;
            const showColorMenu = colorMenuId === folder.id;

            return (
              <div
                key={folder.id}
                className="relative flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => changeStatusAction(folder.id)}
                  className="relative"
                >
                  <Folder size={1.1} color={folder.color} active={isActive} />
                  {isActive && (
                    <motion.div
                      layoutId="folder-glow"
                      className="absolute inset-0 -z-10 rounded-full bg-[#5227FF]/25 blur-2xl"
                    />
                  )}
                </button>

                <div className="mt-3 flex flex-col items-center text-[11px] font-medium text-zinc-400">
                  {isEditing ? (
                    <input
                      value={draftLabel}
                      onChange={(e) => setDraftLabel(e.target.value)}
                      onBlur={commitEditing}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEditing();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="w-[120px] rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-center text-[11px] text-zinc-100 outline-none focus:border-[#5227FF]"
                    />
                  ) : (
                    <button
                      type="button"
                      className={`max-w-[120px] truncate ${
                        isActive ? "text-zinc-50" : "text-zinc-500"
                      }`}
                      onClick={() => startEditing(folder)}
                    >
                      {folder.label}
                    </button>
                  )}
                  <div className="mt-0.5 text-[10px] opacity-60">
                    {count} idée(s)
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleColorMenu(folder.id as string)}
                    className="mt-1 inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-200"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    Couleur
                  </button>

                  {showColorMenu && (
                    <div className="mt-2 rounded-2xl border border-zinc-800 bg-[#050509] px-2 py-2 text-[9px] text-zinc-400 shadow-xl">
                      <div className="mb-1 px-1 text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                        Palette
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {PALETTE_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              handleColorChange(folder.id as string, color)
                            }
                            className="h-4 w-4 rounded-full border border-zinc-800 hover:scale-110"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
