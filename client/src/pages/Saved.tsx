import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import { Loader2, ArrowLeft, Trash2, Heart, X, Star, Filter } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Saved() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");

  const utils = trpc.useUtils();

  // Fetch saved movies
  const { data: savedMovies, isLoading } = trpc.saved.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Remove saved movie mutation
  const removeMutation = trpc.saved.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from saved!");
      utils.saved.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to remove", {
        description: error.message,
      });
    },
  });

  // Swipe mutation (convert saved to swipe)
  const swipeMutation = trpc.swipes.swipe.useMutation({
    onSuccess: (data) => {
      if (data.matched) {
        toast.success("🎉 It's a Match!", {
          description: "Your group matched on this movie!",
        });
      } else {
        toast.success("Swipe recorded!");
      }
      // Remove from saved after swiping
      if (selectedMovie) {
        removeMutation.mutate({ movieId: selectedMovie.movieId });
      }
      utils.saved.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to record swipe", {
        description: error.message,
      });
    },
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSwipe = async (movie: any, direction: "left" | "right" | "up") => {
    setSelectedMovie(movie);
    await swipeMutation.mutateAsync({
      movieId: movie.movieId,
      movieTitle: movie.movieTitle,
      moviePoster: movie.moviePoster,
      movieType: movie.movieType,
      movieGenres: movie.movieGenres || [],
      movieRating: movie.movieRating || 0,
      direction,
    });
  };

  const handleRemove = (movieId: string) => {
    removeMutation.mutate({ movieId });
  };

  const handleViewDetails = (movie: any) => {
    setSelectedMovie(movie);
    setShowDetailsModal(true);
  };

  const filteredMovies = savedMovies?.filter((movie) => {
    if (filterType === "all") return true;
    return movie.movieType === filterType;
  });

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/5 backdrop-blur-xl border-white/10"
              onClick={() => setLocation("/swipe")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                Saved Movies
              </h1>
              <p className="text-white/70">
                Movies you saved for later
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              className={filterType === "all" ? "gradient-primary" : "bg-white/5 border-white/10"}
              onClick={() => setFilterType("all")}
            >
              All
            </Button>
            <Button
              variant={filterType === "movie" ? "default" : "outline"}
              size="sm"
              className={filterType === "movie" ? "gradient-primary" : "bg-white/5 border-white/10"}
              onClick={() => setFilterType("movie")}
            >
              Movies
            </Button>
            <Button
              variant={filterType === "tv" ? "default" : "outline"}
              size="sm"
              className={filterType === "tv" ? "gradient-primary" : "bg-white/5 border-white/10"}
              onClick={() => setFilterType("tv")}
            >
              TV Shows
            </Button>
          </div>
        </div>

        {/* Saved Movies Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : filteredMovies && filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden group"
              >
                <div className="relative aspect-[2/3]">
                  {movie.moviePoster ? (
                    <img
                      src={movie.moviePoster}
                      alt={movie.movieTitle}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleViewDetails(movie)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-6xl">🎬</span>
                    </div>
                  )}

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
                        {movie.movieTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/80 mb-3">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded">
                          {movie.movieType === "movie" ? "Movie" : "TV"}
                        </span>
                        {movie.movieRating && (
                          <span>⭐ {(movie.movieRating / 10).toFixed(1)}</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 h-8"
                          onClick={() => handleSwipe(movie, "left")}
                          disabled={swipeMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 h-8"
                          onClick={() => handleSwipe(movie, "right")}
                          disabled={swipeMutation.isPending}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 h-8"
                          onClick={() => handleSwipe(movie, "up")}
                          disabled={swipeMutation.isPending}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full mt-2 bg-white/10 hover:bg-white/20 h-8"
                        onClick={() => handleRemove(movie.movieId)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <p className="text-xl text-white/80 mb-2">No saved movies</p>
            <p className="text-white/60 mb-6">
              Swipe down on movies to save them for later
            </p>
            <Button onClick={() => setLocation("/swipe")} className="gradient-primary">
              Start Swiping
            </Button>
          </div>
        )}

        {/* Movie Details Modal */}
        {selectedMovie && (
          <MovieDetailsModal
            movieId={selectedMovie.movieId}
            movieType={selectedMovie.movieType}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedMovie(null);
            }}
            onSwipe={async (direction) => {
              await handleSwipe(selectedMovie, direction as "left" | "right" | "up");
              setShowDetailsModal(false);
              setSelectedMovie(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
