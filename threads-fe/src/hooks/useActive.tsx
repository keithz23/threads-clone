import { create } from "zustand";
import { persist } from "zustand/middleware";

type ActiveStore = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const useActive = create<ActiveStore>()(
  persist(
    (set) => ({
      activeTab: "home",
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },
    }),
    {
      name: "active-tab-storage",
    }
  )
);
