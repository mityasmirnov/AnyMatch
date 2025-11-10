CREATE TABLE `group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_user_idx` UNIQUE(`groupId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`joinCode` varchar(10) NOT NULL,
	`createdBy` int NOT NULL,
	`matchThreshold` int NOT NULL DEFAULT 100,
	`minRating` int DEFAULT 0,
	`filterGenres` json DEFAULT ('[]'),
	`filterType` enum('movie','tv','both') NOT NULL DEFAULT 'both',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `groups_joinCode_unique` UNIQUE(`joinCode`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`movieId` varchar(50) NOT NULL,
	`movieTitle` text NOT NULL,
	`moviePoster` text,
	`movieType` enum('movie','tv') NOT NULL,
	`movieGenres` json DEFAULT ('[]'),
	`movieRating` int DEFAULT 0,
	`matchedBy` json NOT NULL,
	`watched` boolean NOT NULL DEFAULT false,
	`watchedAt` timestamp,
	`matchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `matches_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_movie_idx` UNIQUE(`groupId`,`movieId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('match','super_like','group_invite') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedId` varchar(50),
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_movies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movieId` varchar(50) NOT NULL,
	`movieTitle` text NOT NULL,
	`moviePoster` text,
	`movieType` enum('movie','tv') NOT NULL,
	`movieGenres` json DEFAULT ('[]'),
	`movieRating` int DEFAULT 0,
	`savedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_movies_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_saved_movie_idx` UNIQUE(`userId`,`movieId`)
);
--> statement-breakpoint
CREATE TABLE `swipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`movieId` varchar(50) NOT NULL,
	`movieTitle` text NOT NULL,
	`moviePoster` text,
	`movieType` enum('movie','tv') NOT NULL,
	`movieGenres` json DEFAULT ('[]'),
	`movieRating` int DEFAULT 0,
	`direction` enum('left','right','up','down') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `swipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_movie_idx` UNIQUE(`userId`,`movieId`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`favoriteGenres` json DEFAULT ('[]'),
	`dislikedGenres` json DEFAULT ('[]'),
	`preferredContentType` enum('movie','tv','both') NOT NULL DEFAULT 'both',
	`minRating` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_id_idx` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `photoUrl` text;