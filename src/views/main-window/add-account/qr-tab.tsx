import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropZone } from "@/components/drop-zone";
import { commands } from "@/lib/tauri-commands";
import { useAccountsStore } from "@/stores/accounts-store";
import { Loader2 } from "lucide-react";
import type { AccountPreview } from "@/types";

interface QrTabProps {
  onClose: () => void;
}

export function QrTab({ onClose }: QrTabProps) {
  const [uri, setUri] = useState<string | null>(null);
  const [preview, setPreview] = useState<AccountPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);

  const handleFile = async (bytes: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const decoded = await commands.decodeQr(bytes);
      setUri(decoded);
      const result = await commands.previewAccount(decoded);
      setPreview(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
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
      <DropZone onFile={handleFile} />
      {loading && (
        <div className="flex justify-center">
          <Loader2 className="animate-spin text-[#94A3B8]" />
        </div>
      )}
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      {preview && (
        <Card>
          <CardContent className="p-3 space-y-1">
            <p className="text-sm font-medium text-[#F8FAFC]">{preview.service ?? "Unknown"}</p>
            <p className="text-xs text-[#94A3B8]">{preview.account}</p>
            <p className="text-xs text-[#94A3B8]">
              {preview.otp_type.toUpperCase()} &middot; {preview.digits} digits &middot;{" "}
              {preview.algorithm}
            </p>
          </CardContent>
        </Card>
      )}
      {preview && (
        <Button className="w-full" onClick={handleSave} disabled={loading}>
          Save Account
        </Button>
      )}
    </div>
  );
}
