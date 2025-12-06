export type IdeaStatus = "INBOX" | "DEV" | "ARCHIVE" | "CUSTOM";

export type FolderConfig = {
  id: IdeaStatus | string;
  label: string;
  color: string;
};

export type IdeaItem = {
  id: string;
  label: string;
  status: IdeaStatus | string;
};

export const BASE_FOLDERS: FolderConfig[] = [
  { id: "INBOX", label: "Inbox TGI", color: "#5227FF" },
  { id: "DEV", label: "En cours", color: "#10b981" },
  { id: "ARCHIVE", label: "Archives", color: "#64748b" },
];

export const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: "1",
    status: "INBOX",
    label: "[T0000001] Machine à café quantique au 4ème",
  },
  {
    id: "2",
    status: "INBOX",
    label: "[T0000042] Refonte du process onboarding",
  },
  {
    id: "3",
    status: "INBOX",
    label: "[T0000100] Utiliser Rust sur un micro-service critique",
  },
  {
    id: "4",
    status: "INBOX",
    label: "[T0000200] Température open space RH",
  },
  {
    id: "5",
    status: "DEV",
    label: "[T0000600] Migration Cloud Hybride",
  },
  {
    id: "6",
    status: "DEV",
    label: "[T0000700] Appli mobile pour les commerciaux",
  },
  {
    id: "7",
    status: "DEV",
    label: "[T0000800] Refonte UI Admin Panel",
  },
  {
    id: "8",
    status: "ARCHIVE",
    label: "[T0000900] Acheter un poney",
  },
  {
    id: "9",
    status: "ARCHIVE",
    label: "[T0001000] Peindre les murs en rose",
  },
  {
    id: "10",
    status: "ARCHIVE",
    label: "[T0001100] Piscine sur le toit",
  },
  {
    id: "11",
    status: "ARCHIVE",
    label: "[T0001200] Machine à popcorn au RDC",
  },
  {
    id: "12",
    status: "ARCHIVE",
    label: "[T0001300] Casques audio fournis",
  },
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
