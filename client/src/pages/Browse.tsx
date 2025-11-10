import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Search, Filter, Plus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import StreamingProviderFilter from "@/components/StreamingProviderFilter";

export default function Browse() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [contentType, setContentType] = useState<"movie" | "tv" | "both">("both");
  const [sortBy, setSortBy] = useState<"popularity" | "rating" | "release_date">("popularity");
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<any[]>([]);

  const toggleProvider = (providerId: number) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId]
    );
  };

  // No redirect - allow browsing without login

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch genres
  const { data: genresData } = trpc.movies.getGenres.useQuery(undefined, {
    enabled: true, // Always enabled, no auth required
  });
  const allGenres = genresData
    ? [...genresData.movieGenres, ...genresData.tvGenres]
    : [];
  // Remove duplicates
  const genres = Array.from(new Map(allGenres.map((g) => [g.id, g])).values());

  // Fetch movies based on search or discover
  const { data: movies, isLoading: moviesLoading, isFetching: moviesFetching } = trpc.movies.discover.useQuery(
    {
      type: contentType,
      page: page,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    },
    {
      enabled: debouncedQuery === "", // No auth required
    }
  );

  const { data: searchResults, isLoading: searchLoading, isFetching: searchFetching } = trpc.movies.search.useQuery(
    {
      query: debouncedQuery,
      page: page,
    },
    {
      enabled: debouncedQuery.length > 0, // No auth required
    }
  );

  // Accumulate movies for infinite scroll
  useEffect(() => {
    if (movies && !debouncedQuery) {
      if (page === 1) {
        setAllMovies(movies);
      } else {
        setAllMovies((prev) => [...prev, ...movies]);
      }
    }
  }, [movies, page, debouncedQuery]);

  useEffect(() => {
    if (searchResults && debouncedQuery) {
      if (page === 1) {
        setAllMovies(searchResults);
      } else {
        setAllMovies((prev) => [...prev, ...searchResults]);
      }
    }
  }, [searchResults, page, debouncedQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setAllMovies([]);
  }, [debouncedQuery, selectedGenres, contentType]);

  const displayMovies = allMovies;
  const isLoading = (page === 1) && (debouncedQuery ? searchLoading : moviesLoading);
  const isFetching = debouncedQuery ? searchFetching : moviesFetching;

  // Check which movies are in watchlist
  const movieIds = displayMovies?.map((m: any) => m.id.toString()) || [];
  const { data: watchlistStatus } = trpc.watchlist.checkMultiple.useQuery(
    { movieIds },
    { enabled: isAuthenticated && movieIds.length > 0 }
  );

  const isInWatchlist = (movieId: string) => {
    return watchlistStatus?.find((s) => s.movieId === movieId)?.inWatchlist || false;
  };

  // Add to watchlist mutation
  const addToWatchlistMutation = trpc.watchlist.add.useMutation({
    onSuccess: (data) => {
      if (data.alreadyExists) {
        toast.info("Already in watchlist");
      } else {
        toast.success("Added to watchlist!");
      }
    },
    onError: () => {
      toast.error("Failed to add to watchlist");
    },
  });

  const handleAddToWatchlist = (movie: any) => {
    if (!isAuthenticated) {
      toast.error("Please login to add to watchlist");
      return;
    }
    addToWatchlistMutation.mutate({
      movieId: movie.id.toString(),
      movieTitle: movie.title || movie.name,
      moviePoster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      movieType: movie.media_type === "tv" || movie.first_air_date ? "tv" : "movie",
      movieGenres: movie.genre_ids || [],
      movieRating: movie.vote_average ? Math.round(movie.vote_average * 10) : 0,
      movieYear: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : movie.first_air_date
        ? new Date(movie.first_air_date).getFullYear()
        : undefined,
      addedFrom: debouncedQuery ? "search" : "browse",
    });
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="glass-panel sticky top-16 z-10 p-4 mb-6">
        <div className="container max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Browse & Search Movies</h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search movies and TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 space-y-4 glass-panel p-4 rounded-lg">
              {/* Content Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content Type</label>
                <div className="flex gap-2">
                  {["both", "movie", "tv"].map((type) => (
                    <Button
                      key={type}
                      variant={contentType === type ? "default" : "outline"}
                      onClick={() => setContentType(type as any)}
                      size="sm"
                    >
                      {type === "both" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Year Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="From"
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className="glass-input"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  <Input
                    type="number"
                    placeholder="To"
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="glass-input"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="text-sm font-medium mb-2 block">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre: any) => (
                    <Button
                      key={genre.id}
                      variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                      onClick={() => toggleGenre(genre.id)}
                      size="sm"
                    >
                      {genre.name}
                      {selectedGenres.includes(genre.id) && (
                        <Check className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex gap-2">
                  {[
                    { value: "popularity", label: "Popularity" },
                    { value: "rating", label: "Rating" },
                    { value: "release_date", label: "Release Date" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      onClick={() => setSortBy(option.value as any)}
                      size="sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Streaming Providers */}
              <StreamingProviderFilter
                selectedProviders={selectedProviders}
                onToggleProvider={toggleProvider}
              />
            </div>
          )}
        </div>
      </div>

      {/* Movie Grid */}
      <div className="container max-w-6xl px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayMovies && displayMovies.length > 0 ? (
          <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayMovies.map((movie: any) => (
              <div
                key={movie.id}
                className="glass-card rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
              >
                {/* Poster */}
                <div
                  className="relative aspect-[2/3]"
                  onClick={() => setSelectedMovie(movie)}
                >
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title || movie.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No Image</span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  {movie.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isAuthenticated && isInWatchlist(movie.id.toString()) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="glass border-green-500/50 text-green-400 pointer-events-none"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        In Watchlist
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWatchlist(movie);
                        }}
                        disabled={addToWatchlistMutation.isPending}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Watchlist
                      </Button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {movie.title || movie.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {movie.release_date
                      ? new Date(movie.release_date).getFullYear()
                      : movie.first_air_date
                      ? new Date(movie.first_air_date).getFullYear()
                      : "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {displayMovies && displayMovies.length >= 20 && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isFetching}
                className="gradient-primary"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {debouncedQuery ? "No results found" : "No movies found"}
            </p>
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movieId={selectedMovie.id.toString()}
          movieType={
            selectedMovie.media_type === "tv" || selectedMovie.first_air_date ? "tv" : "movie"
          }
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
