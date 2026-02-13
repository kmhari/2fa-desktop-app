import { Button } from "@/components/ui/button";
import { RefreshCw, Settings } from "lucide-react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

interface TrayFooterProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function TrayFooter({ onRefresh, isLoading }: TrayFooterProps) {
  const openSettings = async () => {
    const main = await WebviewWindow.getByLabel("main");
    if (main) {
      await main.show();
      await main.setFocus();
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-1.5 border-t border-[#2D2D44]">
      <Button
        variant="ghost"
        size="xs"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={isLoading ? "animate-spin" : ""} />
        Refresh
      </Button>
      <Button variant="ghost" size="xs" onClick={openSettings}>
        <Settings />
        Settings
      </Button>
    </div>
  );
}
