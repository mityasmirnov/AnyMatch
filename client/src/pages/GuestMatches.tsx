import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function GuestMatches() {
  const [, setLocation] = useLocation();
  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);

  const { data: sessionInfo, isLoading: sessionLoading } = trpc.guestSession.getSession.useQuery(
    { sessionCode },
    { enabled: sessionCode.length === 6 }
  );

  const { data: matches, isLoading: matchesLoading, refetch } = trpc.guestSession.getMatches.useQuery(
    { sessionId: sessionId! },
    { enabled: sessionId !== null }
  );

  useEffect(() => {
    if (sessionInfo) {
      setSessionId(sessionInfo.sessionId);
    }
  }, [sessionInfo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionCode.length !== 6) {
      toast.error("Session code must be 6 digits");
      return;
    }
    // Query will automatically trigger
  };

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 glass"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Guest Session Matches
          </h1>

          {!sessionId ? (
            <div className="glass-card max-w-md mx-auto p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-white/70 text-sm">Enter Session Code</label>
                  <Input
                    type="text"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="glass border-white/20 text-center text-3xl tracking-widest h-16"
                    maxLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sessionCode.length !== 6 || sessionLoading}
                  className="w-full gradient-primary h-12"
                >
                  {sessionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Users className="w-5 h-5 mr-2" />
                  )}
                  View Matches
                </Button>
              </form>

              {sessionInfo && sessionInfo.participantCount > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-white/70 text-sm">
                    {sessionInfo.participantCount} participant{sessionInfo.participantCount !== 1 ? "s" : ""} in this session
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Session Code</p>
                    <p className="text-3xl font-bold text-white tracking-wider">{sessionCode}</p>
                  </div>
                  {sessionInfo && (
                    <div className="text-right">
                      <p className="text-white/70 text-sm">Participants</p>
                      <p className="text-2xl font-bold text-white">{sessionInfo.participantCount}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Matches Grid */}
              {matchesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-white" />
                </div>
              ) : matches && matches.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    🎉 {matches.length} Match{matches.length !== 1 ? "es" : ""}!
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match) => (
                      <div key={match.movieId} className="glass-card group hover:scale-105 transition-transform">
                        <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                          {match.moviePoster ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w500${match.moviePoster}`}
                              alt={match.movieTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <span className="text-6xl">🎬</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-white text-sm font-semibold">
                              ⭐ {match.movieRating ? match.movieRating.toFixed(1) : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                            {match.movieTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <span className="capitalize">{match.movieType}</span>
                            {match.matchedBy && (
                              <>
                                <span>•</span>
                                <span>{match.matchedBy.length} liked</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 glass-card p-6 text-center">
                    <p className="text-white/70 mb-4">
                      Want to save these matches and get more features?
                    </p>
                    <Button
                      onClick={() => setLocation("/swipe")}
                      className="gradient-primary"
                    >
                      Sign Up & Continue Swiping
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <span className="text-6xl mb-4 block">🎬</span>
                  <h3 className="text-2xl font-bold text-white mb-2">No Matches Yet</h3>
                  <p className="text-white/70 mb-6">
                    Keep swiping! Matches appear when all participants like the same movie.
                  </p>
                  <Button
                    onClick={() => setLocation("/swipe")}
                    className="gradient-primary"
                  >
                    Start Swiping
                  </Button>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSessionId(null);
                    setSessionCode("");
                  }}
                  className="glass border-white/20"
                >
                  View Different Session
                </Button>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="glass border-white/20"
                >
                  Refresh Matches
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
