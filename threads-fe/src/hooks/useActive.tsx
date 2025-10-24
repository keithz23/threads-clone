import { create } from "zustand";

type ActiveStore = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const useActive = create<ActiveStore>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
