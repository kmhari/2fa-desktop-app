import { useEffect, useRef, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { PhysicalSize } from "@tauri-apps/api/dpi";
import { emit } from "@tauri-apps/api/event";
import { commands } from "@/lib/tauri-commands";
import { X } from "lucide-react";

export function ScanOverlay() {
  const [status, setStatus] = useState<"scanning" | "found">("scanning");
  const scanningRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const win = getCurrentWebviewWindow();

    let lastWidth = 0;
    const unlistenResize = win.onResized(async (e) => {
      const { width, height } = e.payload;
      if (width !== height && width !== lastWidth) {
        lastWidth = width;
        await win.setSize(new PhysicalSize(width, width));
      }
    });

    const scan = async () => {
      if (!scanningRef.current) return;

      try {
        const pos = await win.outerPosition();
        const size = await win.outerSize();

        await win.hide();
        await new Promise((r) => setTimeout(r, 60));

        const uri = await commands.scanScreenForQr(
          pos.x,
          pos.y,
          size.width,
          size.height
        );

        scanningRef.current = false;
        setStatus("found");

        await emit("qr-scan-result", { uri });
        await new Promise((r) => setTimeout(r, 500));
        await win.close();
        return;
      } catch {
        try {
          await win.show();
          await win.setFocus();
        } catch {
          // window closed
        }
      }

      if (scanningRef.current) {
        intervalRef.current = setTimeout(scan, 700);
      }
    };

    intervalRef.current = setTimeout(scan, 500);

    return () => {
      scanningRef.current = false;
      if (intervalRef.current) clearTimeout(intervalRef.current);
      unlistenResize.then((fn) => fn());
    };
  }, []);

  const handleCancel = async () => {
    scanningRef.current = false;
    if (intervalRef.current) clearTimeout(intervalRef.current);
    await emit("qr-scan-cancelled");
    const win = getCurrentWebviewWindow();
    await win.close();
  };

  return (
    <div
      className="h-screen w-screen select-none"
      data-tauri-drag-region
      style={{ background: "rgba(0,0,0,0.05)" }}
    >
      {/* Corner markers */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#F97316]/60" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#F97316]/60" />
      <div className="absolute bottom-10 left-2 w-6 h-6 border-b-2 border-l-2 border-[#F97316]/60" />
      <div className="absolute bottom-10 right-2 w-6 h-6 border-b-2 border-r-2 border-[#F97316]/60" />

      {/* Scanning line */}
      {status === "scanning" && (
        <div
          className="absolute inset-x-4 h-0.5 bg-[#F97316]/40"
          style={{ animation: "scanline 2s ease-in-out infinite" }}
        />
      )}

      {/* Found flash */}
      {status === "found" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 rounded-full bg-[#F97316]/80 flex items-center justify-center">
            <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Cancel button - bottom center */}
      <button
        onClick={handleCancel}
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1
                   px-2 py-0.5 rounded-none text-[10px] font-medium
                   bg-black/60 text-white/90 hover:bg-black/80 transition-colors shadow-lg backdrop-blur-sm"
      >
        <X className="size-2.5" /> Cancel
      </button>

      <style>{`
        @keyframes scanline {
          0%, 100% { top: 8px; }
          50% { top: calc(100% - 40px); }
        }
      `}</style>
    </div>
  );
}
