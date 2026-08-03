ALTER TABLE `orders` ADD `payment_method` text DEFAULT 'Nao informado' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `cash_change_choice` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `cash_amount_cents` integer;
