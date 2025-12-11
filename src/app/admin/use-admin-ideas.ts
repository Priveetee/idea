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
};

const INITIAL_FOLDERS: AdminFolderConfig[] = [
  { id: "INBOX", label: "Inbox général", color: "#5227FF" },
  { id: "ARCHIVE", label: "Archives", color: "#64748b" },
];

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

export function useAdminIdeas() {
  const { data, isLoading } = trpc.idea.list.useQuery();
  const createIdea = trpc.idea.create.useMutation();
  const renameIdea = trpc.idea.rename.useMutation();
  const deleteIdea = trpc.idea.delete.useMutation();
  const updateIdeaDetails = trpc.idea.updateDetails.useMutation();
  const setVisibilityMutation = trpc.idea.setVisibility.useMutation();

  const [folders, setFolders] = useState<AdminFolderConfig[]>(INITIAL_FOLDERS);
  const [ideas, setIdeas] = useState<AdminIdeaItem[]>(
    (data ?? []).map((d) => prismaIdeaToIdeaItem(d as PrismaIdea)),
  );
  const [activeStatus, setActiveStatus] = useState<AdminIdeaStatus>("INBOX");
  const [selected, setSelected] = useState<SelectedIdea | null>(null);

  const filteredIdeas = useMemo(
    () => ideas.filter((idea) => idea.status === activeStatus),
    [ideas, activeStatus],
  );

  const totalIdeas = ideas.length;
  const inboxCount = ideas.filter((i) => i.status === "INBOX").length;
  const devCount = 0;
  const archiveCount = ideas.filter((i) => i.status === "ARCHIVE").length;

  const changeStatus = (status: AdminIdeaStatus) => {
    setActiveStatus(status);
    setSelected(null);
  };

  const selectIdea = (payload: { item: string; index: number }) => {
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
      const created = await createIdea.mutateAsync({
        label: payload.label,
        status: String(payload.status),
        managerSummary: "",
        managerContent: "",
        managerNote: "",
        links: [],
        bullets: [],
      });
      setIdeas((prev) => [
        ...prev,
        prismaIdeaToIdeaItem(created as PrismaIdea),
      ]);
    } catch {}
  };

  const renameIdeaLocal = async (id: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, label: trimmed } : idea)),
    );
    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, label: trimmed } : prev,
    );
    try {
      await renameIdea.mutateAsync({ id, label: trimmed });
    } catch {}
  };

  const deleteIdeaLocal = async (id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    setSelected((prev) => (prev && prev.id === id ? null : prev));
    try {
      await deleteIdea.mutateAsync({ id });
    } catch {}
  };

  const addFolder = () => {
    const newId = generateFolderId(folders);
    const folder: AdminFolderConfig = {
      id: newId,
      label: `Espace ${folders.length + 1}`,
      color: "#22c55e",
    };
    setFolders((prev) => [...prev, folder]);
    setActiveStatus(newId);
    setSelected(null);
  };

  const renameFolder = (id: string, label: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)));
  };

  const changeFolderColor = (id: string, color: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, color } : f)));
  };

  const duplicateFolder = (id: string) => {
    setFolders((prevFolders) => {
      const source = prevFolders.find((f) => f.id === id);
      if (!source) return prevFolders;

      const newFolderId = generateFolderId(prevFolders);
      const duplicateFolderConfig: AdminFolderConfig = {
        id: newFolderId,
        label: `${source.label} (copie)`,
        color: source.color,
      };

      setIdeas((prevIdeas) => {
        const ideasInFolder = prevIdeas.filter((idea) => idea.status === id);
        if (ideasInFolder.length === 0) return prevIdeas;

        const nextIdeas = [...prevIdeas];
        ideasInFolder.forEach((idea) => {
          nextIdeas.push({
            ...idea,
            id: `${idea.id}-copy-${newFolderId}`,
            status: newFolderId,
          });
        });
        return nextIdeas;
      });

      return [...prevFolders, duplicateFolderConfig];
    });
  };

  const deleteFolder = (id: string) => {
    if (id === "INBOX" || id === "ARCHIVE") return;

    setFolders((prevFolders) => {
      const nextFolders = prevFolders.filter((f) => f.id !== id);
      if (nextFolders.length === 0) {
        setActiveStatus("INBOX");
      } else if (activeStatus === id) {
        const fallback =
          nextFolders.find((f) => f.id === "INBOX") ?? nextFolders[0];
        setActiveStatus(fallback.id);
      }
      return nextFolders;
    });

    setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.status !== id));

    if (selected && selected.status === id) {
      setSelected(null);
    }
  };

  const reorderFolders = (orderedIds: string[]) => {
    setFolders((prev) => {
      const byId = new Map(prev.map((f) => [f.id, f]));
      const next: AdminFolderConfig[] = [];

      orderedIds.forEach((id) => {
        const folder = byId.get(id);
        if (folder) next.push(folder);
      });

      prev.forEach((folder) => {
        if (!orderedIds.includes(folder.id)) {
          next.push(folder);
        }
      });

      return next;
    });
  };

  const reorderIdeas = (orderedIds: string[]) => {
    setIdeas((prev) => {
      const byId = new Map(prev.map((i) => [i.id, i]));
      const currentStatus = activeStatus;
      const inStatus = prev.filter((i) => i.status === currentStatus);
      const others = prev.filter((i) => i.status !== currentStatus);

      const orderedInStatus = orderedIds
        .map((id) => byId.get(id))
        .filter((idea): idea is AdminIdeaItem => idea !== undefined)
        .filter((idea) => idea.status === currentStatus);

      if (orderedInStatus.length !== inStatus.length) return prev;

      return [...others, ...orderedInStatus];
    });
  };

  const moveIdeaToFolder = (ideaId: string, targetFolderId: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, status: targetFolderId } : idea,
      ),
    );
    if (selected?.id === ideaId) setSelected(null);
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

    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === payload.id
          ? {
              ...idea,
              managerSummary: payload.managerSummary,
              managerContent: payload.managerContent,
              managerLinks: safeLinks,
              managerBullets: safeBullets,
              managerNote: payload.managerNote,
            }
          : idea,
      ),
    );
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
    } catch {}
  };

  const setVisibility = async (payload: { id: string; isPublic: boolean }) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === payload.id ? { ...idea, isPublic: payload.isPublic } : idea,
      ),
    );
    setSelected((prev) =>
      prev && prev.id === payload.id
        ? { ...prev, isPublic: payload.isPublic }
        : prev,
    );
    try {
      await setVisibilityMutation.mutateAsync(payload);
    } catch {}
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
