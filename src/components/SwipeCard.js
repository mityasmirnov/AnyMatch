import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const SwipeCard = ({ 
  movie, 
  onSwipe,
  className = '',
  ...props 
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);

  // Reset position when movie changes
  useEffect(() => {
    setCurrentX(0);
  }, [movie]);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX - startX;
    setCurrentX(currentX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX - startX;
    setCurrentX(currentX);
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  const handleMouseUp = () => {
    handleSwipeEnd();
  };

  const handleSwipeEnd = () => {
    setIsDragging(false);
    
    // Determine if the swipe was significant enough
    if (currentX > 100) {
      // Swipe right (like)
      onSwipe('right');
    } else if (currentX < -100) {
      // Swipe left (dislike)
      onSwipe('left');
    }
    
    // Reset position with animation
    setCurrentX(0);
  };

  // Calculate rotation based on swipe distance
  const rotation = currentX * 0.1; // 0.1 degree per pixel
  
  // Calculate opacity for like/dislike indicators
  const likeOpacity = Math.min(currentX / 100, 1);
  const dislikeOpacity = Math.min(-currentX / 100, 1);

  return (
    <div 
      className={`relative w-full max-w-sm mx-auto ${className}`}
      {...props}
    >
      <div
        ref={cardRef}
        className="swipe-card touch-none cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${currentX}px) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Card className="h-[500px] overflow-hidden">
          <div 
            className="h-[350px] bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.coverUrl})` }}
          />
          <div className="p-4">
            <h3 className="text-xl font-bold">{movie.title}</h3>
            <div className="flex items-center mt-1 text-sm">
              <span className="text-gray-600">
                {movie.releaseDate?.split('-')[0]}
              </span>
              <span className="ml-auto bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                ★ {movie.rating.toFixed(1)}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{movie.description}</p>
            
            {/* Watch providers */}
            {movie.watchProviders && (
              <div className="mt-3">
                <h4 className="text-sm font-semibold mb-1">Available on:</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.watchProviders.flatrate?.map((provider) => (
                    <img
                      key={provider.provider_id}
                      src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                      alt={provider.provider_name}
                      className="w-6 h-6 rounded"
                      title={provider.provider_name}
                    />
                  ))}
                  {movie.watchProviders.rent?.map((provider) => (
                    <img
                      key={provider.provider_id}
                      src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                      alt={provider.provider_name}
                      className="w-6 h-6 rounded opacity-70"
                      title={`Rent on ${provider.provider_name}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Like indicator */}
        <div 
          className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg transform rotate-12 font-bold text-xl border-2 border-white"
          style={{ opacity: likeOpacity, display: likeOpacity > 0 ? 'block' : 'none' }}
        >
          LIKE
        </div>
        
        {/* Dislike indicator */}
        <div 
          className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg transform -rotate-12 font-bold text-xl border-2 border-white"
          style={{ opacity: dislikeOpacity, display: dislikeOpacity > 0 ? 'block' : 'none' }}
        >
          NOPE
        </div>
      </div>
      
      {/* Button controls */}
      <div className="flex justify-center mt-6 gap-8">
        <Button 
          variant="destructive" 
          className="rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg"
          onClick={() => onSwipe('left')}
        >
          ✕
        </Button>
        <Button 
          variant="primary" 
          className="rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg"
          onClick={() => onSwipe('right')}
        >
          ♥
        </Button>
      </div>
    </div>
  );
};

export { SwipeCard };
