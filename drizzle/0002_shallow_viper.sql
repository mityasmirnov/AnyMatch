CREATE TABLE `watchlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movieId` varchar(50) NOT NULL,
	`movieTitle` text NOT NULL,
	`moviePoster` text,
	`movieType` enum('movie','tv') NOT NULL,
	`movieGenres` json,
	`movieRating` int DEFAULT 0,
	`movieYear` int,
	`addedFrom` enum('swipe','match','search','browse') NOT NULL,
	`watched` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_watchlist_movie_idx` UNIQUE(`userId`,`movieId`)
);
