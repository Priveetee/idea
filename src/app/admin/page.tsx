"use client";

import { useMemo, useState } from "react";
import { FOLDERS, MOCK_IDEAS, type IdeaStatus } from "@/lib/mock-data";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminIdeaList } from "./_components/admin-idea-list";
import { AdminIdeaPanel } from "./_components/admin-idea-panel";

type SelectedIdea = {
  status: IdeaStatus;
  index: number;
  label: string;
};

export default function AdminPage() {
  const [activeStatus, setActiveStatus] = useState<IdeaStatus>("INBOX");
  const [selected, setSelected] = useState<SelectedIdea | null>(null);
  const [processing, setProcessing] = useState(false);
  const [managerNote, setManagerNote] = useState("");

  const totalIdeas = useMemo(
    () => Object.values(MOCK_IDEAS).reduce((acc, list) => acc + list.length, 0),
    [],
  );

  const inboxCount =
    FOLDERS.find((f) => f.id === "INBOX")?.count ?? MOCK_IDEAS.INBOX.length;

  const devCount =
    FOLDERS.find((f) => f.id === "DEV")?.count ?? MOCK_IDEAS.DEV.length;

  const archiveCount =
    FOLDERS.find((f) => f.id === "ARCHIVE")?.count ?? MOCK_IDEAS.ARCHIVE.length;

  return (
    <div className="min-h-screen bg-[#050509] px-8 py-10 text-white">
      <AdminHeader
        totalIdeas={totalIdeas}
        inboxCount={inboxCount}
        devCount={devCount}
        archiveCount={archiveCount}
      />

      <div className="grid h-[640px] grid-cols-12 gap-8">
        <AdminSidebar
          activeStatus={activeStatus}
          changeStatusAction={(status) => {
            setActiveStatus(status);
            setSelected(null);
            setProcessing(false);
            setManagerNote("");
          }}
        />
        <AdminIdeaList
          activeStatus={activeStatus}
          selectAction={({ item, index }) => {
            setSelected({ status: activeStatus, index, label: item });
            setProcessing(false);
            setManagerNote("");
          }}
        />
        <div className="col-span-5">
          <AdminIdeaPanel
            selected={selected}
            activeStatus={activeStatus}
            processing={processing}
            managerNote={managerNote}
            processingAction={setProcessing}
            managerNoteAction={setManagerNote}
            clearSelectionAction={() => setSelected(null)}
          />
        </div>
      </div>
    </div>
  );
}
