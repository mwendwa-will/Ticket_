import { pgTable, text, serial, integer, numeric, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Define user roles
export const UserRole = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  USER: 'user'
} as const;

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role").notNull().default(UserRole.USER),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    usernameIdx: uniqueIndex("username_idx").on(table.username),
    emailIdx: uniqueIndex("email_idx").on(table.email),
  };
});

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
  creatorId: integer("creator_id").notNull(), // References user who created the event
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase model
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(), // References user who made the purchase
  quantity: integer("quantity").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  purchases: many(purchases),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  event: one(events, {
    fields: [purchases.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
