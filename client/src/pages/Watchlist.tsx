import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Trash2, Check, X, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import MovieDetailsModal from "@/components/MovieDetailsModal";

export default function Watchlist() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Fetch watchlist
  const { data: watchlist, isLoading, refetch } = trpc.watchlist.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Remove from watchlist mutation
  const removeMutation = trpc.watchlist.remove.useMutation({
    onSuccess: () => {
      toast.success("Removed from watchlist");
      refetch();
    },
    onError: () => {
      toast.error("Failed to remove from watchlist");
    },
  });

  // Toggle watched mutation
  const toggleWatchedMutation = trpc.watchlist.toggleWatched.useMutation({
    onSuccess: () => {
      toast.success("Updated watch status");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update watch status");
    },
  });

  const handleRemove = (movieId: string) => {
    removeMutation.mutate({ movieId });
  };

  const handleToggleWatched = (movieId: string, currentStatus: boolean) => {
    toggleWatchedMutation.mutate({ movieId, watched: !currentStatus });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter watchlist
  const filteredWatchlist = watchlist?.filter((item) => {
    if (filter === "all") return true;
    return item.movieType === filter;
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="glass-panel p-6 mb-6">
        <div className="container max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground mb-4">
            Movies and TV shows you want to watch
          </p>

          {/* Filter */}
          <div className="flex gap-2">
            {["all", "movie", "tv"].map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                onClick={() => setFilter(type as any)}
                size="sm"
              >
                {type === "all" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
              </Button>
            ))}
          </div>

          {/* Stats */}
          {watchlist && (
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <span>Total: {watchlist.length}</span>
              <span>Watched: {watchlist.filter((i) => i.watched).length}</span>
              <span>Unwatched: {watchlist.filter((i) => !i.watched).length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Watchlist Grid */}
      <div className="container max-w-6xl px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredWatchlist && filteredWatchlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredWatchlist.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-lg overflow-hidden group relative"
              >
                {/* Poster */}
                <div
                  className="relative aspect-[2/3] cursor-pointer"
                  onClick={() =>
                    setSelectedMovie({
                      id: item.movieId,
                      title: item.movieTitle,
                      media_type: item.movieType,
                    })
                  }
                >
                  {item.moviePoster ? (
                    <img
                      src={item.moviePoster}
                      alt={item.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                  )}

                  {/* Watched Badge */}
                  {item.watched && (
                    <div className="absolute top-2 left-2 bg-green-500 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Watched
                    </div>
                  )}

                  {/* Rating Badge */}
                  {item.movieRating && item.movieRating > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ⭐ {(item.movieRating / 10).toFixed(1)}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWatched(item.movieId, item.watched);
                      }}
                      disabled={toggleWatchedMutation.isPending}
                      className="w-full"
                    >
                      {item.watched ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Mark Unwatched
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Mark Watched
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.movieId);
                      }}
                      disabled={removeMutation.isPending}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {item.movieTitle}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.movieYear || "N/A"}</span>
                    <span className="capitalize">{item.movieType}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    Added from: {item.addedFrom}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start adding movies from Browse, Swipe, or Matches
            </p>
            <Button onClick={() => setLocation("/browse")}>Browse Movies</Button>
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movieId={selectedMovie.id.toString()}
          movieType={selectedMovie.media_type}
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
