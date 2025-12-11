"use client";

import { useState } from "react";
import type {
  AdminIdeaBullet,
  AdminIdeaLink,
  AdminIdeaStatus,
} from "../use-admin-ideas";
import ClickSpark from "@/components/ui/click-spark";
import { IdeaReadView } from "./idea-read-view";
import { IdeaBulletsEditor } from "./idea-bullets-editor";
import { IdeaLinksEditor } from "./idea-links-editor";

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
  updateIdeaDetailsAction: (_payload: {
    id: string;
    managerSummary: string;
    managerContent: string;
    managerLinks: AdminIdeaLink[] | undefined;
    managerBullets: AdminIdeaBullet[] | undefined;
    managerNote: string;
  }) => Promise<void>;
  clearSelectionAction: () => void;
  setVisibilityAction: (_payload: { id: string; isPublic: boolean }) => void;
};

type Mode = "view" | "edit";

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
  const [mode, setMode] = useState<Mode>("view");
  const [summaryDraft, setSummaryDraft] = useState(managerSummary);
  const [contentDraft, setContentDraft] = useState(managerContent);
  const [linksDraft, setLinksDraft] = useState<AdminIdeaLink[]>(managerLinks);
  const [bulletsDraft, setBulletsDraft] =
    useState<AdminIdeaBullet[]>(managerBullets);
  const [noteDraft, setNoteDraft] = useState(managerNote);
  const [saving, setSaving] = useState(false);

  const ideaId = selected?.id ?? null;
  const ideaLabel = selected?.label ?? "";
  const isPublic = selected?.isPublic ?? false;

  if (!ideaId) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-[#050509] text-[13px] text-zinc-500">
        Sélectionne une idée dans la liste pour la consulter ou la modifier.
      </div>
    );
  }

  const label = ideaLabel;
  const end = label.indexOf("]");
  const tgiLabel = end === -1 ? null : label.slice(0, end + 1);
  const titleLabel = end === -1 ? label : label.slice(end + 1).trim();

  const handleToggleVisibility = () => {
    setVisibilityAction({ id: ideaId, isPublic: !isPublic });
  };

  const handleStartEdit = () => {
    setSummaryDraft(managerSummary);
    setContentDraft(managerContent);
    setLinksDraft(managerLinks);
    setBulletsDraft(managerBullets);
    setNoteDraft(managerNote);
    setMode("edit");
  };

  const handleSave = async () => {
    if (!ideaId) return;
    setSaving(true);
    await updateIdeaDetailsAction({
      id: ideaId,
      managerSummary: summaryDraft,
      managerContent: contentDraft,
      managerLinks: linksDraft,
      managerBullets: bulletsDraft,
      managerNote: noteDraft,
    });
    setSaving(false);
    setMode("view");
  };

  const handleCancel = () => {
    setSummaryDraft(managerSummary);
    setContentDraft(managerContent);
    setLinksDraft(managerLinks);
    setBulletsDraft(managerBullets);
    setNoteDraft(managerNote);
    setMode("view");
  };

  const visibilityLabel = isPublic
    ? "Visible publiquement"
    : "Privée (non publiée)";
  const visibilityButtonLabel = isPublic ? "Rendre privée" : "Rendre publique";

  return (
    <div className="flex h-full flex-col rounded-3xl border border-zinc-900 bg-[#050509] px-4 py-3 text-[13px] text-zinc-100">
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

      <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-900 bg-[#060010] px-4 py-3">
        {mode === "view" ? (
          <IdeaReadView
            titleLabel={titleLabel}
            tgiLabel={tgiLabel}
            activeStatus={activeStatus}
            managerSummary={managerSummary}
            managerContent={managerContent}
            managerBullets={managerBullets}
            managerLinks={managerLinks}
            managerNote={managerNote}
          />
        ) : (
          <div className="space-y-4">
            <div>
              <div className="mb-1 text-[12px] text-zinc-300">
                Résumé rapide
              </div>
              <textarea
                value={summaryDraft}
                onChange={(e) => setSummaryDraft(e.target.value)}
                className="h-20 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
              />
            </div>

            <div>
              <div className="mb-1 text-[12px] text-zinc-300">
                Détail complet
              </div>
              <textarea
                value={contentDraft}
                onChange={(e) => setContentDraft(e.target.value)}
                className="h-40 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
              />
            </div>

            <IdeaBulletsEditor
              bullets={bulletsDraft}
              onChange={setBulletsDraft}
            />

            <IdeaLinksEditor links={linksDraft} onChange={setLinksDraft} />

            <div>
              <div className="mb-1 text-[12px] text-zinc-300">
                Notes internes
              </div>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-100 outline-none focus:border-[#5227FF]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-[12px]">
        <button
          type="button"
          onClick={clearSelectionAction}
          className="rounded-md px-3 py-1 text-zinc-500 hover:text-zinc-200"
        >
          Archiver
        </button>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-md px-3 py-1 text-zinc-400 hover:text-zinc-200"
            >
              Annuler
            </button>
          )}
          {mode === "view" ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="rounded-md bg-zinc-800 px-4 py-1 text-zinc-100 hover:bg-zinc-700"
            >
              Modifier
            </button>
          ) : (
            <ClickSpark>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`rounded-md px-4 py-1 font-medium text-white transition ${
                  saving
                    ? "cursor-wait bg-[#3f21c9]"
                    : "bg-[#5227FF] hover:bg-[#3f21c9]"
                }`}
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
