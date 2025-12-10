export type IdeaStatus = "INBOX" | "DEV" | "ARCHIVE" | "CUSTOM";

export type FolderConfig = {
  id: IdeaStatus | string;
  label: string;
  color: string;
};

export type IdeaLink = {
  id: string;
  label: string;
  url: string;
};

export type IdeaBullet = {
  id: string;
  text: string;
};

export type IdeaItem = {
  id: string;
  label: string;
  status: IdeaStatus | string;
  managerSummary?: string;
  managerContent?: string;
  managerLinks?: IdeaLink[];
  managerBullets?: IdeaBullet[];
  managerNote?: string;
};

export const BASE_FOLDERS: FolderConfig[] = [
  { id: "INBOX", label: "Inbox TGI", color: "#5227FF" },
  { id: "DEV", label: "En cours", color: "#10b981" },
  { id: "ARCHIVE", label: "Archives", color: "#64748b" },
];

export function getFolderColor(
  id: IdeaStatus | string,
  folders: FolderConfig[],
) {
  const found = folders.find((f) => f.id === id);
  if (found) return found.color;
  return "#52525b";
}

export function getFolderLabel(
  id: IdeaStatus | string,
  folders: FolderConfig[],
) {
  const found = folders.find((f) => f.id === id);
  if (found) return found.label;
  return String(id);
}
