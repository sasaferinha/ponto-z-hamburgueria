import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  orderMode: text("order_mode").notNull(),
  neighborhood: text("neighborhood").notNull().default(""),
  street: text("street").notNull().default(""),
  addressDetails: text("address_details").notNull().default(""),
  itemsJson: text("items_json").notNull(),
  total: integer("total_cents").notNull(),
  status: text("status").notNull().default("novo"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
