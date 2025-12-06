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

export const INITIAL_IDEAS: IdeaItem[] = [
  {
    id: "1",
    status: "INBOX",
    label: "[T0000001] Machine à café quantique au 4ème",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "2",
    status: "INBOX",
    label: "[T0000042] Refonte du process onboarding",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "3",
    status: "INBOX",
    label: "[T0000100] Utiliser Rust sur un micro-service critique",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "4",
    status: "INBOX",
    label: "[T0000200] Température open space RH",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "5",
    status: "DEV",
    label: "[T0000600] Migration Cloud Hybride",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "6",
    status: "DEV",
    label: "[T0000700] Appli mobile pour les commerciaux",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "7",
    status: "DEV",
    label: "[T0000800] Refonte UI Admin Panel",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "8",
    status: "ARCHIVE",
    label: "[T0000900] Acheter un poney",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "9",
    status: "ARCHIVE",
    label: "[T0001000] Peindre les murs en rose",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "10",
    status: "ARCHIVE",
    label: "[T0001100] Piscine sur le toit",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "11",
    status: "ARCHIVE",
    label: "[T0001200] Machine à popcorn au RDC",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
  },
  {
    id: "12",
    status: "ARCHIVE",
    label: "[T0001300] Casques audio fournis",
    managerSummary: "",
    managerContent: "",
    managerLinks: [],
    managerBullets: [],
    managerNote: "",
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
