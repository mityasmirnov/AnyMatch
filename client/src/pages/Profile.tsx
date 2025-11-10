import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(60);
  const [contentType, setContentType] = useState<"movie" | "tv" | "both">("both");

  const utils = trpc.useUtils();

  // Fetch user preferences
  const { data: preferences, isLoading: prefsLoading } = trpc.preferences.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch genres
  const { data: genres } = trpc.movies.getGenres.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Update preferences mutation
  const updateMutation = trpc.preferences.update.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved!");
      utils.preferences.get.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to save preferences", {
        description: error.message,
      });
    },
  });

  // Load existing preferences
  useEffect(() => {
    if (preferences) {
      setSelectedGenres(preferences.favoriteGenres || []);
      setMinRating(preferences.minRating || 60);
      setContentType(preferences.preferredContentType || "both");
    }
  }, [preferences]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading || prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const allGenres = [
    ...(genres?.movieGenres || []),
    ...(genres?.tvGenres || [])
  ].filter((genre, index, self) => 
    index === self.findIndex((g) => g.id === genre.id)
  );

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      favoriteGenres: selectedGenres,
      minRating,
      preferredContentType: contentType,
    });
  };

  return (
    <div className="min-h-screen animated-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
              Your Profile
            </h1>
            <p className="text-white/70">
              Customize your movie preferences
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Info */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-white/70">
                Your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">User ID</Label>
                <p className="text-white/80">{user?.id}</p>
              </div>
              {user?.name && (
                <div>
                  <Label className="text-white">Name</Label>
                  <p className="text-white/80">{user.name}</p>
                </div>
              )}
              {user?.email && (
                <div>
                  <Label className="text-white">Email</Label>
                  <p className="text-white/80">{user.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Type Preference */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Content Type</CardTitle>
              <CardDescription className="text-white/70">
                What do you prefer to watch?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={contentType === "movie" ? "default" : "outline"}
                  className={contentType === "movie" ? "gradient-primary" : "bg-white/5 border-white/10"}
                  onClick={() => setContentType("movie")}
                >
                  Movies Only
                </Button>
                <Button
                  variant={contentType === "tv" ? "default" : "outline"}
                  className={contentType === "tv" ? "gradient-primary" : "bg-white/5 border-white/10"}
                  onClick={() => setContentType("tv")}
                >
                  TV Shows Only
                </Button>
                <Button
                  variant={contentType === "both" ? "default" : "outline"}
                  className={contentType === "both" ? "gradient-primary" : "bg-white/5 border-white/10"}
                  onClick={() => setContentType("both")}
                >
                  Both
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Minimum Rating */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Minimum Rating</CardTitle>
              <CardDescription className="text-white/70">
                Only show content with at least this rating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-semibold">
                    {(minRating / 10).toFixed(1)} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${minRating}%, rgba(255,255,255,0.1) ${minRating}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-white/50">
                  <span>0.0</span>
                  <span>5.0</span>
                  <span>10.0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Genre Preferences */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Favorite Genres</CardTitle>
              <CardDescription className="text-white/70">
                Select genres you enjoy (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {allGenres.map((genre) => (
                  <Button
                    key={genre.id}
                    variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedGenres.includes(genre.id)
                        ? "gradient-primary"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }
                    onClick={() => toggleGenre(genre.id)}
                  >
                    {genre.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            size="lg"
            className="w-full gradient-primary"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
