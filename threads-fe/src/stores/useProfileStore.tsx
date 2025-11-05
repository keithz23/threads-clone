import type { Profile } from "@/interfaces/auth/profile.interface";
import { create } from "zustand";

type S = {
  profile?: Profile;
  setProfile: (p: Profile) => void;
};

export const useProfileStore = create<S>((set) => ({
  profile: undefined,
  setProfile: (p) => set({ profile: p }),
}));
