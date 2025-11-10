import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

export default function Matches() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const groupId = params.id ? parseInt(params.id) : null;

  const utils = trpc.useUtils();

  // Fetch group details
  const { data: group } = trpc.groups.get.useQuery(
    { groupId: groupId! },
    { enabled: isAuthenticated && groupId !== null }
  );

  // Fetch matches
  const { data: matches, isLoading } = trpc.groups.getMatches.useQuery(
    { groupId: groupId! },
    { enabled: isAuthenticated && groupId !== null }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (!groupId) {
    setLocation("/groups");
    return null;
  }

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="glass"
            onClick={() => setLocation("/groups")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white text-shadow">
              {group?.name || "Group Matches"}
            </h1>
            <p className="text-white/70">
              Movies everyone in your group liked
            </p>
          </div>
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="glass border-white/20 overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="relative aspect-[2/3]">
                  {match.moviePoster ? (
                    <img
                      src={match.moviePoster}
                      alt={match.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-6xl">🎬</span>
                    </div>
                  )}
                  
                  {/* Watched badge */}
                  {match.watched && (
                    <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm p-2 rounded-full">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Overlay with info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm mb-1">
                        {match.movieTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded">
                          {match.movieType === "movie" ? "Movie" : "TV"}
                        </span>
                        <span>⭐ {((match.movieRating || 0) / 10).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card">
            <p className="text-xl text-white/80 mb-2">No matches yet</p>
            <p className="text-white/60 mb-6">
              Start swiping to find movies everyone loves!
            </p>
            <Button onClick={() => setLocation("/swipe")} className="gradient-primary">
              Start Swiping
            </Button>
          </div>
        )}

        {/* Group Members */}
        {group && (
          <div className="mt-12 glass-card">
            <h2 className="text-xl font-bold text-white mb-4">Group Members</h2>
            <div className="flex flex-wrap gap-3">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-sm font-semibold">
                    {member.userId.toString()[0]}
                  </div>
                  <span>User {member.userId}</span>
                  {member.role === "owner" && (
                    <span className="text-xs px-2 py-1 bg-purple-500/30 rounded-full">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
