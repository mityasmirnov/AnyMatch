import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SessionJoin() {
  const [, params] = useRoute("/session/:code");
  const [, setLocation] = useLocation();
  const [guestIdentifier] = useState(() => `guest_${Math.random().toString(36).substr(2, 9)}`);
  const sessionCode = params?.code || "";

  const joinMutation = trpc.guestSession.join.useMutation({
    onSuccess: (data) => {
      toast.success(`Joined session ${sessionCode}!`);
      // Store session info in localStorage for the Swipe page
      localStorage.setItem("guestSessionId", data.sessionId.toString());
      localStorage.setItem("guestSessionCode", data.sessionCode);
      localStorage.setItem("guestIdentifier", guestIdentifier);
      // Redirect to swipe page
      setLocation("/swipe");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join session");
      setLocation("/");
    },
  });

  useEffect(() => {
    if (sessionCode && sessionCode.length === 6) {
      // Automatically join the session
      joinMutation.mutate({ sessionCode });
    } else {
      toast.error("Invalid session code");
      setLocation("/");
    }
  }, [sessionCode]);

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center">
      <div className="glass-card p-12 text-center max-w-md">
        <Loader2 className="w-16 h-16 animate-spin text-white mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Joining Session</h2>
        <p className="text-white/70">
          Connecting you to session <span className="font-mono text-xl">{sessionCode}</span>...
        </p>
      </div>
    </div>
  );
}
