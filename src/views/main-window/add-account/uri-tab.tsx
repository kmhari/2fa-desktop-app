import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { commands } from "@/lib/tauri-commands";
import { useAccountsStore } from "@/stores/accounts-store";
import { Loader2 } from "lucide-react";
import type { AccountPreview } from "@/types";

interface UriTabProps {
  onClose: () => void;
}

export function UriTab({ onClose }: UriTabProps) {
  const [uri, setUri] = useState("");
  const [preview, setPreview] = useState<AccountPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await commands.previewAccount(uri.trim());
      setPreview(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await commands.createAccount({ uri: uri.trim() });
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
      <Textarea
        placeholder="otpauth://totp/Service:user@example.com?secret=..."
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        rows={3}
      />
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
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handlePreview}
          disabled={!uri.trim() || loading}
        >
          {loading && !preview && <Loader2 className="animate-spin" />}
          Preview
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={!preview || loading}
        >
          {loading && preview && <Loader2 className="animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}
