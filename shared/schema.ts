import { pgTable, text, serial, integer, date, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Event model
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(), // stored as YYYY-MM-DD
  time: text("time").notNull(),
  location: text("location").notNull(),
  price: numeric("price").notNull(),
  genre: text("genre"),
  imageUrl: text("image_url").notNull(),
  capacity: integer("capacity"),
  isFeatured: boolean("is_featured").default(false),
});

// Purchase model
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  purchaseDate: text("purchase_date").notNull(), // stored as ISO string
});

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
});

// Types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
