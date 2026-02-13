import { useEffect, useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAccountsStore } from "@/stores/accounts-store";
import { useUiStore } from "@/stores/ui-store";
import { useOtpTimer } from "@/hooks/use-otp-timer";
import { useClipboard } from "@/hooks/use-clipboard";
import { AccountItem } from "./account-item";
import { AddAccountDialog } from "./add-account";
import { Plus, RefreshCw, Settings, Loader2 } from "lucide-react";


export function AccountsScreen() {
  const {
    accounts,
    isLoading,
    error,
    searchQuery,
    fetchAccounts,
    setSearchQuery,
    filteredAccounts,
  } = useAccountsStore();
  const { addDialogOpen, setAddDialogOpen } = useUiStore();
  const copy = useClipboard();
  const searchRef = useRef<HTMLInputElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleRefresh = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const remaining = useOtpTimer(accounts, handleRefresh);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      const items = filteredAccounts();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const idx = focusedIndex === -1 ? 0 : focusedIndex;
        const acc = items[idx];
        if (acc?.otp) {
          copy(acc.otp.password, acc.id);
        }
      } else if (e.key === "Escape") {
        searchRef.current?.blur();
        setFocusedIndex(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focusedIndex, filteredAccounts, copy]);

  const filtered = filteredAccounts();

  const setScreen = useUiStore((s) => s.setScreen);

  return (
    <div className="flex flex-col h-screen bg-[#0F0F1A]">
      <div className="px-3 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold text-[#F8FAFC]">2FA Accounts</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setScreen("setup")}
            >
              <Settings />
            </Button>
          </div>
        </div>
        <Input
          ref={searchRef}
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Separator className="bg-[#2D2D44]" />
      <ScrollArea className="flex-1">
        <div className="p-2">
          {error && (
            <p className="text-sm text-[#EF4444] p-3">{error}</p>
          )}
          {!isLoading && filtered.length === 0 && !error && (
            <div className="text-center py-8 text-[#94A3B8]">
              <p className="text-sm">
                {searchQuery ? "No matching accounts" : "No accounts yet"}
              </p>
              {!searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setAddDialogOpen(true)}
                >
                  Add your first account
                </Button>
              )}
            </div>
          )}
          {filtered.map((account, index) => (
            <AccountItem
              key={account.id}
              account={account}
              remaining={remaining[account.id] ?? 0}
              isFocused={index === focusedIndex}
            />
          ))}
        </div>
      </ScrollArea>
      <AddAccountDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}
