import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { commands } from "@/lib/tauri-commands";
import { useAccountsStore } from "@/stores/accounts-store";
import { Loader2, ScanLine } from "lucide-react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { listen } from "@tauri-apps/api/event";
import type { AccountPreview } from "@/types";

interface ScreenCaptureTabProps {
  onClose: () => void;
}

export function ScreenCaptureTab({ onClose }: ScreenCaptureTabProps) {
  const [uri, setUri] = useState<string | null>(null);
  const [preview, setPreview] = useState<AccountPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);
  const unlistenRef = useRef<(() => void) | null>(null);

  const unlistenCancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const setup = async () => {
      unlistenRef.current = await listen<{ uri: string }>(
        "qr-scan-result",
        async (event) => {
          const scannedUri = event.payload.uri;
          setUri(scannedUri);
          setScanning(false);
          setLoading(true);
          try {
            const result = await commands.previewAccount(scannedUri);
            setPreview(result);
          } catch (e) {
            setError(String(e));
          } finally {
            setLoading(false);
          }
        }
      );
      unlistenCancelRef.current = await listen("qr-scan-cancelled", () => {
        setScanning(false);
      });
    };
    setup();
    return () => {
      unlistenRef.current?.();
      unlistenCancelRef.current?.();
    };
  }, []);

  const handleScan = async () => {
    setError(null);
    setPreview(null);
    setUri(null);

    const hasPermission = await commands.checkScreenPermission();
    if (!hasPermission) {
      const granted = await commands.requestScreenPermission();
      if (!granted) {
        setError(
          "Screen recording permission is required. Grant it in System Settings → Privacy & Security → Screen Recording, then restart the app."
        );
        return;
      }
    }

    setScanning(true);
    try {
      new WebviewWindow("scan-overlay", {
        url: "/",
        title: "Scan QR Code",
        width: 300,
        height: 300,
        resizable: true,
        decorations: false,
        transparent: true,
        alwaysOnTop: true,
        center: true,
      });
    } catch (e) {
      setError(String(e));
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (!uri) return;
    setLoading(true);
    setError(null);
    try {
      await commands.createAccount({ uri });
      await fetchAccounts();
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 pt-3">
      <div className="text-center py-4">
        <ScanLine className="size-12 mx-auto mb-3 text-[#94A3B8]" />
        <p className="text-sm text-[#94A3B8] mb-4">
          Opens a scanner window you can drag over any QR code on screen.
          It scans continuously and auto-detects the code.
        </p>
        <Button onClick={handleScan} disabled={scanning || loading}>
          {scanning ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ScanLine />
          )}
          {scanning ? "Scanning..." : "Open Scanner"}
        </Button>
      </div>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      {preview && (
        <Card>
          <CardContent className="p-3 space-y-1">
            <p className="text-sm font-medium text-[#F8FAFC]">
              {preview.service ?? "Unknown"}
            </p>
            <p className="text-xs text-[#94A3B8]">{preview.account}</p>
            <p className="text-xs text-[#94A3B8]">
              {preview.otp_type.toUpperCase()} &middot; {preview.digits} digits
              &middot; {preview.algorithm}
            </p>
          </CardContent>
        </Card>
      )}
      {preview && (
        <Button className="w-full" onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Save Account
        </Button>
      )}
    </div>
  );
}
