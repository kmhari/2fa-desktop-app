import { create } from "zustand";
import { commands } from "../lib/tauri-commands";

interface ConnectionStore {
  isConfigured: boolean;
  isLoading: boolean;
  checkConfiguration: () => Promise<void>;
  setConfigured: (v: boolean) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  isConfigured: false,
  isLoading: true,

  checkConfiguration: async () => {
    set({ isLoading: true });
    try {
      const configured = await commands.loadCredentials();
      set({ isConfigured: configured, isLoading: false });
    } catch {
      set({ isConfigured: false, isLoading: false });
    }
  },

  setConfigured: (isConfigured) => set({ isConfigured }),
}));
