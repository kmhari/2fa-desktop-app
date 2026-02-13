import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commands } from "@/lib/tauri-commands";
import { useAccountsStore } from "@/stores/accounts-store";
import { Loader2 } from "lucide-react";

interface ManualTabProps {
  onClose: () => void;
}

export function ManualTab({ onClose }: ManualTabProps) {
  const [service, setService] = useState("");
  const [account, setAccount] = useState("");
  const [secret, setSecret] = useState("");
  const [otpType, setOtpType] = useState("totp");
  const [algorithm, setAlgorithm] = useState("sha1");
  const [digits, setDigits] = useState("6");
  const [period, setPeriod] = useState("30");
  const [counter, setCounter] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAccounts = useAccountsStore((s) => s.fetchAccounts);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await commands.createAccount({
        service: service || undefined,
        account: account || undefined,
        secret,
        otp_type: otpType,
        algorithm,
        digits: parseInt(digits),
        period: otpType === "totp" ? parseInt(period) : undefined,
        counter: otpType === "hotp" ? parseInt(counter) : undefined,
      });
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="m-service" className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Service</Label>
          <Input
            id="m-service"
            placeholder="GitHub"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-account" className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Account</Label>
          <Input
            id="m-account"
            placeholder="user@example.com"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-secret" className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Secret</Label>
        <Input
          id="m-secret"
          placeholder="Base32 encoded secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Type</Label>
          <Select value={otpType} onValueChange={setOtpType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totp">TOTP</SelectItem>
              <SelectItem value="hotp">HOTP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Algorithm</Label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sha1">SHA1</SelectItem>
              <SelectItem value="sha256">SHA256</SelectItem>
              <SelectItem value="sha512">SHA512</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Digits</Label>
          <Select value={digits} onValueChange={setDigits}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="8">8</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {otpType === "totp" && (
        <div className="space-y-1.5">
          <Label htmlFor="m-period" className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Period (seconds)</Label>
          <Input
            id="m-period"
            type="number"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      )}
      {otpType === "hotp" && (
        <div className="space-y-1.5">
          <Label htmlFor="m-counter" className="text-[#94A3B8] uppercase text-[11px] tracking-widest">Counter</Label>
          <Input
            id="m-counter"
            type="number"
            value={counter}
            onChange={(e) => setCounter(e.target.value)}
          />
        </div>
      )}
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      <Button
        className="w-full"
        onClick={handleSave}
        disabled={!secret || loading}
      >
        {loading && <Loader2 className="animate-spin" />}
        Save Account
      </Button>
    </div>
  );
}
