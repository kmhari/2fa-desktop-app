import { create } from "zustand";
import { commands } from "../lib/tauri-commands";
import type { Account } from "../types";

interface AccountsStore {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  fetchAccounts: () => Promise<void>;
  deleteAccount: (accountId: number) => Promise<void>;
  setSearchQuery: (q: string) => void;
  filteredAccounts: () => Account[];
}

export const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [],
  isLoading: false,
  error: null,
  searchQuery: "",

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await commands.fetchAccounts();
      set({ accounts, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
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
