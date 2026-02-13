import { useWindowLabel } from "./hooks/use-window-label";
import { TrayPopupView } from "./views/tray-popup";
import { MainWindowView } from "./views/main-window";
import { ScanOverlay } from "./components/scan-overlay";

export function App() {
  const label = useWindowLabel();

  if (label === "tray-popup") return <TrayPopupView />;
  if (label === "scan-overlay") return <ScanOverlay />;
  return <MainWindowView />;
}
