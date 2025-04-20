'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import { fetchGenres } from '../services/tmdb';
import { useToast } from '../components/ui/toast-provider';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function ProfilePage() {
  const { user, updateUserProfile, deleteAccount } = useAuth();
  const { preferences, updatePreferences } = useMovies();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [contentType, setContentType] = useState(preferences.contentType || 'movie');
  const [minRating, setMinRating] = useState(preferences.minRating || 0);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState(
    preferences.genres || preferences.favoriteGenres || []
  );
  const [loadingGenres, setLoadingGenres] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.profile.displayName || '');
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoadingGenres(true);
      try {
        const list = await fetchGenres(contentType);
        setGenres(list);
      } catch (err) {}
      setLoadingGenres(false);
    };
    load();
  }, [contentType]);

  const handleProfileSave = async () => {
    try {
      await updateUserProfile({ displayName });
      toast({ title: 'Profile saved', variant: 'success' });
    } catch (err) {}
  };

  const handlePreferencesSave = async () => {
    try {
      await updatePreferences({ contentType, minRating, genres: selectedGenres });
      toast({ title: 'Preferences saved', variant: 'success' });
    } catch (err) {}
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-100">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="text-gray-800 dark:text-gray-200">{user.email}</p>
              </div>
              <Button onClick={handleProfileSave}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content Type
                </label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={contentType === 'movie' ? 'primary' : 'outline'}
                    onClick={() => setContentType('movie')}
                  >
                    Movies
                  </Button>
                  <Button
                    variant={contentType === 'tv' ? 'primary' : 'outline'}
                    onClick={() => setContentType('tv')}
                  >
                    TV Shows
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Rating
                </label>
                <input
                  type="range"
                  min="0"
                  max="9"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Any</span>
                  <span>{minRating.toFixed(1)}+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Genres
                </label>
                {loadingGenres ? (
                  <p>Loading...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {genres.map((g) => (
                      <button
                        key={g.id}
                        onClick={() =>
                          setSelectedGenres((prev) =>
                            prev.includes(g.id)
                              ? prev.filter((id) => id !== g.id)
                              : [...prev, g.id]
                          )
                        }
                        className={
                          `p-2 rounded-lg transition-colors ` +
                          (selectedGenres.includes(g.id)
                            ? 'bg-primary-100 border-2 border-primary-500 text-primary-800'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700')
                        }
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handlePreferencesSave}>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="destructive" onClick={deleteAccount}>
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
