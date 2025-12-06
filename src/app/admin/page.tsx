"use client";

import { useState } from "react";
import { motion } from "motion/react";
import AnimatedList from "@/components/ui/animated-list";
import ClickSpark from "@/components/ui/click-spark";
import Folder from "@/components/ui/folder";
import Stepper, { Step } from "@/components/ui/stepper";
import { FOLDERS, MOCK_IDEAS, type IdeaStatus } from "@/lib/mock-data";

type SelectedIdea = {
  status: IdeaStatus;
  index: number;
  label: string;
};

export default function AdminPage() {
  const [activeStatus, setActiveStatus] = useState<IdeaStatus>("INBOX");
  const [selected, setSelected] = useState<SelectedIdea | null>(null);
  const [processing, setProcessing] = useState(false);

  const ideas = MOCK_IDEAS[activeStatus];

  const handleSelect = (item: string, index: number) => {
    setSelected({ status: activeStatus, index, label: item });
    setProcessing(false);
  };

  const currentLabel =
    selected && selected.status === activeStatus ? selected.label : null;

  const currentTgi = currentLabel
    ? currentLabel.slice(0, currentLabel.indexOf("]") + 1)
    : null;

  const currentText = currentLabel
    ? currentLabel.slice(currentLabel.indexOf("]") + 1).trim()
    : "";

  return (
    <div className="min-h-screen bg-[#050509] text-white px-8 py-10">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Idea
            <span className="text-[#5227FF]">.admin</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Vue manager · Tri des idées TGI par espace
          </p>
        </div>
        <ClickSpark sparkColor="#22c55e" sparkCount={12}>
          <button className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800">
            Action globale
          </button>
        </ClickSpark>
      </header>

      <div className="grid h-[640px] grid-cols-12 gap-8">
        <div className="col-span-3 border-r border-zinc-900 pt-6">
          <div className="flex flex-col items-center gap-10">
            {FOLDERS.map((folder) => (
              <div
                key={folder.id}
                className="relative flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatus(folder.id);
                    setSelected(null);
                    setProcessing(false);
                  }}
                  className="relative"
                >
                  <Folder
                    size={1.2}
                    color={
                      activeStatus === folder.id ? folder.color : "#27272a"
                    }
                  />
                  {activeStatus === folder.id && (
                    <motion.div
                      layoutId="folder-glow"
                      className="absolute inset-0 rounded-full bg-[#5227FF]/20 blur-2xl"
                    />
                  )}
                </button>
                <div className="mt-3 text-center text-xs font-medium text-zinc-400">
                  <div
                    className={
                      activeStatus === folder.id
                        ? "text-zinc-50"
                        : "text-zinc-500"
                    }
                  >
                    {folder.label}
                  </div>
                  <div className="mt-0.5 text-[10px] opacity-60">
                    {folder.count} idée(s)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 px-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <span
              className="inline-flex h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  FOLDERS.find((f) => f.id === activeStatus)?.color ??
                  "#52525b",
              }}
            />
            {FOLDERS.find((f) => f.id === activeStatus)?.label}
          </h2>
          <div className="rounded-2xl border border-zinc-900 bg-[#060010]">
            <AnimatedList
              items={ideas}
              onItemSelect={handleSelect}
              showGradients
              enableArrowNavigation
              displayScrollbar
              className="w-full"
              itemClassName="border-l-2 border-transparent hover:border-[#5227FF] transition-colors"
            />
          </div>
        </div>

        <div className="col-span-4 rounded-2xl border border-zinc-900 bg-[#060010] p-6">
          {!currentLabel ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-xl">
                ⚡
              </div>
              <div className="text-sm">Sélectionnez une idée dans la liste</div>
            </div>
          ) : !processing ? (
            <div className="flex h-full flex-col">
              <div className="flex-1">
                {currentTgi && (
                  <div className="inline-flex items-center rounded-full bg-[#5227FF]/15 px-3 py-1 text-xs font-mono text-[#c4b5fd]">
                    {currentTgi}
                  </div>
                )}
                <h3 className="mt-4 text-lg font-semibold leading-snug">
                  {currentText}
                </h3>
                <p className="mt-4 text-xs uppercase tracking-wide text-zinc-500">
                  Statut espace: {activeStatus}
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900"
                >
                  Archiver
                </button>
                <ClickSpark sparkColor="#ffffff" sparkCount={10}>
                  <button
                    type="button"
                    onClick={() => setProcessing(true)}
                    className="flex-1 rounded-lg bg-[#5227FF] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#3f21c9]"
                  >
                    Traiter
                  </button>
                </ClickSpark>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <Stepper
                initialStep={1}
                onFinalStepCompleted={() => {
                  setProcessing(false);
                  setSelected(null);
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
                  className:
                    "px-3 py-1 text-sm text-zinc-400 hover:text-zinc-100",
                }}
              >
                <Step>
                  <h2 className="mb-2 text-lg font-semibold">Qualification</h2>
                  <p className="mb-4 text-sm text-zinc-400">
                    Décide si cette idée mérite d&apos;entrer dans le flux
                    équipe.
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
                  <h2 className="mb-2 text-lg font-semibold">Nettoyage</h2>
                  <p className="mb-4 text-sm text-zinc-400">
                    Reformule pour l&apos;équipe.
                  </p>
                  <textarea
                    className="h-32 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:border-[#5227FF] focus:outline-none"
                    defaultValue={currentText}
                  />
                </Step>
                <Step>
                  <div className="flex h-40 flex-col items-center justify-center gap-3 text-center text-sm">
                    <div className="text-3xl">🚀</div>
                    <div className="font-semibold">
                      Prêt à publier dans l&apos;espace équipe.
                    </div>
                  </div>
                </Step>
              </Stepper>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
