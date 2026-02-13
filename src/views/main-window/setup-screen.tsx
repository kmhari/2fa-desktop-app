import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { commands } from "@/lib/tauri-commands";
import { useConnectionStore } from "@/stores/connection-store";
import { useUiStore } from "@/stores/ui-store";
import { ArrowLeft, Loader2, Shield } from "lucide-react";

export function SetupScreen() {
  const isConfigured = useConnectionStore((s) => s.isConfigured);
  const [serverUrl, setServerUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const setConfigured = useConnectionStore((s) => s.setConfigured);
  const setScreen = useUiStore((s) => s.setScreen);

  useEffect(() => {
    if (isConfigured) {
      commands.getCredentials().then((creds) => {
        setServerUrl(creds.server_url);
        setApiToken(creds.api_token);
      }).catch(() => {});
    }
  }, [isConfigured]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const user = await commands.verifyConnection(serverUrl, apiToken);
      setTestResult({
        ok: true,
        message: `Connected as ${user.name ?? user.email ?? "user"}`,
      });
    } catch (e) {
      setTestResult({ ok: false, message: String(e) });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await commands.saveCredentials(serverUrl, apiToken);
      setConfigured(true);
      setScreen("accounts");
    } catch (e) {
      setTestResult({ ok: false, message: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    await commands.clearCredentials();
    setConfigured(false);
    setScreen("welcome");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-3 bg-[#0F0F1A]">
      <Card className="w-full max-w-sm border-l-[1px] border-l-[#2D2D44]">
        <CardHeader className="text-center">
          {isConfigured && (
            <button
              className="absolute left-4 top-4 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              onClick={() => setScreen("accounts")}
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <Shield className="size-8 text-[#F97316] mx-auto mb-1" />
          <CardTitle className="text-lg">2FA Auth</CardTitle>
          <CardDescription className="text-[#94A3B8] text-xs">
            {isConfigured ? "Update your connection settings" : "Connect to your 2FAuth instance"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="server-url" className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Server URL</Label>
            <Input
              id="server-url"
              placeholder="https://2fauth.example.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="api-token" className="text-[#94A3B8] uppercase text-[11px] tracking-widest">API Token</Label>
            <Input
              id="api-token"
              type="password"
              placeholder="Your Personal Access Token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="text-xs"
            />
          </div>

          {testResult && (
            <Badge variant={testResult.ok ? "default" : "destructive"} className="w-full justify-center py-1">
              {testResult.message}
            </Badge>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={handleTest}
              disabled={!serverUrl || !apiToken || testing}
            >
              {testing && <Loader2 className="animate-spin" />}
              Test Connection
            </Button>
            <Button
              className="w-full text-xs"
              onClick={handleSave}
              disabled={!testResult?.ok || saving}
            >
              {saving && <Loader2 className="animate-spin" />}
              Save & Continue
            </Button>
          </div>
          {isConfigured && (
            <button
              className="w-full text-[11px] text-[#EF4444] hover:text-[#EF4444]/80 uppercase tracking-widest py-2 transition-colors"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
