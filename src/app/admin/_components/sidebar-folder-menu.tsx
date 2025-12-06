"use client";

type SidebarFolderMenuProps = {
  isSystemFolder: boolean;
  deleteStep: "idle" | "confirm";
  onRename: () => void;
  onDuplicate: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

export function SidebarFolderMenu({
  isSystemFolder,
  deleteStep,
  onRename,
  onDuplicate,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: SidebarFolderMenuProps) {
  return (
    <div className="mt-2 w-44 rounded-2xl border border-zinc-800 bg-[#050509] py-1 text-[11px] text-zinc-200 shadow-xl">
      <button
        type="button"
        onClick={onRename}
        className="flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-900"
      >
        Renommer
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="flex w-full items-center px-3 py-1.5 text-left hover:bg-zinc-900"
      >
        Dupliquer
      </button>
      <div className="mt-1 border-t border-zinc-800/60 pt-1">
        {deleteStep === "idle" ? (
          <button
            type="button"
            onClick={onRequestDelete}
            disabled={isSystemFolder}
            className={`flex w-full items-center px-3 py-1.5 text-left ${
              isSystemFolder
                ? "cursor-not-allowed text-zinc-600"
                : "text-red-400 hover:bg-red-950/30 hover:text-red-300"
            }`}
          >
            Supprimer
          </button>
        ) : (
          <div className="px-3 py-1.5">
            <div className="mb-1 text-[10px] text-zinc-400">
              Envoyer les idées dans ARCHIVE ?
            </div>
            <div className="flex justify-end gap-2 text-[10px]">
              <button
                type="button"
                onClick={onCancelDelete}
                className="rounded-md px-2 py-1 text-zinc-300 hover:bg-zinc-900/60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="rounded-md bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
