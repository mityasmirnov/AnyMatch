-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  favoriteGenres JSON,
  dislikedGenres JSON,
  preferredContentType ENUM('movie', 'tv', 'both') NOT NULL DEFAULT 'both',
  minRating INT DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY user_id_idx (userId)
);

-- Groups table
CREATE TABLE IF NOT EXISTS `groups` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  joinCode VARCHAR(10) NOT NULL UNIQUE,
  createdBy INT NOT NULL,
  matchThreshold INT NOT NULL DEFAULT 100,
  minRating INT DEFAULT 0,
  filterGenres JSON,
  filterType ENUM('movie', 'tv', 'both') NOT NULL DEFAULT 'both',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  movieId VARCHAR(50) NOT NULL,
  movieTitle TEXT NOT NULL,
  moviePoster TEXT,
  movieType ENUM('movie', 'tv') NOT NULL,
  movieGenres JSON,
  movieRating INT DEFAULT 0,
  direction ENUM('left', 'right', 'up', 'down') NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_movie_idx (userId, movieId)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupId INT NOT NULL,
  movieId VARCHAR(50) NOT NULL,
  movieTitle TEXT NOT NULL,
  moviePoster TEXT,
  movieType ENUM('movie', 'tv') NOT NULL,
  movieGenres JSON,
  movieRating INT DEFAULT 0,
  matchedBy JSON NOT NULL,
  watched TINYINT(1) NOT NULL DEFAULT 0,
  watchedAt TIMESTAMP NULL,
  matchedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY group_movie_idx (groupId, movieId)
);

-- Saved movies table
CREATE TABLE IF NOT EXISTS saved_movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  movieId VARCHAR(50) NOT NULL,
  movieTitle TEXT NOT NULL,
  moviePoster TEXT,
  movieType ENUM('movie', 'tv') NOT NULL,
  movieGenres JSON,
  movieRating INT DEFAULT 0,
  savedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_saved_movie_idx (userId, movieId)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('match', 'super_like', 'group_invite') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  relatedId VARCHAR(50),
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add photoUrl to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS photoUrl TEXT AFTER role;
