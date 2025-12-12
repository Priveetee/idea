"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

export type AdminIdeaStatus = string;

export type AdminIdeaLink = { id: string; label: string; url: string };
export type AdminIdeaBullet = { id: string; text: string };

export type AdminIdeaItem = {
  id: string;
  label: string;
  status: AdminIdeaStatus;
  managerSummary: string;
  managerContent: string;
  managerLinks: AdminIdeaLink[];
  managerBullets: AdminIdeaBullet[];
  managerNote: string;
  isPublic: boolean;
  createdAt: Date | string | number;
};

export type AdminFolderConfig = {
  id: string;
  label: string;
  color: string;
  position: number;
};

type PrismaIdea = {
  id: string;
  label: string;
  status: string;
  managerSummary: string | null;
  managerContent: string | null;
  managerNote: string | null;
  isPublic: boolean;
  createdAt: string | Date;
  links: { id: string; label: string; url: string }[];
  bullets: { id: string; text: string }[];
};

type SelectedIdea = {
  status: AdminIdeaStatus;
  index: number;
  label: string;
  id: string;
  isPublic?: boolean;
};

type FolderRow = {
  id: string;
  label: string;
  color: string;
  position: number;
};

function prismaIdeaToIdeaItem(db: PrismaIdea): AdminIdeaItem {
  return {
    id: db.id,
    label: db.label,
    status: db.status,
    managerSummary: db.managerSummary ?? "",
    managerContent: db.managerContent ?? "",
    managerLinks: db.links.map((l) => ({
      id: l.id,
      label: l.label,
      url: l.url,
    })),
    managerBullets: db.bullets.map((b) => ({
      id: b.id,
      text: b.text,
    })),
    managerNote: db.managerNote ?? "",
    isPublic: db.isPublic ?? false,
    createdAt: db.createdAt,
  };
}

function generateFolderId(existing: AdminFolderConfig[]): string {
  let i = 1;
  while (true) {
    const candidate = `CUSTOM_${i}`;
    if (!existing.some((f) => f.id === candidate)) return candidate;
    i += 1;
  }
}

function isUnauthorizedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const e = err as {
    message?: unknown;
    data?: unknown;
    shape?: unknown;
  };

  if (typeof e.message === "string" && e.message.includes("UNAUTHORIZED")) {
    return true;
  }

  const data = e.data as { code?: unknown } | undefined;
  if (data && typeof data.code === "string" && data.code === "UNAUTHORIZED") {
    return true;
  }

  const shape = e.shape as { message?: unknown } | undefined;
  if (
    shape &&
    typeof shape.message === "string" &&
    shape.message.includes("UNAUTHORIZED")
  ) {
    return true;
  }

  return false;
}

export function useAdminIdeas() {
  const {
    data: folderData,
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders,
  } = trpc.folder.list.useQuery();

  const {
    data: ideaData,
    isLoading: ideasLoading,
    error: ideasError,
    refetch: refetchIdeas,
  } = trpc.idea.list.useQuery();

  const createIdea = trpc.idea.create.useMutation();
  const renameIdea = trpc.idea.rename.useMutation();
  const deleteIdea = trpc.idea.delete.useMutation();
  const updateIdeaDetails = trpc.idea.updateDetails.useMutation();
  const setVisibilityMutation = trpc.idea.setVisibility.useMutation();
  const moveToFolderMutation = trpc.idea.moveToFolder.useMutation();

  const createFolderMutation = trpc.folder.create.useMutation();
  const duplicateFolderMutation = trpc.folder.duplicate.useMutation();
  const updateFolderMutation = trpc.folder.update.useMutation();
  const deleteFolderMutation = trpc.folder.delete.useMutation();
  const reorderFoldersMutation = trpc.folder.reorder.useMutation();

  const unauthorized =
    isUnauthorizedError(ideasError) ||
    isUnauthorizedError(foldersError) ||
    isUnauthorizedError(createIdea.error) ||
    isUnauthorizedError(renameIdea.error) ||
    isUnauthorizedError(deleteIdea.error) ||
    isUnauthorizedError(updateIdeaDetails.error) ||
    isUnauthorizedError(setVisibilityMutation.error) ||
    isUnauthorizedError(moveToFolderMutation.error) ||
    isUnauthorizedError(createFolderMutation.error) ||
    isUnauthorizedError(duplicateFolderMutation.error) ||
    isUnauthorizedError(updateFolderMutation.error) ||
    isUnauthorizedError(deleteFolderMutation.error) ||
    isUnauthorizedError(reorderFoldersMutation.error);

  const isLoading = foldersLoading || ideasLoading;

  const folders: AdminFolderConfig[] = useMemo(
    () =>
      ((folderData ?? []) as FolderRow[])
        .slice()
        .sort((a, b) => a.position - b.position),
    [folderData],
  );

  const ideas: AdminIdeaItem[] = useMemo(
    () => ((ideaData ?? []) as PrismaIdea[]).map(prismaIdeaToIdeaItem),
    [ideaData],
  );

  const [activeStatus, setActiveStatus] = useState<AdminIdeaStatus>("INBOX");
  const [selected, setSelected] = useState<SelectedIdea | null>(null);

  const filteredIdeas = useMemo(
    () => ideas.filter((idea) => idea.status === activeStatus),
    [ideas, activeStatus],
  );

  const totalIdeas = ideas.length;
  const inboxCount = ideas.filter((i) => i.status === "INBOX").length;
  const devCount = ideas.filter((i) => i.status === "DEV").length;
  const archiveCount = ideas.filter((i) => i.status === "ARCHIVE").length;

  const changeStatus = (status: AdminIdeaStatus) => {
    setActiveStatus(status);
    setSelected(null);
  };

  const selectIdea = (payload: { item: string; index: number }) => {
    const _ = payload.item;
    const item = filteredIdeas[payload.index];
    if (!item) return;
    setSelected({
      status: item.status,
      index: payload.index,
      label: item.label,
      id: item.id,
      isPublic: item.isPublic,
    });
  };

  const addIdea = async (payload: {
    label: string;
    status: AdminIdeaStatus;
  }) => {
    try {
      await createIdea.mutateAsync({
        label: payload.label,
        status: String(payload.status),
        managerSummary: "",
        managerContent: "",
        managerNote: "",
        links: [],
        bullets: [],
      });
      await refetchIdeas();
    } catch {}
  };

  const renameIdeaLocal = async (id: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    try {
      await renameIdea.mutateAsync({ id, label: trimmed });
      await refetchIdeas();
    } catch {}
  };

  const deleteIdeaLocal = async (id: string) => {
    try {
      await deleteIdea.mutateAsync({ id });
      await refetchIdeas();
    } catch {}
    setSelected((prev) => (prev && prev.id === id ? null : prev));
  };

  const addFolder = async () => {
    const newId = generateFolderId(folders);
    try {
      await createFolderMutation.mutateAsync({
        id: newId,
        label: `Espace ${folders.length + 1}`,
        color: "#22c55e",
      });
      await refetchFolders();
      setActiveStatus(newId);
      setSelected(null);
    } catch {}
  };

  const renameFolder = async (id: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    try {
      await updateFolderMutation.mutateAsync({ id, label: trimmed });
      await refetchFolders();
    } catch {}
  };

  const changeFolderColor = async (id: string, color: string) => {
    try {
      await updateFolderMutation.mutateAsync({ id, color });
      await refetchFolders();
    } catch {}
  };

  const duplicateFolder = async (id: string) => {
    const source = folders.find((f) => f.id === id);
    if (!source) return;

    const newId = generateFolderId(folders);
    const newLabel = `${source.label} (copie)`;

    try {
      await duplicateFolderMutation.mutateAsync({
        sourceId: id,
        newId,
        newLabel,
      });
      await Promise.all([refetchFolders(), refetchIdeas()]);
    } catch {}
  };

  const deleteFolder = async (id: string) => {
    if (id === "INBOX" || id === "ARCHIVE") return;

    try {
      await deleteFolderMutation.mutateAsync({ id });
      await Promise.all([refetchFolders(), refetchIdeas()]);
    } catch {}

    setSelected((prev) => (prev && prev.status === id ? null : prev));

    if (activeStatus === id) {
      setActiveStatus("INBOX");
    }
  };

  const reorderFolders = async (orderedIds: string[]) => {
    try {
      await reorderFoldersMutation.mutateAsync({ orderedIds });
      await refetchFolders();
    } catch {}
  };

  const reorderIdeas = (orderedIds: string[]) => {
    const _ = orderedIds;
  };

  const moveIdeaToFolder = async (ideaId: string, targetFolderId: string) => {
    try {
      await moveToFolderMutation.mutateAsync({
        id: ideaId,
        status: targetFolderId,
      });
      await refetchIdeas();
    } catch {}

    setSelected((prev) =>
      prev && prev.id === ideaId ? { ...prev, status: targetFolderId } : prev,
    );
  };

  const updateDetails = async (payload: {
    id: string;
    managerSummary: string;
    managerContent: string;
    managerLinks: AdminIdeaLink[] | undefined;
    managerBullets: AdminIdeaBullet[] | undefined;
    managerNote: string;
  }) => {
    const safeLinks = payload.managerLinks ?? [];
    const safeBullets = payload.managerBullets ?? [];

    try {
      await updateIdeaDetails.mutateAsync({
        id: payload.id,
        managerSummary: payload.managerSummary,
        managerContent: payload.managerContent,
        managerNote: payload.managerNote,
        links: safeLinks.map((l) => ({
          id: l.id,
          label: l.label,
          url: l.url,
        })),
        bullets: safeBullets.map((b) => ({
          id: b.id,
          text: b.text,
        })),
      });
      await refetchIdeas();
    } catch {}
  };

  const setVisibility = async (payload: { id: string; isPublic: boolean }) => {
    try {
      await setVisibilityMutation.mutateAsync(payload);
      await refetchIdeas();
    } catch {}
    setSelected((prev) =>
      prev && prev.id === payload.id
        ? { ...prev, isPublic: payload.isPublic }
        : prev,
    );
  };

  const clearSelection = () => {
    setSelected(null);
  };

  const selectedIdeaData =
    selected && selected.status === activeStatus
      ? ideas.find((i) => i.id === selected.id) || null
      : null;

  return {
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
    renameIdea: renameIdeaLocal,
    deleteIdea: deleteIdeaLocal,
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
  };
}
