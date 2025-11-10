import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import SwipeCard from "@/components/SwipeCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import GuestSessionModal from "@/components/GuestSessionModal";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Settings, Info, Bookmark, Users } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Swipe() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [movies, setMovies] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<number | null>(null);
  const [guestSessionCode, setGuestSessionCode] = useState<string | null>(null);
  const [guestIdentifier] = useState(() => `guest_${Math.random().toString(36).substr(2, 9)}`);

  // Fetch user groups
  const { data: groups } = trpc.groups.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch movies
  const { data: moviesData, isLoading: moviesLoading, refetch } = trpc.movies.discover.useQuery(
    {
      type: "both",
      page: 1,
    },
    {
      enabled: true, // No auth required for browsing movies
    }
  );

  // Guest swipe mutation
  const guestSwipeMutation = trpc.guestSession.swipe.useMutation({
    onSuccess: (data) => {
      if (data.matched) {
        toast.success("🎉 It's a Match!", {
          description: "You and your friends matched on this movie!",
        });
      }
    },
  });

  // Swipe mutation
  const swipeMutation = trpc.swipes.swipe.useMutation({
    onSuccess: (data) => {
      if (data.matched) {
        toast.success("🎉 It's a Match!", {
          description: "Your group matched on this movie!",
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to record swipe", {
        description: error.message,
      });
    },
  });

  // Undo mutation
  const undoMutation = trpc.swipes.undo.useMutation({
    onSuccess: (data) => {
      toast.success("Swipe undone!");
      // Add the movie back to the stack
      if (data.movie) {
        setMovies((prev) => [
          {
            id: data.movie.movieId,
            title: data.movie.movieTitle,
            poster: data.movie.moviePoster,
            type: data.movie.movieType,
            rating: data.movie.movieRating,
            genres: data.movie.movieGenres || [],
            overview: "",
            backdrop: null,
            releaseDate: "",
          },
          ...prev,
        ]);
        setCurrentIndex(0);
      }
    },
  });

  useEffect(() => {
    if (moviesData) {
      setMovies(moviesData);
    }
  }, [moviesData]);

  // Select first group by default
  useEffect(() => {
    if (groups && groups.length > 0 && !currentGroupId) {
      setCurrentGroupId(groups[0].id);
    }
  }, [groups, currentGroupId]);

  // No redirect - allow swiping without login

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Allow guests to swipe, but show login prompt for certain features

  const handleSwipe = async (direction: "left" | "right" | "up" | "down") => {
    const movie = movies[currentIndex];
    if (!movie) return;

    // Check if login required for certain actions
    if (!isAuthenticated && !guestSessionId && (direction === "up" || direction === "down")) {
      toast.error("Please login to use Super Like or Save features");
      return;
    }

    // Record the swipe
    if (guestSessionId) {
      // Guest session swipe
      await guestSwipeMutation.mutateAsync({
        sessionId: guestSessionId,
        guestIdentifier,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        movieType: movie.type,
        movieGenres: movie.genres,
        movieRating: movie.rating,
        direction,
      });
    } else if (isAuthenticated) {
      // Authenticated user swipe
      await swipeMutation.mutateAsync({
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        movieType: movie.type,
        movieGenres: movie.genres,
        movieRating: movie.rating,
        direction,
        groupId: currentGroupId || undefined,
      });
    }

    // Move to next movie
    setCurrentIndex((prev) => prev + 1);

    // Load more movies if running low
    if (currentIndex >= movies.length - 3) {
      refetch();
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      undoMutation.mutate();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentMovie = movies[currentIndex];

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Guest Session Banner */}
        {!isAuthenticated && !guestSessionId && (
          <div className="mb-6 glass-card text-center p-6">
            <h3 className="text-xl font-bold text-white mb-2">Swipe Together!</h3>
            <p className="text-white/70 mb-4">
              Create or join a guest session to match movies with friends without signing up.
            </p>
            <Button
              onClick={() => setShowGuestModal(true)}
              className="gradient-primary"
            >
              <Users className="w-4 h-4 mr-2" />
              Start Guest Session
            </Button>
          </div>
        )}

        {/* Active Guest Session Info */}
        {guestSessionId && guestSessionCode && (
          <div className="mb-6 glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Guest Session</p>
                <p className="text-2xl font-bold text-white tracking-wider">{guestSessionCode}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/20"
                onClick={() => {
                  setGuestSessionId(null);
                  setGuestSessionCode(null);
                }}
              >
                Leave Session
              </Button>
            </div>
          </div>
        )}

        {/* Group Selector */}
        {groups && groups.length > 0 && (
          <div className="mb-8">
            <label className="block text-white/70 text-sm mb-2">Active Group</label>
            <select
              value={currentGroupId || ""}
              onChange={(e) => setCurrentGroupId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-lg px-4 py-3"
            >
              <option value="">Solo Mode</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Swipe Area */}
        <div className="max-w-md mx-auto">
          {moviesLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
          ) : currentMovie ? (
            <div className="relative h-[600px]">
              {/* Stack of cards (show next 2 cards behind) */}
              {movies.slice(currentIndex, currentIndex + 3).map((movie, index) => (
                <SwipeCard
                  key={`${movie.id}-${currentIndex + index}`}
                  movie={movie}
                  onSwipe={index === 0 ? handleSwipe : () => {}}
                  style={{
                    zIndex: 3 - index,
                    scale: 1 - index * 0.05,
                    opacity: 1 - index * 0.3,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] glass-card">
              <p className="text-xl text-white/80 mb-4">No more movies!</p>
              <Button onClick={() => refetch()} className="gradient-primary">
                Load More
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="ghost"
              size="icon"
              className="glass w-14 h-14 rounded-full"
              onClick={() => setShowDetailsModal(true)}
              disabled={!currentMovie}
            >
              <Info className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="glass w-14 h-14 rounded-full"
              onClick={handleUndo}
              disabled={currentIndex === 0 || undoMutation.isPending}
            >
              <RotateCcw className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="glass w-16 h-16 rounded-full bg-red-500/20"
              onClick={() => handleSwipe("left")}
            >
              <span className="text-3xl">👎</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="glass w-16 h-16 rounded-full bg-green-500/20"
              onClick={() => handleSwipe("right")}
            >
              <span className="text-3xl">👍</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="glass w-14 h-14 rounded-full bg-blue-500/20"
              onClick={() => handleSwipe("up")}
            >
              <span className="text-2xl">⭐</span>
            </Button>
          </div>

          {/* Instructions */}
          <div className="mt-8 glass-card text-center">
            <p className="text-sm text-white/70">
              Swipe or use buttons: 👎 Dislike | 👍 Like | ⭐ Super Like | ↓ Save
            </p>
          </div>
        </div>

        {/* Movie Details Modal */}
        {currentMovie && (
          <MovieDetailsModal
            movieId={currentMovie.id}
            movieType={currentMovie.type}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onSwipe={handleSwipe}
          />
        )}

        {/* Guest Session Modal */}
        <GuestSessionModal
          isOpen={showGuestModal}
          onClose={() => setShowGuestModal(false)}
          onSessionJoined={(sessionId, sessionCode) => {
            setGuestSessionId(sessionId);
            setGuestSessionCode(sessionCode);
            toast.success(`Joined session ${sessionCode}!`);
          }}
        />
      </div>
    </div>
  );
}
