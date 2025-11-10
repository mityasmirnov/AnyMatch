import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Heart, X, Star, Bookmark } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  genres: number[];
  type: "movie" | "tv";
  releaseDate: string;
}

interface SwipeCardProps {
  movie: Movie;
  onSwipe: (direction: "left" | "right" | "up" | "down") => void;
  style?: React.CSSProperties;
}

export default function SwipeCard({ movie, onSwipe, style }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const [exitY, setExitY] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 500;

    // Check for up/down swipes first
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
        // Swipe up - Super Like
        setExitY(-1000);
        onSwipe("up");
      } else if (info.offset.y > threshold || info.velocity.y > velocityThreshold) {
        // Swipe down - Save for later
        setExitY(1000);
        onSwipe("down");
      }
    } else {
      // Check for left/right swipes
      if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
        // Swipe right - Like
        setExitX(1000);
        onSwipe("right");
      } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
        // Swipe left - Dislike
        setExitX(-1000);
        onSwipe("left");
      }
    }
  };

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        opacity,
        ...style,
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={{
        x: exitX,
        y: exitY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full glass-card overflow-hidden group">
        {/* Movie Poster/Backdrop */}
        <div className="absolute inset-0">
          {movie.backdrop || movie.poster ? (
            <img
              src={movie.backdrop || movie.poster || ""}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
              <span className="text-6xl">🎬</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Swipe indicators */}
        <motion.div
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          className="absolute top-8 right-8 bg-green-500/90 backdrop-blur-sm px-6 py-3 rounded-2xl rotate-12"
        >
          <Heart className="w-12 h-12 text-white" fill="white" />
        </motion.div>

        <motion.div
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          className="absolute top-8 left-8 bg-red-500/90 backdrop-blur-sm px-6 py-3 rounded-2xl -rotate-12"
        >
          <X className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          style={{ opacity: useTransform(y, [-100, 0], [1, 0]) }}
          className="absolute top-8 left-1/2 -translate-x-1/2 bg-blue-500/90 backdrop-blur-sm px-6 py-3 rounded-2xl"
        >
          <Star className="w-12 h-12 text-white" fill="white" />
        </motion.div>

        <motion.div
          style={{ opacity: useTransform(y, [0, 100], [0, 1]) }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-purple-500/90 backdrop-blur-sm px-6 py-3 rounded-2xl"
        >
          <Bookmark className="w-12 h-12 text-white" />
        </motion.div>

        {/* Movie info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              {movie.type === "movie" ? "Movie" : "TV Show"}
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              ⭐ {(movie.rating / 10).toFixed(1)}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white text-shadow">
            {movie.title}
          </h2>

          <p className="text-white/90 text-sm line-clamp-3 text-shadow">
            {movie.overview}
          </p>

          {movie.releaseDate && (
            <p className="text-white/70 text-sm">
              {new Date(movie.releaseDate).getFullYear()}
            </p>
          )}
        </div>

        {/* Swipe instructions hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="glass-card p-4 text-center space-y-2">
            <p className="text-sm text-white/80">
              ← Dislike | Like → <br />
              ↑ Super Like | ↓ Save
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
