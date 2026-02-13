import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useCallback, useState, type DragEvent } from "react";

interface DropZoneProps {
  onFile: (bytes: number[]) => void;
  className?: string;
}

export function DropZone({ onFile, className }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const buf = await file.arrayBuffer();
      onFile(Array.from(new Uint8Array(buf)));
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-none p-8 text-center transition-colors cursor-pointer bg-[#151524]",
        isDragging
          ? "border-[#F97316] bg-[#151524]"
          : "border-[#F97316]/40 hover:border-[#F97316]",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) handleFile(file);
        };
        input.click();
      }}
    >
      <Upload className="size-8 mx-auto mb-2 text-[#94A3B8]" />
      <p className="text-sm text-[#94A3B8]">
        Drop a QR code image here or click to select
      </p>
    </div>
  );
}
