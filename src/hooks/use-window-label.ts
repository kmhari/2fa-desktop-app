import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export function useWindowLabel(): string {
  try {
    return getCurrentWebviewWindow().label;
  } catch {
    return "main";
  }
}
