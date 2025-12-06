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
};

export function AdminSidebar({
  folders,
  ideas,
  activeStatus,
  changeStatusAction,
  renameFolderAction,
}: AdminSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");

  const getCountForFolder = (folderId: string) =>
    ideas.filter((idea) => idea.status === folderId).length;

  const startEditing = (folder: FolderConfig) => {
    setEditingId(folder.id as string);
    setDraftLabel(folder.label);
  };

  const commitEditing = () => {
    if (!editingId) return;
    const trimmed = draftLabel.trim();
    if (trimmed) {
      renameFolderAction({ id: editingId, label: trimmed });
    }
    setEditingId(null);
  };

  return (
    <div className="col-span-2 border-r border-zinc-800/60">
      <div className="folders-scroll h-[calc(100vh-80px)] overflow-y-auto pt-10 pb-8">
        <div className="flex flex-col items-center gap-9">
          {folders.map((folder) => {
            const count = getCountForFolder(folder.id as string);
            const isActive = activeStatus === folder.id;
            const isEditing = editingId === folder.id;

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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
