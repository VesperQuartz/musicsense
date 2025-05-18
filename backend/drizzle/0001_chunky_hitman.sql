CREATE TABLE `memories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`userId` text NOT NULL,
	`updated_at` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`album` text DEFAULT 'unknown',
	`genre` text DEFAULT 'unknown',
	`date` text NOT NULL,
	`artwork` text,
	`duration` numeric,
	`tags` text,
	`name` text NOT NULL,
	`type` text DEFAULT 'remote',
	`userId` text NOT NULL,
	`updated_at` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text,
	`lastName` text,
	`username` text,
	`email` text NOT NULL,
	`updated_at` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
DROP TABLE `users_table`;