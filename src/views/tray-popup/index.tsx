import { useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccountsStore } from "@/stores/accounts-store";
import { useConnectionStore } from "@/stores/connection-store";
import { useOtpTimer } from "@/hooks/use-otp-timer";
import { TrayAccountItem } from "./tray-account-item";
import { TrayFooter } from "./tray-footer";
import { Toaster } from "sonner";

export function TrayPopupView() {
  const { isConfigured, checkConfiguration } = useConnectionStore();
  const {
    accounts,
    isLoading,
    searchQuery,
    fetchAccounts,
    setSearchQuery,
    filteredAccounts,
  } = useAccountsStore();

  useEffect(() => {
    checkConfiguration().then(() => {
      if (useConnectionStore.getState().isConfigured) {
        fetchAccounts();
      }
    });
  }, [checkConfiguration, fetchAccounts]);

  const handleRefresh = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const remaining = useOtpTimer(accounts, handleRefresh);
  const filtered = filteredAccounts();

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A] rounded-none p-4">
        <p className="text-xs text-[#94A3B8] text-center">
          Not configured. Open Settings to connect.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0F0F1A] rounded-none overflow-hidden">
      <div className="px-2 pt-2 pb-1">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="px-1">
          {filtered.length === 0 && (
            <p className="text-xs text-[#94A3B8] text-center py-4">
              {searchQuery ? "No matches" : "No accounts"}
            </p>
          )}
          {filtered.map((account) => (
            <TrayAccountItem
              key={account.id}
              account={account}
              remaining={remaining[account.id] ?? 0}
            />
          ))}
        </div>
      </ScrollArea>
      <TrayFooter onRefresh={handleRefresh} isLoading={isLoading} />
      <Toaster position="bottom-center" />
    </div>
  );
}
