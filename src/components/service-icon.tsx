import { cn } from "@/lib/utils";

interface ServiceIconProps {
  icon: string | null;
  service: string | null;
  serverUrl?: string;
  size?: number;
  className?: string;
}

export function ServiceIcon({
  icon,
  service,
  size = 32,
  className,
}: ServiceIconProps) {
  const initial = (service ?? "?")[0].toUpperCase();

  if (icon) {
    return (
      <img
        src={icon}
        alt={service ?? ""}
        width={size}
        height={size}
        className={cn("rounded-none object-contain", className)}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-none bg-[#1A1A2E] flex items-center justify-center font-semibold text-[#94A3B8]",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </div>
  );
}
