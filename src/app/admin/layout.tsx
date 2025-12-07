"use client";

import type { ReactNode } from "react";
import { IdeaStoreProvider } from "./_providers/idea-store";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <IdeaStoreProvider>{children}</IdeaStoreProvider>;
}
