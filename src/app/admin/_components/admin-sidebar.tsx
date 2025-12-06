"use client";

import { motion } from "motion/react";
import Folder from "@/components/ui/folder";
import type { IdeaStatus, IdeaItem, FolderConfig } from "@/lib/mock-data";

type AdminSidebarProps = {
  folders: FolderConfig[];
  ideas: IdeaItem[];
  activeStatus: IdeaStatus | string;
  changeStatusAction: (_: IdeaStatus | string) => void;
};

export function AdminSidebar({
  folders,
  ideas,
  activeStatus,
  changeStatusAction,
}: AdminSidebarProps) {
  const getCountForFolder = (folderId: string) =>
    ideas.filter((idea) => idea.status === folderId).length;

  return (
    <div className="col-span-2 border-r border-zinc-900 pt-6">
      <div className="flex flex-col items-center gap-9">
        {folders.map((folder) => {
          const count = getCountForFolder(folder.id as string);
          const isActive = activeStatus === folder.id;

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
              <div className="mt-3 text-center text-[11px] font-medium text-zinc-400">
                <div className={isActive ? "text-zinc-50" : "text-zinc-500"}>
                  {folder.label}
                </div>
                <div className="mt-0.5 text-[10px] opacity-60">
                  {count} idée(s)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
