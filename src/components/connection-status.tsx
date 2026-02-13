import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  connected: boolean;
  label?: string;
}

export function ConnectionStatus({ connected, label }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "size-2 rounded-full",
          connected ? "bg-[#10B981]" : "bg-[#EF4444]"
        )}
      />
      {label && (
        <span className="text-xs text-[#94A3B8]">{label}</span>
      )}
    </div>
  );
}
