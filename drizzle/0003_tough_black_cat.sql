CREATE TABLE `guest_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_code` varchar(6) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `guest_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `guest_sessions_session_code_unique` UNIQUE(`session_code`)
);
--> statement-breakpoint
CREATE TABLE `guest_swipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` int NOT NULL,
	`guest_identifier` varchar(255) NOT NULL,
	`movie_id` varchar(50) NOT NULL,
	`movie_title` varchar(500) NOT NULL,
	`movie_poster` text,
	`movie_type` enum('movie','tv') NOT NULL,
	`movie_genres` json,
	`movie_rating` int DEFAULT 0,
	`direction` enum('left','right','up','down') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guest_swipes_id` PRIMARY KEY(`id`)
);
