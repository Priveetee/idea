"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminIdeaList } from "./_components/admin-idea-list";
import { AdminIdeaPanel } from "./_components/admin-idea-panel";
import {
  BASE_FOLDERS,
  INITIAL_IDEAS,
  type IdeaStatus,
  type IdeaItem,
  type FolderConfig,
} from "@/lib/mock-data";

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

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

  const handleReorderIdeas = (orderedIds: string[]) => {
    setIdeas((prev) => {
      const byId = new Map(prev.map((i) => [i.id, i]));
      const currentStatus = activeStatus;
      const inStatus = prev.filter((i) => i.status === currentStatus);
      const others = prev.filter((i) => i.status !== currentStatus);

      const orderedInStatus = orderedIds
        .map((id) => byId.get(id))
        .filter((idea): idea is IdeaItem => idea !== undefined)
        .filter((idea) => idea.status === currentStatus);

      if (orderedInStatus.length !== inStatus.length) return prev;

      return [...others, ...orderedInStatus];
    });
  };

  const handleMoveIdeaToFolder = (ideaId: string, targetFolderId: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, status: targetFolderId } : idea,
      ),
    );
    if (selected?.id === ideaId) setSelected(null);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith("idea-") && activeId.startsWith("idea-")) {
      const ideaActiveId = activeId.replace("idea-", "");
      const ideaOverId = overId.replace("idea-", "");
      if (ideaActiveId === ideaOverId) return;

      const idsInStatus = filteredIdeas.map((i) => i.id);
      const oldIndex = idsInStatus.indexOf(ideaActiveId);
      const newIndex = idsInStatus.indexOf(ideaOverId);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...idsInStatus];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);

      handleReorderIdeas(reordered);
      return;
    }

    if (overId.startsWith("folder-") && activeId.startsWith("idea-")) {
      const ideaId = activeId.replace("idea-", "");
      const folderId = overId.replace("folder-", "");
      handleMoveIdeaToFolder(ideaId, folderId);
    }
  };

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-8 py-10">
        <AdminHeader
          totalIdeas={totalIdeas}
          inboxCount={inboxCount}
          devCount={devCount}
          archiveCount={archiveCount}
        />

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="mt-6 grid h-[calc(100vh-160px)] grid-cols-12 gap-8 text-[13px] leading-relaxed">
            <AdminSidebar
              folders={folders}
              ideas={ideas}
              activeStatus={activeStatus}
              changeStatusAction={handleChangeStatus}
              renameFolderAction={({ id, label }) =>
                handleRenameFolder(id, label)
              }
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
              reorderIdeasAction={({ orderedIds }) =>
                handleReorderIdeas(orderedIds)
              }
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
        </DndContext>
      </div>
    </div>
  );
}
