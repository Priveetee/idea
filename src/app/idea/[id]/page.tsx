"use client";

import { useState, type KeyboardEvent, useMemo } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useIdeaStore } from "@/app/admin/_providers/idea-store";
import type { IdeaStatus } from "@/lib/mock-data";
import { IdeaReadView } from "@/app/admin/_components/idea-read-view";
import { HubIdeaHeaderBody } from "@/app/hub/_components/hub-idea-header-body";
import { HubIdeaReactionsBar } from "@/app/hub/_components/hub-idea-reactions-bar";
import { HubIdeaComments } from "@/app/hub/_components/hub-idea-comments";
import { RiSendPlaneFill, RiArrowLeftLine, RiShareLine } from "react-icons/ri";

type ReactionMap = Record<string, string[]>;

type PublicIdeaComment = {
  id: string;
  text: string;
  createdAt: number;
};

type CommentMap = Record<string, PublicIdeaComment[]>;

type StackedReaction = { value: string; count: number };

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

export default function PublicIdeaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ideas } = useIdeaStore();
  const [reactions, setReactions] = useState<ReactionMap>({});
  const [comments, setComments] = useState<CommentMap>({});
  const [commentValue, setCommentValue] = useState("");
  const [copied, setCopied] = useState(false);

  const idea = ideas.find((i) => i.id === params.id);
  if (!idea) {
    notFound();
  }

  const label = idea.label;
  const end = label.indexOf("]");
  const tgiLabel = end === -1 ? null : label.slice(0, end + 1);
  const titleLabel = end === -1 ? label : label.slice(end + 1).trim();

  const ideaReactions = reactions[idea.id] ?? [];
  const ideaComments = comments[idea.id] ?? [];

  const stacked = useMemo(() => stackReactions(ideaReactions), [ideaReactions]);
  const totalReactions = useMemo(
    () => stacked.reduce((sum, r) => sum + r.count, 0),
    [stacked],
  );

  const handleToggleReaction = (emoji: string) => {
    setReactions((prev) => {
      const current = prev[idea.id] ?? [];
      const exists = current.includes(emoji);
      const nextReactions = exists
        ? current.filter((e) => e !== emoji)
        : [...current, emoji];
      return {
        ...prev,
        [idea.id]: nextReactions,
      };
    });
  };

  const handleAddComment = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setComments((prev) => {
      const current = prev[idea.id] ?? [];
      const next = [...current, createComment(trimmed)];
      return {
        ...prev,
        [idea.id]: next.slice(-20),
      };
    });
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

  return (
    <div className="min-h-screen bg-[#050509] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[12px] text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <RiArrowLeftLine className="h-3.5 w-3.5" />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="max-w-[220px] truncate">{titleLabel}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[11px] text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
            >
              <RiShareLine className="h-3 w-3" />
              <span>{copied ? "Lien copié" : "Copier le lien"}</span>
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-zinc-900 bg-[#060010] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <HubIdeaHeaderBody
            idea={idea}
            label={label}
            title={titleLabel}
            totalReactions={totalReactions}
          />

          <div className="px-8 pb-8 pt-2">
            <IdeaReadView
              titleLabel={titleLabel}
              tgiLabel={tgiLabel}
              activeStatus={idea.status as IdeaStatus}
              managerSummary={idea.managerSummary ?? ""}
              managerContent={idea.managerContent ?? ""}
              managerBullets={idea.managerBullets ?? []}
              managerLinks={idea.managerLinks ?? []}
              managerNote={""}
            />

            <div className="mt-6 border-t border-zinc-900 pt-4">
              <HubIdeaReactionsBar
                stacked={stacked}
                onToggleReaction={handleToggleReaction}
              />

              <HubIdeaComments comments={ideaComments} />

              <div className="relative mt-2 flex items-center">
                <input
                  type="text"
                  placeholder="Ajouter un commentaire public..."
                  className="h-9 w-full rounded-xl border border-zinc-800 bg-zinc-900/30 pl-3 pr-9 text-[12px] text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-700 focus:bg-zinc-900"
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                />
                <button
                  onClick={handleSendClick}
                  className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-[#5227FF] hover:text-white"
                >
                  <RiSendPlaneFill className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto text-[11px] text-zinc-600">
          <Link
            href="/hub"
            className="text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
          >
            Revenir au mur des idées
          </Link>
        </div>
      </div>
    </div>
  );
}
