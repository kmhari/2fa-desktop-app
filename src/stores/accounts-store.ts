import { create } from "zustand";
import { commands } from "../lib/tauri-commands";
import type { Account } from "../types";

interface AccountsStore {
  accounts: Account[];
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  searchQuery: string;
  fetchAccounts: () => Promise<void>;
  deleteAccount: (accountId: number) => Promise<void>;
  setSearchQuery: (q: string) => void;
  filteredAccounts: () => Account[];
}

let fetchSeq = 0;

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  isLoading: false,
  isStale: false,
  error: null,
  searchQuery: "",

  fetchAccounts: async () => {
    const seq = ++fetchSeq;
    set({ isLoading: true, error: null });
    try {
      const accounts = await commands.fetchAccounts();
      if (seq !== fetchSeq) return; // superseded by a newer request
      set({ accounts, isLoading: false, isStale: false });
    } catch (e) {
      if (seq !== fetchSeq) return;
      set({ error: String(e), isLoading: false, isStale: true });
    }
  },

  deleteAccount: async (accountId) => {
    await commands.deleteAccount(accountId);
    await get().fetchAccounts();
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  filteredAccounts: () => {
    const { accounts, searchQuery } = get();
    if (!searchQuery) return accounts;
    const q = searchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.service?.toLowerCase().includes(q) ||
        a.account?.toLowerCase().includes(q)
    );
  },
}));
