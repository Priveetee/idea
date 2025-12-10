"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { IdeaItem } from "@/lib/mock-data";

type IdeaStoreContextValue = {
  ideas: IdeaItem[];
  setIdeas: (_updater: (_prev: IdeaItem[]) => IdeaItem[]) => void;
};

const IdeaStoreContext = createContext<IdeaStoreContextValue | null>(null);

export function IdeaStoreProvider({ children }: { children: ReactNode }) {
  const [ideas, _setIdeas] = useState<IdeaItem[]>([]);

  const setIdeas = (_updater: (_prev: IdeaItem[]) => IdeaItem[]) => {
    _setIdeas((prev) => _updater(prev));
  };

  return (
    <IdeaStoreContext.Provider value={{ ideas, setIdeas }}>
      {children}
    </IdeaStoreContext.Provider>
  );
}

export function useIdeaStore() {
  const ctx = useContext(IdeaStoreContext);
  if (!ctx) {
    throw new Error("useIdeaStore must be used within IdeaStoreProvider");
  }
  return ctx;
}
