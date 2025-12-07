import type { ReactNode } from "react";
import "./globals.css";
import { IdeaStoreProvider } from "./admin/_providers/idea-store";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#050509] text-white">
        <IdeaStoreProvider>{children}</IdeaStoreProvider>
      </body>
    </html>
  );
}
