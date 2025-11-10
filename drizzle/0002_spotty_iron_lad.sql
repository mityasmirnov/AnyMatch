ALTER TABLE `groups` MODIFY COLUMN `filterGenres` json;--> statement-breakpoint
ALTER TABLE `matches` MODIFY COLUMN `movieGenres` json;--> statement-breakpoint
ALTER TABLE `saved_movies` MODIFY COLUMN `movieGenres` json;--> statement-breakpoint
ALTER TABLE `swipes` MODIFY COLUMN `movieGenres` json;--> statement-breakpoint
ALTER TABLE `user_preferences` MODIFY COLUMN `favoriteGenres` json;--> statement-breakpoint
ALTER TABLE `user_preferences` MODIFY COLUMN `dislikedGenres` json;