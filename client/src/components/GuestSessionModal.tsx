import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Copy, Users } from "lucide-react";

interface GuestSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionJoined: (sessionId: number, sessionCode: string) => void;
}

export default function GuestSessionModal({ isOpen, onClose, onSessionJoined }: GuestSessionModalProps) {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [joinCode, setJoinCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const createMutation = trpc.guestSession.create.useMutation({
    onSuccess: (data) => {
      setCreatedCode(data.sessionCode);
      setMode("create");
      toast.success("Session created! Share the code with your friends.");
    },
    onError: () => {
      toast.error("Failed to create session");
    },
  });

  const joinMutation = trpc.guestSession.join.useMutation({
    onSuccess: (data) => {
      toast.success("Joined session!");
      onSessionJoined(data.sessionId, data.sessionCode);
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join session");
    },
  });

  const handleCreateSession = () => {
    createMutation.mutate();
  };

  const handleJoinSession = () => {
    if (joinCode.length !== 6) {
      toast.error("Session code must be 6 digits");
      return;
    }
    joinMutation.mutate({ sessionCode: joinCode });
  };

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      toast.success("Code copied to clipboard!");
    }
  };

  const handleStartSwiping = () => {
    if (createdCode) {
      onSessionJoined(0, createdCode); // Will get actual session ID from backend
      onClose();
    }
  };

  const handleReset = () => {
    setMode("choice");
    setJoinCode("");
    setCreatedCode(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Guest Session
          </DialogTitle>
        </DialogHeader>

        {mode === "choice" && (
          <div className="space-y-4">
            <p className="text-white/70">
              Create a temporary session to swipe movies with friends without creating an account.
              Sessions expire after 24 hours.
            </p>

            <div className="grid gap-3">
              <Button
                onClick={handleCreateSession}
                disabled={createMutation.isPending}
                className="w-full h-16 text-lg gradient-primary"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Users className="w-5 h-5 mr-2" />
                )}
                Create New Session
              </Button>

              <Button
                onClick={() => setMode("join")}
                variant="outline"
                className="w-full h-16 text-lg glass border-white/20"
              >
                Join Existing Session
              </Button>
            </div>
          </div>
        )}

        {mode === "create" && createdCode && (
          <div className="space-y-6">
            <div className="glass-card text-center p-6 space-y-4">
              <p className="text-white/70">Your Session Code</p>
              <div className="text-6xl font-bold text-white tracking-widest">
                {createdCode}
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="glass border-white/20"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>

            <p className="text-white/70 text-center text-sm">
              Share this code with your friends so they can join your session and start swiping together!
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 glass border-white/20"
              >
                Back
              </Button>
              <Button
                onClick={handleStartSwiping}
                className="flex-1 gradient-primary"
              >
                Start Swiping
              </Button>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Enter Session Code</label>
              <Input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="glass border-white/20 text-center text-3xl tracking-widest h-16"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 glass border-white/20"
              >
                Back
              </Button>
              <Button
                onClick={handleJoinSession}
                disabled={joinCode.length !== 6 || joinMutation.isPending}
                className="flex-1 gradient-primary"
              >
                {joinMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Join Session
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
