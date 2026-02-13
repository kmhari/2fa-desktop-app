import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useUiStore } from "../stores/ui-store";
import { useCallback, useRef } from "react";

export function useClipboard() {
  const setCopiedId = useUiStore((s) => s.setCopiedId);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string, id: number) => {
      await writeText(text);
      setCopiedId(id);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopiedId(null), 2000);
    },
    [setCopiedId]
  );

  return copy;
}
