"use client";

import { useMemo, useState } from "react";
import {
  BASE_FOLDERS,
  INITIAL_IDEAS,
  type IdeaStatus,
  type IdeaItem,
  type FolderConfig,
} from "@/lib/mock-data";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminIdeaList } from "./_components/admin-idea-list";
import { AdminIdeaPanel } from "./_components/admin-idea-panel";

type SelectedIdea = {
  status: IdeaStatus | string;
  index: number;
  label: string;
  id: string;
};

function generateFolderId(existing: FolderConfig[]): string {
  let i = 1;
  while (true) {
    const candidate = `CUSTOM_${i}`;
    if (!existing.some((f) => f.id === candidate)) return candidate;
    i += 1;
  }
}

function generateIdeaId(existing: IdeaItem[]): string {
  let i = existing.length + 1;
  while (existing.some((idea) => idea.id === String(i))) {
    i += 1;
  }
  return String(i);
}

export default function AdminPage() {
  const [folders, setFolders] = useState<FolderConfig[]>(BASE_FOLDERS);
  const [ideas, setIdeas] = useState<IdeaItem[]>(INITIAL_IDEAS);
  const [activeStatus, setActiveStatus] = useState<IdeaStatus | string>(
    "INBOX",
  );
  const [selected, setSelected] = useState<SelectedIdea | null>(null);

  const filteredIdeas = useMemo(
    () => ideas.filter((idea) => idea.status === activeStatus),
    [ideas, activeStatus],
  );

  const totalIdeas = ideas.length;
  const inboxCount = ideas.filter((i) => i.status === "INBOX").length;
  const devCount = ideas.filter((i) => i.status === "DEV").length;
  const archiveCount = ideas.filter((i) => i.status === "ARCHIVE").length;

  const handleChangeStatus = (status: IdeaStatus | string) => {
    setActiveStatus(status);
    setSelected(null);
  };

  const handleSelectIdea = (payload: { item: string; index: number }) => {
    const item = filteredIdeas[payload.index];
    if (!item) return;
    setSelected({
      status: item.status,
      index: payload.index,
      label: item.label,
      id: item.id,
    });
  };

  const handleAddIdea = (payload: {
    label: string;
    status: IdeaStatus | string;
  }) => {
    const newId = generateIdeaId(ideas);
    const idea: IdeaItem = {
      id: newId,
      status: payload.status,
      label: payload.label,
      managerSummary: "",
      managerContent: "",
      managerLinks: [],
      managerBullets: [],
      managerNote: "",
    };
    setIdeas((prev) => [...prev, idea]);
  };

  const handleAddFolder = () => {
    const newId = generateFolderId(folders);
    const folder: FolderConfig = {
      id: newId,
      label: `Espace ${folders.length + 1}`,
      color: "#22c55e",
    };
    setFolders((prev) => [...prev, folder]);
    setActiveStatus(newId);
    setSelected(null);
  };

  const handleRenameFolder = (id: string, label: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)));
  };

  const handleChangeFolderColor = (id: string, color: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, color } : f)));
  };

  const handleUpdateIdeaDetails = (payload: {
    id: string;
    managerSummary: string;
    managerContent: string;
    managerLinks: IdeaItem["managerLinks"];
    managerBullets: IdeaItem["managerBullets"];
    managerNote: string;
  }) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === payload.id
          ? {
              ...idea,
              managerSummary: payload.managerSummary,
              managerContent: payload.managerContent,
              managerLinks: payload.managerLinks,
              managerBullets: payload.managerBullets,
              managerNote: payload.managerNote,
            }
          : idea,
      ),
    );
  };

  const handleClearSelection = () => {
    setSelected(null);
  };

  const selectedIdeaData =
    selected && selected.status === activeStatus
      ? ideas.find((i) => i.id === selected.id) || null
      : null;

  return (
    <div className="min-h-screen bg-[#050509] px-8 py-10 text-white">
      <AdminHeader
        totalIdeas={totalIdeas}
        inboxCount={inboxCount}
        devCount={devCount}
        archiveCount={archiveCount}
      />

      <div className="mt-6 grid h-[calc(100vh-160px)] grid-cols-12 gap-8">
        <AdminSidebar
          folders={folders}
          ideas={ideas}
          activeStatus={activeStatus}
          changeStatusAction={handleChangeStatus}
          renameFolderAction={({ id, label }) => handleRenameFolder(id, label)}
          changeFolderColorAction={({ id, color }) =>
            handleChangeFolderColor(id, color)
          }
        />
        <AdminIdeaList
          activeStatus={activeStatus}
          folders={folders}
          items={filteredIdeas}
          selectAction={handleSelectIdea}
          addIdeaAction={handleAddIdea}
          addFolderAction={handleAddFolder}
        />
        <div className="col-span-5 h-full overflow-y-auto">
          <AdminIdeaPanel
            selected={selected}
            activeStatus={activeStatus as IdeaStatus}
            managerSummary={selectedIdeaData?.managerSummary ?? ""}
            managerContent={selectedIdeaData?.managerContent ?? ""}
            managerLinks={selectedIdeaData?.managerLinks ?? []}
            managerBullets={selectedIdeaData?.managerBullets ?? []}
            managerNote={selectedIdeaData?.managerNote ?? ""}
            updateIdeaDetailsAction={handleUpdateIdeaDetails}
            clearSelectionAction={handleClearSelection}
          />
        </div>
      </div>
    </div>
  );
}
