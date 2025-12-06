"use client";

import { motion } from "motion/react";
import Folder from "@/components/ui/folder";
import { FOLDERS, type IdeaStatus } from "@/lib/mock-data";

type AdminSidebarProps = {
  activeStatus: IdeaStatus;
  changeStatusAction: (_: IdeaStatus) => void;
};

export function AdminSidebar({
  activeStatus,
  changeStatusAction,
}: AdminSidebarProps) {
  return (
    <div className="col-span-2 border-r border-zinc-900 pt-6">
      <div className="flex flex-col items-center gap-9">
        {FOLDERS.map((folder) => (
          <div key={folder.id} className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => changeStatusAction(folder.id)}
              className="relative"
            >
              <Folder
                size={1.1}
                color={activeStatus === folder.id ? folder.color : "#27272a"}
              />
              {activeStatus === folder.id && (
                <motion.div
                  layoutId="folder-glow"
                  className="absolute inset-0 -z-10 rounded-full bg-[#5227FF]/25 blur-2xl"
                />
              )}
            </button>
            <div className="mt-3 text-center text-[11px] font-medium text-zinc-400">
              <div
                className={
                  activeStatus === folder.id ? "text-zinc-50" : "text-zinc-500"
                }
              >
                {folder.label}
              </div>
              <div className="mt-0.5 text-[10px] opacity-60">
                {folder.count} idée(s)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
