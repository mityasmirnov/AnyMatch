DROP TABLE `groups`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
DROP TABLE `saved_movies`;--> statement-breakpoint
DROP TABLE `swipes`;--> statement-breakpoint
DROP TABLE `user_preferences`;--> statement-breakpoint
ALTER TABLE `group_members` DROP INDEX `group_user_idx`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `group_members` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `group_members` MODIFY COLUMN `joinedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
CREATE INDEX `group_user_idx` ON `group_members` (`groupId`,`userId`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `photoUrl`;