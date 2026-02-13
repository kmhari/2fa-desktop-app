import { create } from "zustand";

type Screen = "welcome" | "setup" | "accounts";

interface UiStore {
  screen: Screen;
  copiedId: number | null;
  addDialogOpen: boolean;
  setScreen: (screen: Screen) => void;
  setCopiedId: (id: number | null) => void;
  setAddDialogOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  screen: "welcome",
  copiedId: null,
  addDialogOpen: false,
  setScreen: (screen) => set({ screen }),
  setCopiedId: (copiedId) => set({ copiedId }),
  setAddDialogOpen: (addDialogOpen) => set({ addDialogOpen }),
}));
