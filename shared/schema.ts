import { pgTable, text, serial, integer, numeric, boolean, timestamp, uniqueIndex, doublePrecision, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Define user roles
export const UserRole = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  USER: 'user'
} as const;

// User model with enhanced profile fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: text("role").notNull().default(UserRole.USER),
  profileImage: text("profile_image"),
  bio: text("bio"),
  phone: text("phone"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    usernameIdx: uniqueIndex("username_idx").on(table.username),
    emailIdx: uniqueIndex("email_idx").on(table.email),
  };
});

// Event model with enhanced fields
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
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  endDate: text("end_date"),
  endTime: text("end_time"),
  averageRating: doublePrecision("average_rating"),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase model with enhanced fields for QR code tickets and status
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(), // References user who made the purchase
  quantity: integer("quantity").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  status: text("status", { enum: ["pending", "completed", "canceled", "refunded"] }).default("completed"),
  paymentIntentId: text("payment_intent_id"),
  ticketCode: text("ticket_code"),
  promocodeId: integer("promocode_id"),
  discountAmount: numeric("discount_amount"),
  isCheckedIn: boolean("is_checked_in").default(false),
  checkInDate: timestamp("check_in_date"),
});

// Reviews table for event ratings and comments
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Followers table for social features
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull(), // User who is following
  organizerId: integer("organizer_id").notNull(), // Organizer being followed
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    followerOrganizerUnique: uniqueIndex("follower_organizer_unique_idx").on(
      table.followerId, 
      table.organizerId
    ),
  };
});

// Persistent wishlist table (beyond session storage)
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    userEventUnique: uniqueIndex("user_event_unique_idx").on(
      table.userId, 
      table.eventId
    ),
  };
});

// Notifications for users
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type", { 
    enum: ["purchase", "review", "event_update", "follow", "reminder", "system"] 
  }).notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"), // Related entity ID (event, purchase, etc.)
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Promocodes for discounts
export const promocodes = pgTable("promocodes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  discountType: text("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
  discountAmount: numeric("discount_amount").notNull(),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").default(0),
  eventId: integer("event_id"), // If null, applies to all events
  creatorId: integer("creator_id").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    codeUnique: uniqueIndex("code_unique_idx").on(table.code),
  };
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events, { relationName: "createdEvents" }),
  purchases: many(purchases),
  reviews: many(reviews),
  followedBy: many(followers, { relationName: "followers" }),
  following: many(followers, { relationName: "following" }),
  wishlists: many(wishlists),
  notifications: many(notifications),
  promocodes: many(promocodes),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
    relationName: "createdEvents"
  }),
  purchases: many(purchases),
  reviews: many(reviews),
  wishlists: many(wishlists),
  promocodes: many(promocodes),
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
  promocode: one(promocodes, {
    fields: [purchases.promocodeId],
    references: [promocodes.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  event: one(events, {
    fields: [reviews.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
    relationName: "following",
  }),
  organizer: one(users, {
    fields: [followers.organizerId],
    references: [users.id],
    relationName: "followers",
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [wishlists.eventId],
    references: [events.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const promocodesRelations = relations(promocodes, ({ one, many }) => ({
  creator: one(users, {
    fields: [promocodes.creatorId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [promocodes.eventId],
    references: [events.id],
  }),
  purchases: many(purchases),
}));

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  averageRating: true,
  totalRatings: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true,
  status: true,
  paymentIntentId: true,
  ticketCode: true,
  isCheckedIn: true,
  checkInDate: true,
  promocodeId: true,
  discountAmount: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFollowerSchema = createInsertSchema(followers).omit({
  id: true,
  createdAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertPromocodeSchema = createInsertSchema(promocodes).omit({
  id: true,
  createdAt: true,
  usesCount: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Follower = typeof followers.$inferSelect;
export type InsertFollower = z.infer<typeof insertFollowerSchema>;

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Promocode = typeof promocodes.$inferSelect;
export type InsertPromocode = z.infer<typeof insertPromocodeSchema>;
