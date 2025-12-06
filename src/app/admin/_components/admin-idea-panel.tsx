"use client";

import { useMemo } from "react";
import ClickSpark from "@/components/ui/click-spark";
import Stepper, { Step } from "@/components/ui/stepper";
import type { IdeaStatus } from "@/lib/mock-data";

type SelectedIdea = {
  status: IdeaStatus;
  index: number;
  label: string;
};

type AdminIdeaPanelProps = {
  selected: SelectedIdea | null;
  activeStatus: IdeaStatus;
  processing: boolean;
  managerNote: string;
  processingAction: (_: boolean) => void;
  managerNoteAction: (_: string) => void;
  clearSelectionAction: () => void;
};

export function AdminIdeaPanel({
  selected,
  activeStatus,
  processing,
  managerNote,
  processingAction,
  managerNoteAction,
  clearSelectionAction,
}: AdminIdeaPanelProps) {
  const currentLabel =
    selected && selected.status === activeStatus ? selected.label : null;

  const currentTgi = useMemo(() => {
    if (!currentLabel) return null;
    const end = currentLabel.indexOf("]");
    if (end === -1) return null;
    return currentLabel.slice(0, end + 1);
  }, [currentLabel]);

  const currentText = useMemo(() => {
    if (!currentLabel) return "";
    const end = currentLabel.indexOf("]");
    if (end === -1) return currentLabel;
    return currentLabel.slice(end + 1).trim();
  }, [currentLabel]);

  if (!currentLabel) {
    return (
      <div className="flex h-full items-center">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-zinc-900 bg-[#060010] px-10 py-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-2xl">
            ⚡
          </div>
          <div className="mt-4 text-sm text-zinc-300">
            Sélectionnez une idée dans la liste pour la traiter
          </div>
        </div>
      </div>
    );
  }

  if (!processing) {
    return (
      <div className="flex h-full items-center">
        <div className="flex h-full w-full flex-col rounded-3xl border border-zinc-900 bg-[#060010] px-10 py-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-3">
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
            <div className="flex flex-col items-end text-[11px] text-zinc-500">
              <span>Origine: Lien unique TGI</span>
              <span className="mt-0.5 opacity-70">Flux: mockdata admin</span>
            </div>
          </div>
          <h3 className="mt-4 text-lg font-semibold leading-snug">
            {currentText}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
            <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-400">
              Impact: moyen
            </div>
            <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-400">
              Complexité: faible
            </div>
            <div className="rounded-lg bg-zinc-900 px-3 py-2 text-zinc-400">
              Horizon: Q3/Q4
            </div>
          </div>
          <div className="mt-auto flex gap-3 pt-6">
            <button
              type="button"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900"
              onClick={clearSelectionAction}
            >
              Archiver
            </button>
            <ClickSpark sparkColor="#ffffff" sparkCount={10}>
              <button
                type="button"
                onClick={() => processingAction(true)}
                className="flex-1 rounded-lg bg-[#5227FF] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#3f21c9]"
              >
                Traiter
              </button>
            </ClickSpark>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center">
      <div className="flex h-full w-full flex-col rounded-3xl border border-zinc-900 bg-[#060010] px-10 py-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <Stepper
          initialStep={1}
          onFinalStepCompleted={() => {
            processingAction(false);
            clearSelectionAction();
            managerNoteAction("");
          }}
          backButtonText="Retour"
          nextButtonText="Suivant"
          stepCircleContainerClassName="bg-[#060010]"
          contentClassName="pt-4"
          footerClassName="pt-2"
          nextButtonProps={{
            className:
              "duration-300 rounded-full bg-[#5227FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f21c9]",
          }}
          backButtonProps={{
            className: "px-3 py-1 text-sm text-zinc-400 hover:text-zinc-100",
          }}
        >
          <Step>
            <h2 className="mb-2 text-lg font-semibold">Qualification</h2>
            <p className="mb-4 text-sm text-zinc-400">
              Décide si cette idée mérite d&apos;entrer dans le flux équipe.
            </p>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="rounded-lg bg-zinc-900 px-3 py-2">
                Impact perçu: moyen
              </div>
              <div className="rounded-lg bg-zinc-900 px-3 py-2">
                Complexité: faible
              </div>
            </div>
          </Step>
          <Step>
            <h2 className="mb-2 text-lg font-semibold">Reformulation</h2>
            <p className="mb-4 text-sm text-zinc-400">
              Reformule pour que l&apos;équipe comprenne rapidement.
            </p>
            <textarea
              className="h-28 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-[#5227FF] focus:outline-none"
              defaultValue={currentText}
            />
          </Step>
          <Step>
            <h2 className="mb-2 text-lg font-semibold">Note interne</h2>
            <p className="mb-4 text-sm text-zinc-400">
              Ajoute une note personnelle avant diffusion.
            </p>
            <textarea
              className="h-24 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-[#5227FF] focus:outline-none"
              value={managerNote}
              onChange={(e) => managerNoteAction(e.target.value)}
              placeholder="Ex: à revoir avec l'équipe infra avant diffusion."
            />
          </Step>
        </Stepper>
      </div>
    </div>
  );
}
