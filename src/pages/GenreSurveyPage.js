import React, { useState, useEffect } from 'react';
import { GenreSurvey } from '../components/GenreSurvey';
import { useAuth } from '../contexts/AuthContext';
import { useGroup } from '../contexts/GroupContext';
import { getGenres } from '../services/mockMovieApi';
import { Navigate, useNavigate } from 'react-router-dom';

const GenreSurveyPage = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, updateUserProfile } = useAuth();
  const { currentGroup, updateGroupPreferences } = useGroup();
  const navigate = useNavigate();
  
  // If user is not authenticated, redirect to auth page
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const genresData = await getGenres();
        setGenres(genresData);
        
        // Pre-select genres if user has preferences
        if (user?.profile?.preferences?.favoriteGenres) {
          setSelectedGenres(user.profile.preferences.favoriteGenres);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGenres();
  }, [user]);
  
  const handleGenreSelect = (selected) => {
    setSelectedGenres(selected);
  };
  
  const handleComplete = async () => {
    try {
      // Update user preferences
      await updateUserProfile({
        preferences: {
          ...user.profile.preferences,
          favoriteGenres: selectedGenres
        }
      });
      
      // If in a group context, update group preferences too
      if (currentGroup) {
        await updateGroupPreferences(currentGroup.id, {
          genres: selectedGenres
        });
      }
      
      // Navigate to the matching page
      navigate('/match');
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };
  
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading genres...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Movie Preferences</h1>
          <p className="mt-2 text-lg text-gray-600">
            Let's find out what kind of movies you enjoy
          </p>
        </div>
        
        <GenreSurvey
          genres={genres}
          selectedGenres={selectedGenres}
          onGenreSelect={handleGenreSelect}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
};

export default GenreSurveyPage;
