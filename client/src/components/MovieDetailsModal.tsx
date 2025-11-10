import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Heart, Star, Bookmark, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface MovieDetailsModalProps {
  movieId: string;
  movieType: "movie" | "tv";
  isOpen: boolean;
  onClose: () => void;
  onSwipe?: (direction: "left" | "right" | "up" | "down") => void;
}

export default function MovieDetailsModal({
  movieId,
  movieType,
  isOpen,
  onClose,
  onSwipe,
}: MovieDetailsModalProps) {
  const { data: details, isLoading } = trpc.movies.getDetails.useQuery(
    { id: movieId, type: movieType },
    { enabled: isOpen }
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full" />
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Backdrop Image */}
              {(details as any).backdrop && (
              <div className="relative -mx-6 -mt-6 h-64 md:h-96">
                <img
                  src={(details as any).backdrop}
                  alt={(details as any).title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm hover:bg-black/70"
                  onClick={onClose}
                >
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="space-y-4">
              {/* Title and Meta */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{(details as any).title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white">
                    {movieType === "movie" ? "Movie" : "TV Show"}
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {((details as any).rating / 10).toFixed(1)}
                  </span>
                  {(details as any).releaseDate && (
                    <span className="text-white/70">
                      {new Date((details as any).releaseDate).getFullYear()}
                    </span>
                  )}
                  {(details as any).runtime && (
                    <span className="text-white/70">{(details as any).runtime} min</span>
                  )}
                </div>
              </div>

              {/* Genres */}
              {(details as any).genres && (details as any).genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(details as any).genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gradient-primary rounded-full text-white text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Overview</h3>
                <p className="text-white/80 leading-relaxed">{(details as any).overview}</p>
              </div>

              {/* Cast */}
              {(details as any).cast && Array.isArray((details as any).cast) && (details as any).cast.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(details as any).cast.slice(0, 8).map((actor: any) => (
                      <div key={actor.id} className="text-center">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-white/10 rounded-lg mb-2 flex items-center justify-center">
                            <span className="text-4xl">👤</span>
                          </div>
                        )}
                        <p className="text-white font-medium text-sm">{actor.name}</p>
                        <p className="text-white/60 text-xs">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming Providers */}
              {(details as any)["watch/providers"]?.results?.US && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Where to Watch</h3>
                  <div className="space-y-4">
                    {/* Streaming */}
                    {(details as any)["watch/providers"].results.US.flatrate && (
                      <div>
                        <p className="text-white/70 text-sm mb-2">Stream</p>
                        <div className="flex flex-wrap gap-3">
                          {(details as any)["watch/providers"].results.US.flatrate.map((provider: any) => (
                            <div key={provider.provider_id} className="flex flex-col items-center">
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-12 h-12 rounded-lg"
                              />
                              <span className="text-xs text-white/70 mt-1">{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Rent */}
                    {(details as any)["watch/providers"].results.US.rent && (
                      <div>
                        <p className="text-white/70 text-sm mb-2">Rent</p>
                        <div className="flex flex-wrap gap-3">
                          {(details as any)["watch/providers"].results.US.rent.slice(0, 5).map((provider: any) => (
                            <div key={provider.provider_id} className="flex flex-col items-center">
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-12 h-12 rounded-lg"
                              />
                              <span className="text-xs text-white/70 mt-1">{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Buy */}
                    {(details as any)["watch/providers"].results.US.buy && (
                      <div>
                        <p className="text-white/70 text-sm mb-2">Buy</p>
                        <div className="flex flex-wrap gap-3">
                          {(details as any)["watch/providers"].results.US.buy.slice(0, 5).map((provider: any) => (
                            <div key={provider.provider_id} className="flex flex-col items-center">
                              <img
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="w-12 h-12 rounded-lg"
                              />
                              <span className="text-xs text-white/70 mt-1">{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trailer */}
              {(details as any).trailer && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Trailer</h3>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${(details as any).trailer}`}
                      title="Trailer"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {onSwipe && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    size="lg"
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50"
                    onClick={() => {
                      onSwipe("left");
                      onClose();
                    }}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Pass
                  </Button>
                  <Button
                    size="lg"
                    className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50"
                    onClick={() => {
                      onSwipe("down");
                      onClose();
                    }}
                  >
                    <Bookmark className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="lg"
                    className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50"
                    onClick={() => {
                      onSwipe("up");
                      onClose();
                    }}
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Super Like
                  </Button>
                  <Button
                    size="lg"
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50"
                    onClick={() => {
                      onSwipe("right");
                      onClose();
                    }}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Like
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/70">Failed to load movie details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
