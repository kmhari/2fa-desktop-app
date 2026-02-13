import { useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";

export function UpdateChecker() {
  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const update = await check();
        if (update) {
          toast("Update Available", {
            description: `Version ${update.version} is ready to install.`,
            duration: Infinity,
            action: {
              label: "INSTALL",
              onClick: async () => {
                try {
                  await update.downloadAndInstall();
                  await relaunch();
                } catch {
                  toast.error("Update failed. Try again later.");
                }
              },
            },
          });
        }
      } catch {
        // silently fail — user may be offline
      }
    };

    const timer = setTimeout(checkForUpdate, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
