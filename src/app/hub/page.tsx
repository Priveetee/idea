"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { HubIdeaCard, type HubIdeaItem } from "./_components/hub-idea-card";
import {
  HubAnimatedList,
  type HubAnimatedListItem,
} from "./_components/hub-animated-list";

type Comment = { id: string; text: string; createdAt: number };
type CommentMap = Record<string, Comment[]>;

type PublicIdea = {
  id: string;
  label: string;
  status: string;
  managerSummary: string | null;
  managerContent: string | null;
  managerNote: string | null;
  links: { id: string; label: string; url: string }[];
  bullets: { id: string; text: string }[];
  reactions?: { emoji: string; fingerprint: string }[];
  comments?: { id: string; text: string; createdAt: string | Date }[];
};

type FolderRow = {
  id: string;
  label: string;
  color: string;
  position: number;
};

function createComment(text: string): Comment {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    createdAt: Date.now(),
  };
}

function getBrowserFingerprint(): string {
  if (typeof window === "undefined") return "server";
  const key = "idea_fingerprint";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const fp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, fp);
  return fp;
}

export default function HubPage() {
  const { data, isLoading } = trpc.idea.listPublic.useQuery(undefined, {
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
  const { data: folderData } = trpc.folder.list.useQuery();

  const utils = trpc.useUtils();
  const addReactionMutation = trpc.idea.addReaction.useMutation();
  const clearReactionsMutation = trpc.idea.clearReactionsForEmoji.useMutation();
  const addCommentMutation = trpc.idea.addComment.useMutation();

  const fingerprint = getBrowserFingerprint();

  const folders: FolderRow[] = useMemo(
    () => (folderData ?? []) as FolderRow[],
    [folderData],
  );

  const folderMetaById = useMemo(() => {
    const map = new Map<string, { label: string; color: string }>();
    folders.forEach((f) => map.set(f.id, { label: f.label, color: f.color }));
    return map;
  }, [folders]);

  const ideasRaw: PublicIdea[] = useMemo(
    () => (data ?? []) as PublicIdea[],
    [data],
  );

  const ideas: HubIdeaItem[] = useMemo(
    () =>
      ideasRaw.map((idea) => {
        const meta = folderMetaById.get(idea.status);
        return {
          id: idea.id,
          label: idea.label,
          status: idea.status,
          originLabel: meta?.label,
          originColor: meta?.color,
          managerSummary: idea.managerSummary ?? "",
          managerContent: idea.managerContent ?? "",
          managerLinks: idea.links.map((l) => ({
            id: l.id,
            label: l.label,
            url: l.url,
          })),
          managerBullets: idea.bullets.map((b) => ({
            id: b.id,
            text: b.text,
          })),
          managerNote: idea.managerNote ?? "",
        };
      }),
    [ideasRaw, folderMetaById],
  );

  const reactionCounts = useMemo(() => {
    const map: Record<string, string[]> = {};
    ideasRaw.forEach((idea) => {
      const emojis: string[] = idea.reactions?.map((r) => r.emoji) ?? [];
      map[idea.id] = emojis;
    });
    return map;
  }, [ideasRaw]);

  const myReactionsByIdeaId = useMemo(() => {
    const map = new Map<string, Set<string>>();
    ideasRaw.forEach((idea) => {
      const mine = new Set(
        (idea.reactions ?? [])
          .filter((r) => r.fingerprint === fingerprint)
          .map((r) => r.emoji),
      );
      map.set(idea.id, mine);
    });
    return map;
  }, [ideasRaw, fingerprint]);

  const initialComments: CommentMap = useMemo(() => {
    const map: CommentMap = {};
    ideasRaw.forEach((idea) => {
      const cs: Comment[] =
        idea.comments?.map((c) => ({
          id: c.id,
          text: c.text,
          createdAt: new Date(c.createdAt).getTime(),
        })) ?? [];
      map[idea.id] = cs;
    });
    return map;
  }, [ideasRaw]);

  const [commentOverrides, setCommentOverrides] = useState<CommentMap>({});

  const listItems: HubAnimatedListItem[] = useMemo(
    () =>
      ideas.map((idea) => ({
        id: idea.id,
        label: idea.label,
      })),
    [ideas],
  );

  const getReactionsForIdea = (ideaId: string): string[] =>
    reactionCounts[ideaId] ?? [];

  const getCommentsForIdea = (ideaId: string): Comment[] => {
    const local = commentOverrides[ideaId];
    if (local) return local;
    return initialComments[ideaId] ?? [];
  };

  const invalidate = () => {
    void utils.idea.listPublic.invalidate();
  };

  const handleToggleReaction = (ideaId: string, emoji: string) => {
    const mine = myReactionsByIdeaId.get(ideaId) ?? new Set<string>();
    const iReacted = mine.has(emoji);

    if (iReacted) {
      clearReactionsMutation.mutate(
        { ideaId, emoji, fingerprint },
        { onSuccess: invalidate },
      );
    } else {
      addReactionMutation.mutate(
        { ideaId, emoji, fingerprint },
        { onSuccess: invalidate },
      );
    }
  };

  const handleAddComment = (ideaId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const localComment = createComment(trimmed);
    const base = getCommentsForIdea(ideaId);

    setCommentOverrides((prev) => {
      const now = prev[ideaId] ?? base;
      const next = [...now, localComment];
      return {
        ...prev,
        [ideaId]: next.slice(-20),
      };
    });

    addCommentMutation.mutate(
      { ideaId, text: trimmed, fingerprint },
      { onSuccess: invalidate },
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050509] text-white">
      <div className="shrink-0 border-b border-zinc-900 bg-[#050509]/80 px-6 py-6 backdrop-blur-md md:px-10">
        <div className="mx-auto flex w-full max-w-[2000px] flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#5227FF]">
              Idea Hub
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Mur des idées
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/idea/new"
              className="group relative flex h-9 items-center gap-2 overflow-hidden rounded-full bg-white px-5 text-[13px] font-bold text-black transition hover:bg-zinc-200"
            >
              <span>Proposer une idée</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-8 md:px-10 [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#050509] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-700"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#3f3f46 #050509",
        }}
      >
        <div className="mx-auto max-w-[2000px]">
          {isLoading ? (
            <div className="mt-20 text-center text-sm text-zinc-500">
              Chargement des idées...
            </div>
          ) : ideas.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900/50">
                <span className="text-3xl">🌪️</span>
              </div>
              <div className="max-w-md text-[15px] text-zinc-500">
                Aucune idée n&apos;est encore disponible.
              </div>
            </div>
          ) : (
            <HubAnimatedList
              layout="grid"
              items={listItems}
              enableDrag={false}
              showGradients={false}
              renderItem={(item) => {
                const idea = ideas.find((i) => i.id === item.id)!;
                const ideaComments = getCommentsForIdea(idea.id);
                return (
                  <HubIdeaCard
                    idea={idea}
                    reactions={getReactionsForIdea(idea.id)}
                    comments={ideaComments}
                    onToggleReaction={(emoji) =>
                      handleToggleReaction(idea.id, emoji)
                    }
                    onAddComment={(text) => handleAddComment(idea.id, text)}
                  />
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
