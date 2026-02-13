import { useState, useEffect, useCallback } from "react";
import { ServiceIcon } from "@/components/service-icon";
import { OtpCode } from "@/components/otp-code";
import { CountdownRing } from "@/components/countdown-ring";
import { DEFAULT_PERIOD } from "@/lib/constants";
import { useAccountsStore } from "@/stores/accounts-store";
import { useClipboard } from "@/hooks/use-clipboard";
import { useUiStore } from "@/stores/ui-store";
import { commands } from "@/lib/tauri-commands";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import type { Account } from "@/types";

interface TrayAccountItemProps {
  account: Account;
  remaining: number;
}

export function TrayAccountItem({ account, remaining }: TrayAccountItemProps) {
  const period = account.period ?? DEFAULT_PERIOD;
  const deleteAccount = useAccountsStore((s) => s.deleteAccount);
  const copy = useClipboard();
  const copiedId = useUiStore((s) => s.copiedId);
  const isCopied = copiedId === account.id;
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const close = useCallback(() => {
    setMenu(null);
    setConfirming(false);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const handler = () => close();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [menu, close]);

  return (
    <div
      className={`relative flex items-center gap-1.5 px-2 py-1 rounded-none cursor-pointer transition-all hover:bg-[#1A1A2E]${isCopied ? " bg-[#F97316]/10" : ""}`}
      onClick={() => {
        if (account.otp && !menu) copy(account.otp.password, account.id);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
        setConfirming(false);
      }}
    >
      <ServiceIcon icon={account.icon} service={account.service} size={24} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-[#F8FAFC]">
          {account.service ?? "Unknown"}
        </p>
      </div>
      {account.otp && (
        <div className="flex items-center gap-1.5">
          {isCopied ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">Copied!</span>
          ) : (
            <OtpCode
              code={account.otp.password}
              accountId={account.id}
              className="text-sm"
            />
          )}
          {account.otp_type === "totp" && (
            <CountdownRing remaining={remaining} period={period} size={22} />
          )}
        </div>
      )}
      {menu && (
        <div
          className="fixed z-50 min-w-[140px] rounded-none border border-[#2D2D44] bg-[#1E1E32] p-1 shadow-md"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {!confirming ? (
            <>
              <button
                className="w-full rounded-none px-2 py-1.5 text-sm text-[#F8FAFC] hover:bg-[#1A1A2E] text-left"
                onClick={async () => {
                  try {
                    const creds = await commands.getCredentials();
                    const url = `${creds.server_url}/api/v1/twofaccounts/${account.id}/otp`;
                    const curl = `curl -s -H "Authorization: Bearer ${creds.api_token}" "${url}"`;
                    await writeText(curl);
                  } catch {}
                  close();
                }}
              >
                Copy cURL
              </button>
              <button
                className="w-full rounded-none px-2 py-1.5 text-sm text-red-500 hover:bg-[#1A1A2E] text-left"
                onClick={() => setConfirming(true)}
              >
                Delete
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="px-2 py-1 text-xs text-[#94A3B8]">Are you sure?</p>
              <div className="flex gap-1">
                <button
                  className="flex-1 rounded-none px-2 py-1 text-xs text-red-500 hover:bg-[#1A1A2E]"
                  onClick={() => {
                    deleteAccount(account.id);
                    close();
                  }}
                >
                  Yes
                </button>
                <button
                  className="flex-1 rounded-none px-2 py-1 text-xs text-[#F8FAFC] hover:bg-[#1A1A2E]"
                  onClick={close}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
