export type IdeaStatus = "INBOX" | "DEV" | "ARCHIVE";

export type FolderConfig = {
  id: IdeaStatus;
  label: string;
  color: string;
  count: number;
};

export const FOLDERS: FolderConfig[] = [
  { id: "INBOX", label: "Inbox TGI", color: "#5227FF", count: 7 },
  { id: "DEV", label: "En cours", color: "#10b981", count: 3 },
  { id: "ARCHIVE", label: "Archives", color: "#64748b", count: 12 },
];

export const MOCK_IDEAS: Record<IdeaStatus, string[]> = {
  INBOX: [
    "[T0000001] Machine à café quantique au 4ème",
    "[T0000042] Refonte du process onboarding",
    "[T0000100] Utiliser Rust sur un micro-service critique",
    "[T0000200] Température open space RH",
    "[T0000300] Plus de plantes dans le couloir B",
    "[T0000400] Hackathon trimestriel",
    "[T0000500] Nouveau fournisseur de tickets resto",
  ],
  DEV: [
    "[T0000600] Migration Cloud Hybride",
    "[T0000700] Appli mobile pour les commerciaux",
    "[T0000800] Refonte UI Admin Panel",
  ],
  ARCHIVE: [
    "[T0000900] Acheter un poney",
    "[T0001000] Peindre les murs en rose",
    "[T0001100] Piscine sur le toit",
    "[T0001200] Machine à popcorn au RDC",
    "[T0001300] Casques audio fournis",
    "[T0001400] Parking vélos couvert",
    "[T0001500] Revoir la charte graphique",
    "[T0001600] Dark mode sur tous les outils",
    "[T0001700] Formations internes mensuelles",
    "[T0001800] Refonte du site carrière",
    "[T0001900] Boîte à livres partagée",
    "[T0002000] Café de spécialité à la cafétéria",
  ],
};
