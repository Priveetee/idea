"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { useAdminConfig } from "./use-admin-config";
import { authClient } from "@/lib/auth-client";

function encodeNext(path: string): string {
  return encodeURIComponent(path);
}

function normalizeDropFolderId(rawOverId: string): string | null {
  if (!rawOverId.startsWith("folder-")) return null;

  let id = rawOverId.slice("folder-".length);
  if (!id) return null;

  if (id.startsWith("sort-")) {
    id = id.slice("sort-".length);
  }

  const trimmed = id.trim();
  if (!trimmed) return null;

  return trimmed;
}

export default function AdminPage() {
  const router = useRouter();

  const sessionQuery = authClient.useSession();
  const isSessionLoading = sessionQuery.isPending;
  const session = sessionQuery.data ?? null;

  const nextParam = useMemo(() => encodeNext("/admin"), []);

  useEffect(() => {
    if (isSessionLoading) return;
    if (!session) {
      router.replace(`/login?next=${nextParam}`);
    }
  }, [isSessionLoading, session, router, nextParam]);

  const {
    isLoading,
    unauthorized,
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

  const {
    registrationsOpen,
    toggleRegistrations,
    unauthorized: configUnauthorized,
  } = useAdminConfig();

  useEffect(() => {
    if (!session) return;
    if (unauthorized || configUnauthorized) {
      router.replace(`/login?next=${nextParam}`);
    }
  }, [session, unauthorized, configUnauthorized, router, nextParam]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const folderIds = useMemo(() => folders.map((f) => f.id), [folders]);
  const folderIdSet = useMemo(() => new Set(folderIds), [folderIds]);

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

      if (!folderIdSet.has(activeFolderId) || !folderIdSet.has(overFolderId)) {
        return;
      }

      const oldIndex = folderIds.indexOf(activeFolderId);
      const newIndex = folderIds.indexOf(overFolderId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...folderIds];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      reorderFolders(newOrder);
      return;
    }

    const isIdeaDrag = activeId.startsWith("idea-");
    if (!isIdeaDrag) return;

    const ideaId = activeId.replace("idea-", "");
    if (!ideaId) return;

    const dropFolderId = normalizeDropFolderId(overId);
    if (dropFolderId) {
      if (!folderIdSet.has(dropFolderId)) return;
      moveIdeaToFolder(ideaId, dropFolderId);
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

  if (isSessionLoading || (!session && !isSessionLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
        <div className="text-sm text-zinc-500">Authentification...</div>
      </div>
    );
  }

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
          registrationsOpen={registrationsOpen}
          toggleRegistrations={toggleRegistrations}
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
