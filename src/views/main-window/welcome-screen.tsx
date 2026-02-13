import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#0F0F1A]">
      <Shield className="size-10 text-[#F97316] mb-4" />
      <h1 className="text-2xl font-bold tracking-tight mb-2 text-[#F8FAFC]">2FA Auth</h1>
      <p className="text-[#94A3B8] max-w-xs mb-6 text-sm">
        A desktop client for your self-hosted 2FAuth instance. View and manage
        your two-factor authentication codes.
      </p>
      <Button size="lg" onClick={onGetStarted}>
        Get Started <ArrowRight />
      </Button>
    </div>
  );
}
