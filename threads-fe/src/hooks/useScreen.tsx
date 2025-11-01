import { create } from "zustand";

export type Screen = "main" | "bio" | "interests" | "links" | "add" | "edit";
type Direction = -1 | 0 | 1;

const rank: Record<Screen, number> = {
  main: 0,
  bio: 1,
  interests: 2,
  links: 3,
  add: 4,
  edit: 4,
};

const ordered: Screen[] = ["main", "bio", "interests", "links", "add", "edit"];

type ScreenStore = {
  screen: Screen;
  direction: Direction;
  go: (next: Screen) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
};

export const useScreen = create<ScreenStore>()((set, get) => ({
  screen: "main",
  direction: 0,

  go: (next) => {
    const cur = get().screen;
    const delta = rank[next] - rank[cur];
    const dir: Direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;
    set({ screen: next, direction: dir });
  },

  next: () => {
    const cur = get().screen;
    const idx = ordered.indexOf(cur);
    const nxt = ordered[Math.min(idx + 1, ordered.length - 1)];
    if (nxt !== cur) set({ screen: nxt, direction: 1 });
  },

  prev: () => {
    const cur = get().screen;
    const idx = ordered.indexOf(cur);
    const prv = ordered[Math.max(idx - 1, 0)];
    if (prv !== cur) set({ screen: prv, direction: -1 });
  },

  reset: () => set({ screen: "main", direction: 0 }),
}));
