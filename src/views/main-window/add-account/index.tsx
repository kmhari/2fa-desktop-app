import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UriTab } from "./uri-tab";
import { QrTab } from "./qr-tab";
import { ScreenCaptureTab } from "./screen-capture-tab";
import { ManualTab } from "./manual-tab";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="uri">
          <TabsList className="w-full">
            <TabsTrigger value="uri" className="flex-1">URI</TabsTrigger>
            <TabsTrigger value="qr" className="flex-1">QR Image</TabsTrigger>
            <TabsTrigger value="scan" className="flex-1">Scan</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="uri">
            <UriTab onClose={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="qr">
            <QrTab onClose={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="scan">
            <ScreenCaptureTab onClose={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="manual">
            <ManualTab onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
