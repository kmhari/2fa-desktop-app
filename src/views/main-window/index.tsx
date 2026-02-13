import { useEffect } from "react";
import { useConnectionStore } from "@/stores/connection-store";
import { useUiStore } from "@/stores/ui-store";
import { WelcomeScreen } from "./welcome-screen";
import { SetupScreen } from "./setup-screen";
import { AccountsScreen } from "./accounts-screen";
import { Toaster } from "sonner";
import { UpdateChecker } from "@/components/update-checker";
import { Loader2 } from "lucide-react";

export function MainWindowView() {
  const { isConfigured, isLoading, checkConfiguration } = useConnectionStore();
  const { screen, setScreen } = useUiStore();

  useEffect(() => {
    checkConfiguration().then(() => {
      if (useConnectionStore.getState().isConfigured) {
        setScreen("accounts");
      }
    });
  }, [checkConfiguration, setScreen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isConfigured && screen !== "setup") {
    return (
      <>
        <AccountsScreen />
        <UpdateChecker />
        <Toaster position="bottom-center" />
      </>
    );
  }

  return (
    <>
      {screen === "setup" ? (
        <SetupScreen />
      ) : (
        <WelcomeScreen onGetStarted={() => setScreen("setup")} />
      )}
      <Toaster position="bottom-center" />
    </>
  );
}
