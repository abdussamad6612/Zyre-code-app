"use client";
import { LucideGithub } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";

export default function LoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { signIn } = useAuth();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px] p-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/brand-assets/05F8029C-1DD1-40AD-97D8-29954B629E25.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 p-6">
          <div className="mb-2 flex flex-col items-center gap-10">
            <img src="/brand-assets/vibra-logo.png" alt="Vibra Logo" width={100} height={100} className="mt-6" />
            <DialogHeader>
              <DialogTitle className="sm:text-center text-white">Sign in to VibraCoder</DialogTitle>
              <DialogDescription className="sm:text-center text-white/80">Sign in to your account to continue.</DialogDescription>
            </DialogHeader>
          </div>
          <Button
            type="button"
            className="w-full bg-white text-black hover:bg-white/90"
            onClick={() => { signIn(); onOpenChange(false); }}
          >
            <LucideGithub />
            Login with Github
          </Button>
          <p className="text-center text-xs text-white/60 mt-2">This will open Github OAuth login page.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
