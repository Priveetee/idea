"use client";

import { useMemo, useState } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import ClickSpark from "@/components/ui/click-spark";
import type {
  AdminIdeaBullet,
  AdminIdeaLink,
  AdminIdeaStatus,
} from "../use-admin-ideas";
import { IdeaBulletsEditor } from "./idea-bullets-editor";
import { IdeaLinksEditor } from "./idea-links-editor";
import { IdeaReadView } from "./idea-read-view";

type SelectedIdea = {
  status: AdminIdeaStatus;
  index: number;
  label: string;
  id: string;
  isPublic?: boolean;
};

type AdminIdeaPanelProps = {
  selected: SelectedIdea | null;
  activeStatus: AdminIdeaStatus;
  managerSummary: string;
  managerContent: string;
  managerLinks: AdminIdeaLink[];
  managerBullets: AdminIdeaBullet[];
  managerNote: string;
  updateIdeaDetailsAction: (_: {
    id: string;
    managerSummary: string;
    managerContent: string;
    managerLinks: AdminIdeaLink[];
    managerBullets: AdminIdeaBullet[];
    managerNote: string;
  }) => void | Promise<void>;
  clearSelectionAction: () => void;
  setVisibilityAction: (_: { id: string; isPublic: boolean }) => void;
};

export function AdminIdeaPanel({
  selected,
  activeStatus,
  managerSummary,
  managerContent,
  managerLinks,
  managerBullets,
  managerNote,
  updateIdeaDetailsAction,
  clearSelectionAction,
  setVisibilityAction,
}: AdminIdeaPanelProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  const currentLabel =
    selected && selected.status === activeStatus ? selected.label : null;

  const currentTgi = useMemo(() => {
    if (!currentLabel) return null;
    const end = currentLabel.indexOf("]");
    if (end === -1) return null;
    return currentLabel.slice(0, end + 1);
  }, [currentLabel]);

  const currentTitle = useMemo(() => {
    if (!currentLabel) return "";
    const end = currentLabel.indexOf("]");
    if (end === -1) return currentLabel;
    return currentLabel.slice(end + 1).trim();
  }, [currentLabel]);

  if (!currentLabel || !selected) {
    return (
      <div className="flex h-full w-full">
        <div className="flex w-full max-w-[960px] flex-col items-center justify-center rounded-3xl border border-zinc-900 bg-[#060010] px-10 py-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[calc(100vh-220px)]">
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-2xl">
              ⚡
            </div>
            <div className="text-sm text-zinc-300">
              Sélectionne une idée à gauche pour ouvrir son espace
              d&apos;édition.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pushUpdate = (partial: {
    managerSummary?: string;
    managerContent?: string;
    managerLinks?: AdminIdeaLink[];
    managerBullets?: AdminIdeaBullet[];
    managerNote?: string;
  }) => {
    updateIdeaDetailsAction({
      id: selected.id,
      managerSummary: partial.managerSummary ?? managerSummary,
      managerContent: partial.managerContent ?? managerContent,
      managerLinks: partial.managerLinks ?? managerLinks,
      managerBullets: partial.managerBullets ?? managerBullets,
      managerNote: partial.managerNote ?? managerNote,
    });
  };

  const handleSave = () => {
    pushUpdate({});
    setMode("view");
  };

  const handleSwitchToEdit = () => {
    setMode("edit");
  };

  const handleClear = () => {
    clearSelectionAction();
    setMode("view");
  };

  const handleToggleVisibility = () => {
    const isPublic = selected.isPublic ?? false;
    setVisibilityAction({ id: selected.id, isPublic: !isPublic });
  };

  const isPublic = selected.isPublic ?? false;
  const visibilityLabel = isPublic
    ? "Visible publiquement"
    : "Privée (non publiée)";
  const visibilityButtonLabel = isPublic ? "Rendre privée" : "Rendre publique";

  return (
    <div className="flex h-full w-full">
      <div className="flex w-full max-w-[960px] flex-col rounded-3xl border border-zinc-900 bg-[#060010] px-10 py-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] max-h-[calc(100vh-220px)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Détail de l&apos;idée
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-zinc-200">
                {activeStatus}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${
                  isPublic
                    ? "bg-emerald-950/60 text-emerald-300"
                    : "bg-zinc-900 text-zinc-300"
                }`}
              >
                {visibilityLabel}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleVisibility}
            className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[11px] text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
          >
            {visibilityButtonLabel}
          </button>
        </div>

        <div className="panel-scroll flex-1 overflow-y-auto pr-2">
          {mode === "view" ? (
            <IdeaReadView
              titleLabel={currentTitle}
              tgiLabel={currentTgi}
              activeStatus={activeStatus}
              managerSummary={managerSummary}
              managerContent={managerContent}
              managerBullets={managerBullets}
              managerLinks={managerLinks}
              managerNote={managerNote}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  {currentTgi && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-[11px] font-mono text-indigo-300">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "#5227FF" }}
                      />
                      {currentTgi}
                    </div>
                  )}
                  <div className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">
                    Statut espace: {activeStatus}
                  </div>
                </div>
                <div className="flex flex-col items-end text-[11px] text-zinc-500" />
              </div>

              <h1 className="text-xl font-semibold leading-snug text-zinc-50">
                {currentTitle}
              </h1>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/80 px-4 py-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Résumé rapide
                </div>
                <input
                  type="text"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-[#5227FF] focus:outline-none"
                  value={managerSummary}
                  onChange={(e) =>
                    pushUpdate({ managerSummary: e.target.value })
                  }
                  placeholder="En une phrase: pourquoi cette idée, pour qui, et l'effet attendu."
                />
              </div>

              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/80 px-4 py-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Détail de l&apos;idée
                </div>
                <textarea
                  className="h-40 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-[#5227FF] focus:outline-none"
                  value={managerContent}
                  onChange={(e) =>
                    pushUpdate({ managerContent: e.target.value })
                  }
                  placeholder="Décris le contexte, le problème, la solution envisagée, des exemples, des liens Notion / Loom..."
                />
              </div>

              <IdeaBulletsEditor
                bullets={managerBullets}
                onChange={(next) => pushUpdate({ managerBullets: next })}
              />

              <IdeaLinksEditor
                links={managerLinks}
                onChange={(next) => pushUpdate({ managerLinks: next })}
              />

              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/80 px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  <FaNoteSticky className="h-3 w-3 text-zinc-600" />
                  <span>Notes internes</span>
                </div>
                <textarea
                  className="h-24 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-[#5227FF] focus:outline-none"
                  value={managerNote}
                  onChange={(e) => pushUpdate({ managerNote: e.target.value })}
                  placeholder="Pour toi ou l'équipe core: décisions, inconnues, risques, choses à vérifier..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex shrink-0 gap-3 pt-2">
          <button
            type="button"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900"
            onClick={handleClear}
          >
            Archiver
          </button>

          {mode === "view" ? (
            <button
              type="button"
              onClick={handleSwitchToEdit}
              className="flex-1 rounded-lg border border-[#4f46e5] bg-transparent px-3 py-2 text-sm font-medium text-[#a5b4fc] transition hover:bg-[#111827]"
            >
              Modifier
            </button>
          ) : (
            <ClickSpark sparkColor="#ffffff" sparkCount={10}>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-lg bg-[#5227FF] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#3f21c9]"
              >
                Enregistrer
              </button>
            </ClickSpark>
          )}
        </div>
      </div>
    </div>
  );
}
