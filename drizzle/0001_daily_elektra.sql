CREATE TABLE `store_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`is_open` integer DEFAULT true NOT NULL,
	`delivery_time` text DEFAULT '40 a 60 minutos' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
