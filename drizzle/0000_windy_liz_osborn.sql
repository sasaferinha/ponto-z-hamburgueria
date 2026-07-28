CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_name` text NOT NULL,
	`order_mode` text NOT NULL,
	`neighborhood` text DEFAULT '' NOT NULL,
	`street` text DEFAULT '' NOT NULL,
	`address_details` text DEFAULT '' NOT NULL,
	`items_json` text NOT NULL,
	`total_cents` integer NOT NULL,
	`status` text DEFAULT 'novo' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
