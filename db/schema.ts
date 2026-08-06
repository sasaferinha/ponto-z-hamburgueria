import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  orderMode: text("order_mode").notNull(),
  neighborhood: text("neighborhood").notNull().default(""),
  street: text("street").notNull().default(""),
  addressDetails: text("address_details").notNull().default(""),
  paymentMethod: text("payment_method").notNull().default("N\u00e3o informado"),
  cashChangeChoice: text("cash_change_choice").notNull().default(""),
  cashAmountCents: integer("cash_amount_cents"),
  itemsJson: text("items_json").notNull(),
  total: integer("total_cents").notNull(),
  status: text("status").notNull().default("novo"),
  viewed: integer("viewed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const storeSettings = sqliteTable("store_settings", {
  id: integer("id").primaryKey().default(1),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
  deliveryTime: text("delivery_time").notNull().default("40 a 60 minutos"),
  pickupTime: text("pickup_time").notNull().default("20 a 30 minutos"),
  openingHours: text("opening_hours").notNull().default("18h às 00h"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
