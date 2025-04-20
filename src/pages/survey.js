'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/MovieContext';
import { GenreSurvey } from '../components/GenreSurvey';

const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

export default function SurveyPage() {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const router = useRouter();
  const { user } = useAuth();
  const { updatePreferences, preferences } = useMovies();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Load existing preferences
  useEffect(() => {
    if (preferences?.favoriteGenres) {
      setSelectedGenres(preferences.favoriteGenres);
    }
  }, [preferences]);

  const handleComplete = async () => {
    try {
      await updatePreferences({
        favoriteGenres: selectedGenres
      });
      router.push('/swipe');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to DinoMatch!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Let's get to know your movie preferences
          </p>
        </div>

        <GenreSurvey
          genres={MOVIE_GENRES}
          selectedGenres={selectedGenres}
          onGenreSelect={setSelectedGenres}
          onComplete={handleComplete}
          className="mt-8"
        />
      </div>
    </div>
  );
}
