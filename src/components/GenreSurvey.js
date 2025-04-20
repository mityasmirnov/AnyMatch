import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

const GenreSurvey = ({ 
  genres = [], 
  selectedGenres = [], 
  onGenreSelect, 
  onComplete,
  className = '',
  ...props 
}) => {
  const toggleGenre = (genreId) => {
    if (selectedGenres.includes(genreId)) {
      onGenreSelect(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenreSelect([...selectedGenres, genreId]);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">What kinds of movies do you enjoy?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-6">
            Select your favorite genres to help us find movies you'll love.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
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
          
          <div className="mt-8 text-center">
            <Button 
              onClick={onComplete}
              disabled={selectedGenres.length === 0}
              size="lg"
            >
              Continue
            </Button>
            
            {selectedGenres.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Please select at least one genre to continue
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { GenreSurvey };
