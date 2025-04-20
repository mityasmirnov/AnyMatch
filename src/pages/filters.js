import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import { useGroup } from '../contexts/GroupContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { fetchGenres } from '../services/tmdb';

export default function FiltersPage() {
  const [genres, setGenres] = useState([]);
  const [contentType, setContentType] = useState('movie');
  const [minRating, setMinRating] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { user } = useAuth();
  const { updatePreferences, preferences } = useMovies();
  const { currentGroup, updateGroupPreferences } = useGroup();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load genres based on content type
  useEffect(() => {
    const loadGenres = async () => {
      try {
        setLoading(true);
        const genreList = await fetchGenres(contentType);
        setGenres(genreList);
      } catch (error) {
        console.error('Error loading genres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGenres();
  }, [contentType]);

  // Load existing preferences
  useEffect(() => {
    if (currentGroup?.preferences) {
      setSelectedGenres(currentGroup.preferences.genres || []);
      setMinRating(currentGroup.preferences.minRating || 0);
    }
    if (preferences?.contentType) {
      setContentType(preferences.contentType);
    }
  }, [currentGroup, preferences]);

  const handleSave = async () => {
    try {
      // Update personal preferences
      await updatePreferences({
        contentType
      });

      // Update group preferences
      if (currentGroup) {
        await updateGroupPreferences({
          genres: selectedGenres,
          minRating
        });
      }

      router.push('/swipe');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (!user || !currentGroup) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Filter Settings
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Customize your movie recommendations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Content Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => setContentType('movie')}
                  variant={contentType === 'movie' ? 'default' : 'outline'}
                >
                  Movies
                </Button>
                <Button
                  onClick={() => setContentType('tv')}
                  variant={contentType === 'tv' ? 'default' : 'outline'}
                >
                  TV Shows
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rating Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Minimum Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="9"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Any Rating</span>
                  <span>{minRating.toFixed(1)}+ Stars</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Genre Selection */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Genres</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading genres...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        setSelectedGenres(prev =>
                          prev.includes(genre.id)
                            ? prev.filter(id => id !== genre.id)
                            : [...prev, genre.id]
                        );
                      }}
                      className={`
                        p-3 rounded-lg text-center transition-colors
                        ${selectedGenres.includes(genre.id)
                          ? 'bg-primary-100 border-2 border-primary-500 text-primary-800'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                      `}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleSave}
            size="lg"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
