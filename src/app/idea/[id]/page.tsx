"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { getIconForUrl, EXTERNAL_ICON } from "@/lib/link-icons";
import { RiSendPlaneFill, RiArrowLeftLine, RiShareLine } from "react-icons/ri";
import { PublicReactionsBar } from "./public-reactions-bar";
import { PublicComments } from "./public-comments";
import { PublicRichText } from "./public-rich-text";

type ReactionMap = Record<string, string[]>;

type PublicIdeaComment = {
  id: string;
  text: string;
  createdAt: number;
};

type CommentMap = Record<string, PublicIdeaComment[]>;

type StackedReaction = { value: string; count: number };

type PublicIdeaDetail = {
  id: string;
  label: string;
  status: string;
  managerContent: string | null;
  links: { id: string; label: string; url: string }[];
  reactions?: { emoji: string }[];
  comments?: { id: string; text: string; createdAt: string | Date }[];
};

function stackReactions(raw: string[]): StackedReaction[] {
  const map = new Map<string, number>();
  raw.forEach((r) => {
    const key = r.trim();
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([value, count]) => ({ value, count }));
}

function createComment(text: string): PublicIdeaComment {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    createdAt: Date.now(),
  };
}

function getBrowserFingerprint(): string {
  if (typeof window === "undefined") return "server";
  const key = "idea_fingerprint";
  const existing =
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  if (existing) return existing;
  const fp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, fp);
  return fp;
}

export default function PublicIdeaPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading } = trpc.idea.byIdPublic.useQuery({
    id: params.id,
  });

  const utils = trpc.useUtils();
  const addReactionMutation = trpc.idea.addReaction.useMutation();
  const clearReactionsMutation = trpc.idea.clearReactionsForEmoji.useMutation();
  const addCommentMutation = trpc.idea.addComment.useMutation();

  const fingerprint = getBrowserFingerprint();

  const idea: PublicIdeaDetail | null = useMemo(
    () => (data ? (data as PublicIdeaDetail) : null),
    [data],
  );

  const initialReactions: ReactionMap = useMemo(() => {
    if (!idea) return {};
    const emojis: string[] = idea.reactions?.map((r) => r.emoji) ?? [];
    return { [idea.id]: emojis };
  }, [idea]);

  const initialComments: CommentMap = useMemo(() => {
    if (!idea) return {};
    const cs: PublicIdeaComment[] =
      idea.comments?.map((c) => ({
        id: c.id,
        text: c.text,
        createdAt: new Date(c.createdAt).getTime(),
      })) ?? [];
    return { [idea.id]: cs };
  }, [idea]);

  const [reactions, setReactions] = useState<ReactionMap>({});
  const [comments, setComments] = useState<CommentMap>({});
  const [commentValue, setCommentValue] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isLoading && !idea) {
    notFound();
  }

  if (!idea) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050509] text-white">
        <div className="text-sm text-zinc-500">
          Chargement de l&apos;idée...
        </div>
      </div>
    );
  }

  const getReactionsForIdea = (): string[] => {
    const local = reactions[idea.id];
    if (local) return local;
    return initialReactions[idea.id] ?? [];
  };

  const getCommentsForIdea = (): PublicIdeaComment[] => {
    const local = comments[idea.id];
    if (local) return local;
    return initialComments[idea.id] ?? [];
  };

  const label = idea.label;
  const end = label.indexOf("]");
  const tgiLabel = end === -1 ? null : label.slice(0, end + 1);
  const titleLabel = end === -1 ? label : label.slice(end + 1).trim();
  const status = idea.status;

  const ideaComments = getCommentsForIdea();

  const list = getReactionsForIdea();
  const stacked = stackReactions(list);
  const totalReactions = stacked.reduce((sum, r) => sum + r.count, 0);

  const handleToggleReaction = (emoji: string) => {
    const current = getReactionsForIdea();
    const exists = current.includes(emoji);

    setReactions((prev) => {
      const now = prev[idea.id] ?? current;
      const next = exists ? now.filter((e) => e !== emoji) : [...now, emoji];
      return {
        ...prev,
        [idea.id]: next,
      };
    });

    if (exists) {
      clearReactionsMutation.mutate(
        { ideaId: idea.id, emoji, fingerprint },
        {
          onSuccess: () => {
            void utils.idea.byIdPublic.invalidate({ id: idea.id });
          },
        },
      );
    } else {
      addReactionMutation.mutate(
        { ideaId: idea.id, emoji, fingerprint },
        {
          onSuccess: () => {
            void utils.idea.byIdPublic.invalidate({ id: idea.id });
          },
        },
      );
    }
  };

  const handleAddComment = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const localComment = createComment(trimmed);
    const base = getCommentsForIdea();

    setComments((prev) => {
      const now = prev[idea.id] ?? base;
      const next = [...now, localComment];
      return {
        ...prev,
        [idea.id]: next.slice(-20),
      };
    });

    addCommentMutation.mutate(
      { ideaId: idea.id, text: trimmed, fingerprint },
      {
        onSuccess: () => {
          void utils.idea.byIdPublic.invalidate({ id: idea.id });
        },
      },
    );
  };

  const handleCommentKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = commentValue.trim();
      if (!value) return;
      handleAddComment(value);
      setCommentValue("");
    }
  };

  const handleSendClick = () => {
    const value = commentValue.trim();
    if (!value) return;
    handleAddComment(value);
    setCommentValue("");
  };

  const handleCopyLink = () => {
    const href =
      typeof window !== "undefined" ? window.location.href : `/idea/${idea.id}`;
    navigator.clipboard
      .writeText(href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  const links = idea.links;

  return (
    <div
      className="min-h-screen bg-[#050509] text-white overflow-y-auto [&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#050509] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-zinc-700"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#3f3f46 #050509",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-6">
        <header className="mb-4 flex items-center justify-between gap-4">
          <Link
            href="/hub"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[12px] text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <RiArrowLeftLine className="h-3.5 w-3.5" />
            <span>Retour</span>
          </Link>

          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="max-w-[260px] truncate">{titleLabel}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[11px] text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <RiShareLine className="h-3 w-3" />
              <span>{copied ? "Lien copié" : "Copier le lien"}</span>
            </button>
          </div>
        </header>

        <main className="mb-4 rounded-3xl border border-zinc-900 bg-[#060010] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="border-b border-zinc-900 px-8 pb-5 pt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
              {tgiLabel && (
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 font-mono text-[11px] text-indigo-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  {tgiLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {status === "INBOX" && "Inbox"}
                {status !== "INBOX" && String(status)}
              </span>
              {totalReactions > 0 && (
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-300">
                  {totalReactions} réaction{totalReactions > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <h1 className="text-lg font-semibold leading-snug text-zinc-50">
              {titleLabel}
            </h1>

            {links.length > 0 && (
              <div className="mt-6 space-y-5 text-[12px] text-zinc-300">
                <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                  Références intéressantes
                </div>
                <ul className="space-y-3.5">
                  {links.map((link) => {
                    const Icon = getIconForUrl(link.url);
                    let host = "";
                    try {
                      host = new URL(link.url).hostname.replace(/^www\./i, "");
                    } catch {
                      host = link.url;
                    }
                    return (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center gap-4 rounded-xl bg-zinc-950/70 px-5 py-2.5 hover:bg-zinc-900"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900">
                            <Icon className="h-4 w-4 text-zinc-200" />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[13px] text-zinc-100">
                              {link.label || host}
                            </span>
                            <span className="truncate text-[11px] text-zinc-500">
                              {host}
                            </span>
                          </div>
                          <EXTERNAL_ICON className="ml-auto h-4 w-4 flex-shrink-0 text-zinc-500" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className="px-8 pb-10 pt-5 space-y-9">
            <section>
              <PublicRichText content={idea.managerContent ?? ""} />
            </section>

            <section>
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                Réactions
              </div>
              <PublicReactionsBar
                stacked={stackReactions(getReactionsForIdea())}
                onToggleReaction={handleToggleReaction}
              />
            </section>

            <section className="rounded-2xl border border-zinc-900 bg-zinc-950/40 px-3 py-3">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                Commentaires publics
              </div>

              <PublicComments comments={ideaComments} />

              <div className="mt-3 border-t border-zinc-900 pt-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ajouter un commentaire public..."
                    className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900/40 pl-3 pr-9 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-700 focus:bg-zinc-900"
                    value={commentValue}
                    onChange={(e) => setCommentValue(e.target.value)}
                    onKeyDown={handleCommentKeyDown}
                  />
                  <button
                    type="button"
                    onClick={handleSendClick}
                    className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-black"
                  >
                    <RiSendPlaneFill className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="mt-auto text-[11px] text-zinc-600">
          <Link
            href="/hub"
            className="text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
          >
            Revenir au mur des idées
          </Link>
        </footer>
      </div>
    </div>
  );
}
