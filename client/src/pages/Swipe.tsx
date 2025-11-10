import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import SwipeCard from "@/components/SwipeCard";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Settings } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Swipe() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [movies, setMovies] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);

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
      enabled: isAuthenticated,
    }
  );

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

  const handleSwipe = async (direction: "left" | "right" | "up" | "down") => {
    const movie = movies[currentIndex];
    if (!movie) return;

    // Record the swipe
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white text-shadow">
            AnyMatch
          </h1>
          <div className="flex items-center gap-4">
            {groups && groups.length > 0 && (
              <select
                value={currentGroupId || ""}
                onChange={(e) => setCurrentGroupId(Number(e.target.value))}
                className="glass-button text-sm"
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="glass"
              onClick={() => setLocation("/groups")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

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
      </div>
    </div>
  );
}
