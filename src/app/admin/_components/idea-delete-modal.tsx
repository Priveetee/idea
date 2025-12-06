"use client";

type IdeaDeleteModalProps = {
  open: boolean;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function IdeaDeleteModal({
  open,
  label,
  onCancel,
  onConfirm,
}: IdeaDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#050509] px-6 py-5 text-sm text-zinc-100 shadow-2xl">
        <div className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
          Supprimer l&apos;idée
        </div>
        <div className="mb-3 text-base font-medium text-zinc-50">{label}</div>
        <div className="mb-4 text-[13px] text-zinc-400">
          Cette idée sera définitivement supprimée de cet espace. Cette action
          est irréversible.
        </div>
        <div className="flex justify-end gap-2 text-[13px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-300 transition hover:bg-zinc-800"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white transition hover:bg-red-500"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
}
