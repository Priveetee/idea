"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminIdeaList } from "./_components/admin-idea-list";
import { AdminIdeaPanel } from "./_components/admin-idea-panel";
import { useAdminIdeas } from "./use-admin-ideas";

export default function AdminPage() {
  const {
    isLoading,
    folders,
    ideas,
    activeStatus,
    selected,
    filteredIdeas,
    totalIdeas,
    inboxCount,
    devCount,
    archiveCount,
    selectedIdeaData,
    changeStatus,
    selectIdea,
    addIdea,
    renameIdea,
    deleteIdea,
    addFolder,
    renameFolder,
    changeFolderColor,
    duplicateFolder,
    deleteFolder,
    reorderFolders,
    reorderIdeas,
    moveIdeaToFolder,
    updateDetails,
    clearSelection,
    setVisibility,
  } = useAdminIdeas();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (
      activeId.startsWith("folder-sort-") &&
      overId.startsWith("folder-sort-")
    ) {
      const activeFolderId = activeId.replace("folder-sort-", "");
      const overFolderId = overId.replace("folder-sort-", "");
      if (activeFolderId === overFolderId) return;

      const ids = folders.map((f) => f.id);
      if (!ids.includes(activeFolderId) || !ids.includes(overFolderId)) return;

      const oldIndex = ids.indexOf(activeFolderId);
      const newIndex = ids.indexOf(overFolderId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...ids];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      reorderFolders(newOrder);
      return;
    }

    const isIdeaDrag = activeId.startsWith("idea-");
    if (!isIdeaDrag) return;

    const ideaId = activeId.replace("idea-", "");

    if (overId.startsWith("folder-")) {
      let folderId = overId.replace("folder-", "");
      if (folderId.startsWith("sort-")) {
        folderId = folderId.replace("sort-", "");
      }
      if (!folderId) return;
      moveIdeaToFolder(ideaId, folderId);
      return;
    }

    if (overId.startsWith("idea-")) {
      const ideaOverId = overId.replace("idea-", "");
      if (ideaId === ideaOverId) return;

      const idsInStatus = filteredIdeas.map((i) => i.id);
      if (!idsInStatus.includes(ideaId) || !idsInStatus.includes(ideaOverId)) {
        return;
      }

      const oldIndex = idsInStatus.indexOf(ideaId);
      const newIndex = idsInStatus.indexOf(ideaOverId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...idsInStatus];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      reorderIdeas(newOrder);
    }
  };

  if (isLoading && ideas.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
        <div className="text-sm text-zinc-500">Chargement des idées...</div>
      </div>
    );
  }

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
              changeStatusAction={changeStatus}
              renameFolderAction={({ id, label }) => renameFolder(id, label)}
              changeFolderColorAction={({ id, color }) =>
                changeFolderColor(id, color)
              }
              duplicateFolderAction={({ id }) => duplicateFolder(id)}
              deleteFolderAction={({ id }) => deleteFolder(id)}
            />

            <AdminIdeaList
              activeStatus={activeStatus}
              folders={folders}
              items={filteredIdeas}
              selectAction={selectIdea}
              addIdeaAction={addIdea}
              addFolderAction={addFolder}
              renameIdeaAction={({ id, label }) => renameIdea(id, label)}
              deleteIdeaAction={({ id }) => deleteIdea(id)}
            />

            <div className="col-span-5 h-full overflow-y-auto">
              <AdminIdeaPanel
                selected={selected}
                activeStatus={activeStatus}
                managerSummary={selectedIdeaData?.managerSummary ?? ""}
                managerContent={selectedIdeaData?.managerContent ?? ""}
                managerLinks={selectedIdeaData?.managerLinks ?? []}
                managerBullets={selectedIdeaData?.managerBullets ?? []}
                managerNote={selectedIdeaData?.managerNote ?? ""}
                updateIdeaDetailsAction={updateDetails}
                clearSelectionAction={clearSelection}
                setVisibilityAction={setVisibility}
              />
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
