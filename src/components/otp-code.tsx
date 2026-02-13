import { cn } from "@/lib/utils";
import { useClipboard } from "@/hooks/use-clipboard";
import { useUiStore } from "@/stores/ui-store";

interface OtpCodeProps {
  code: string;
  accountId: number;
  className?: string;
}

function formatCode(code: string): string {
  const mid = Math.ceil(code.length / 2);
  return code.slice(0, mid) + " " + code.slice(mid);
}

export function OtpCode({ code, accountId, className }: OtpCodeProps) {
  const copy = useClipboard();
  const copiedId = useUiStore((s) => s.copiedId);
  const isCopied = copiedId === accountId;

  return (
    <button
      onClick={() => copy(code, accountId)}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-lg font-bold tracking-wider",
        "hover:text-primary/80 transition-colors cursor-pointer select-none",
        isCopied && "text-[#F97316]",
        className
      )}
      title="Click to copy"
    >
      <span>{formatCode(code)}</span>
    </button>
  );
}
