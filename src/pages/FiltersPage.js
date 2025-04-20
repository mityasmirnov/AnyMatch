import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useGroup } from '../contexts/GroupContext';
import { getGenres } from '../services/mockMovieApi';
import { Navigate } from 'react-router-dom';

const FiltersPage = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [contentType, setContentType] = useState('all'); // 'all', 'movie', or 'tv'
  const [loading, setLoading] = useState(true);
  
  const { user, loading: authLoading } = useAuth();
  const { currentGroup, loading: groupLoading, updateGroupPreferences } = useGroup();
  
  // If user is not authenticated, redirect to auth page
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  // If no group is selected, redirect to group page
  if (!currentGroup && !groupLoading) {
    return <Navigate to="/groups" replace />;
  }
  
  // Fetch genres and initialize filters from group preferences
  useEffect(() => {
    const initializeFilters = async () => {
      try {
        setLoading(true);
        
        // Fetch genres
        const genresData = await getGenres();
        setGenres(genresData);
        
        // Initialize from group preferences if available
        if (currentGroup?.preferences) {
          if (currentGroup.preferences.genres) {
            setSelectedGenres(currentGroup.preferences.genres);
          }
          
          if (currentGroup.preferences.minRating) {
            setMinRating(currentGroup.preferences.minRating);
          }
          
          if (currentGroup.preferences.contentType) {
            setContentType(currentGroup.preferences.contentType);
          }
        }
      } catch (error) {
        console.error("Error initializing filters:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentGroup && !groupLoading) {
      initializeFilters();
    }
  }, [currentGroup, groupLoading]);
  
  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };
  
  const handleRatingChange = (e) => {
    const value = parseFloat(e.target.value);
    setMinRating(isNaN(value) ? 0 : Math.max(0, Math.min(10, value)));
  };
  
  const handleContentTypeChange = (type) => {
    setContentType(type);
  };
  
  const handleSaveFilters = async () => {
    try {
      await updateGroupPreferences(currentGroup.id, {
        genres: selectedGenres,
        minRating,
        contentType
      });
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };
  
  if (loading || authLoading || groupLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading filters...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Content Filters</h1>
          <p className="mt-2 text-lg text-gray-600">
            Customize what content you want to see
          </p>
          {currentGroup && (
            <p className="mt-1 text-sm text-primary-600">
              Group: {currentGroup.name}
            </p>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Content Type Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button
                  variant={contentType === 'all' ? 'primary' : 'outline'}
                  onClick={() => handleContentTypeChange('all')}
                >
                  All Content
                </Button>
                <Button
                  variant={contentType === 'movie' ? 'primary' : 'outline'}
                  onClick={() => handleContentTypeChange('movie')}
                >
                  Movies Only
                </Button>
                <Button
                  variant={contentType === 'tv' ? 'primary' : 'outline'}
                  onClick={() => handleContentTypeChange('tv')}
                >
                  TV Series Only
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
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={minRating}
                    onChange={handleRatingChange}
                    className="w-24"
                  />
                  <span className="text-gray-600">out of 10</span>
                </div>
                
                <div className="flex justify-between">
                  {[0, 2, 4, 6, 8, 10].map(rating => (
                    <Button
                      key={rating}
                      variant="outline"
                      size="sm"
                      onClick={() => setMinRating(rating)}
                      className={minRating === rating ? 'border-primary-500 text-primary-600' : ''}
                    >
                      {rating}+
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Genre Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
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
            </CardContent>
          </Card>
          
          {/* Save Button */}
          <div className="flex justify-center">
            <Button size="lg" onClick={handleSaveFilters}>
              Save Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersPage;
