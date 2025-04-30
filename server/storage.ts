import { 
  events, purchases, users, reviews, followers, wishlists, notifications, promocodes,
  type Event, type InsertEvent, 
  type Purchase, type InsertPurchase, 
  type User, type InsertUser, 
  type Review, type InsertReview,
  type Follower, type InsertFollower,
  type Wishlist, type InsertWishlist,
  type Notification, type InsertNotification,
  type Promocode, type InsertPromocode,
  UserRole 
} from "@shared/schema";
import { Store } from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { createId } from '@paralleldrive/cuid2';

// For password hashing
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Generate a secure ticket code
export function generateTicketCode(): string {
  return createId();
}

// Generate a QR code URL for a ticket
export function getQRCodeUrl(ticketCode: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketCode}`;
}

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  updateLastLogin(id: number): Promise<boolean>;
  updateStripeCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // Event methods
  getAllEvents(): Promise<Event[]>;
  getFeaturedEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  searchEvents(query: string): Promise<Event[]>;
  getEventsByGenre(genre: string): Promise<Event[]>;
  getEventsByCreator(creatorId: number): Promise<Event[]>;
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  getEventsByDate(date: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  updateEventRating(eventId: number, rating: number): Promise<Event>;
  
  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchasesByEvent(eventId: number): Promise<Purchase[]>;
  getPurchasesByUser(userId: number): Promise<Purchase[]>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase>;
  checkInTicket(ticketCode: string): Promise<Purchase>;
  
  // Review methods
  createReview(review: InsertReview): Promise<Review>;
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByEvent(eventId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  updateReview(id: number, review: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Follower methods
  followOrganizer(follower: InsertFollower): Promise<Follower>;
  unfollowOrganizer(followerId: number, organizerId: number): Promise<boolean>;
  getFollowers(organizerId: number): Promise<User[]>;
  getFollowing(followerId: number): Promise<User[]>;
  isFollowing(followerId: number, organizerId: number): Promise<boolean>;
  
  // Wishlist methods
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: number, eventId: number): Promise<boolean>;
  getWishlistByUser(userId: number): Promise<Event[]>;
  isInWishlist(userId: number, eventId: number): Promise<boolean>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Promocode methods
  createPromocode(promocode: InsertPromocode): Promise<Promocode>;
  getPromocode(id: number): Promise<Promocode | undefined>;
  getPromocodeByCode(code: string): Promise<Promocode | undefined>;
  getPromocodesByCreator(creatorId: number): Promise<Promocode[]>;
  getPromocodesByEvent(eventId: number): Promise<Promocode[]>;
  validatePromocode(code: string, eventId?: number): Promise<Promocode | null>;
  usePromocode(id: number): Promise<Promocode>;
  
  // Auth methods
  verifyCredentials(username: string, password: string): Promise<User | null>;
  
  // Session store
  sessionStore: Store;
}

// Import for MemoryStore
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  // This class is used for development only, we're actually using the DatabaseStorage
  // but TypeScript requires us to implement all interface methods
  // (in a real application, we would refactor this)
  private events: Map<number, Event>;
  private purchases: Map<number, Purchase>;
  private users: Map<number, User> = new Map<number, User>();
  private eventIdCounter: number;
  private purchaseIdCounter: number;
  private userIdCounter: number = 1;
  sessionStore: Store = new MemoryStore({ checkPeriod: 86400000 });

  constructor() {
    this.events = new Map<number, Event>();
    this.purchases = new Map<number, Purchase>();
    this.eventIdCounter = 1;
    this.purchaseIdCounter = 1;
    
    // Initialize with sample events
    this.initSampleEvents();
  }

  private initSampleEvents() {
    const sampleEvents: InsertEvent[] = [
      {
        title: "Concert in the Park",
        description: "Join us for a magical evening of live music under the stars. Featuring top artists and bands.",
        date: "2023-10-01",
        time: "7:00 PM",
        location: "Central Park, New York",
        price: 25.99,
        genre: "Concert",
        imageUrl: "https://picsum.photos/seed/1/800/500",
        capacity: 1000,
        isFeatured: true,
      },
      {
        title: "Festival of Lights",
        description: "Annual celebration of lights, culture, and community. Various performances, food stalls, and activities for all ages.",
        date: "2023-10-15",
        time: "6:00 PM",
        location: "Riverside Park, Chicago",
        price: 15.50,
        genre: "Festival",
        imageUrl: "https://picsum.photos/seed/2/800/500",
        capacity: 2500,
        isFeatured: true,
      },
      {
        title: "Rock Band Tour",
        description: "The legendary rock band is back on tour with their newest album. Don't miss this once-in-a-lifetime experience.",
        date: "2023-11-05",
        time: "8:30 PM",
        location: "Madison Square Garden, New York",
        price: 89.99,
        genre: "Concert",
        imageUrl: "https://picsum.photos/seed/3/800/500",
        capacity: 5000,
        isFeatured: true,
      },
      {
        title: "Jazz Night",
        description: "Experience the smooth sounds of jazz with our ensemble of talented musicians in an intimate setting.",
        date: "2023-11-20",
        time: "9:00 PM",
        location: "Blue Note Jazz Club, New Orleans",
        price: 35.00,
        genre: "Concert",
        imageUrl: "https://picsum.photos/seed/4/800/500",
        capacity: 200,
        isFeatured: true,
      },
      {
        title: "Comedy Showcase",
        description: "Laugh the night away with performances from top comedians and rising stars in the comedy scene.",
        date: "2023-12-10",
        time: "8:00 PM",
        location: "The Comedy Store, Los Angeles",
        price: 30.00,
        genre: "Comedy",
        imageUrl: "https://picsum.photos/seed/5/800/500",
        capacity: 300,
        isFeatured: false,
      },
      {
        title: "Classical Orchestra",
        description: "The Symphony Orchestra presents a night of classical masterpieces from Beethoven, Mozart, and Bach.",
        date: "2023-12-15",
        time: "7:00 PM",
        location: "Symphony Hall, Boston",
        price: 45.00,
        genre: "Classical",
        imageUrl: "https://picsum.photos/seed/6/800/500",
        capacity: 800,
        isFeatured: false,
      },
      {
        title: "Theater Production: Hamlet",
        description: "Shakespeare's classic tragedy brought to life by our talented theater company.",
        date: "2024-01-10",
        time: "7:30 PM",
        location: "Grand Theater, London",
        price: 40.00,
        genre: "Theater",
        imageUrl: "https://picsum.photos/seed/7/800/500",
        capacity: 500,
        isFeatured: false,
      },
      {
        title: "Dance Festival",
        description: "Celebrating diversity in dance with performances spanning ballet, contemporary, hip-hop, and traditional styles.",
        date: "2024-01-25",
        time: "6:00 PM",
        location: "Performing Arts Center, San Francisco",
        price: 28.50,
        genre: "Dance",
        imageUrl: "https://picsum.photos/seed/8/800/500",
        capacity: 1200,
        isFeatured: false,
      }
    ];
    
    sampleEvents.forEach(event => this.createEvent(event));
  }

  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async searchEvents(query: string): Promise<Event[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.events.values()).filter(event => 
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.location.toLowerCase().includes(lowercaseQuery) ||
      event.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getEventsByGenre(genre: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => 
      event.genre?.toLowerCase() === genre.toLowerCase()
    );
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const newEvent: Event = { id, ...event };
    this.events.set(id, newEvent);
    return newEvent;
  }

  // Purchase methods
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = this.purchaseIdCounter++;
    const newPurchase: Purchase = { id, ...purchase };
    this.purchases.set(id, newPurchase);
    return newPurchase;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getPurchasesByEvent(eventId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(purchase => 
      purchase.eventId === eventId
    );
  }

  // Implementing missing methods to satisfy TypeScript
  // Note: These are just stub implementations for development 
  async createUser(): Promise<User> { throw new Error("Not implemented"); }
  async getUser(): Promise<User | undefined> { throw new Error("Not implemented"); }
  async getUserByUsername(): Promise<User | undefined> { throw new Error("Not implemented"); }
  async getUserByEmail(): Promise<User | undefined> { throw new Error("Not implemented"); }
  async updateUser(): Promise<User | undefined> { throw new Error("Not implemented"); }
  async updateLastLogin(): Promise<boolean> { throw new Error("Not implemented"); }
  async updateStripeCustomerId(): Promise<User> { throw new Error("Not implemented"); }
  async updateUserStripeInfo(): Promise<User> { throw new Error("Not implemented"); }
  async getAllUsers(): Promise<User[]> { throw new Error("Not implemented"); }
  async searchUsers(): Promise<User[]> { throw new Error("Not implemented"); }
  async deleteUser(): Promise<boolean> { throw new Error("Not implemented"); }
  async getFeaturedEvents(): Promise<Event[]> { throw new Error("Not implemented"); }
  async getEventsByCreator(): Promise<Event[]> { throw new Error("Not implemented"); }
  async getUpcomingEvents(): Promise<Event[]> { throw new Error("Not implemented"); }
  async getEventsByDate(): Promise<Event[]> { throw new Error("Not implemented"); }
  async updateEvent(): Promise<Event | undefined> { throw new Error("Not implemented"); }
  async deleteEvent(): Promise<boolean> { throw new Error("Not implemented"); }
  async updateEventRating(): Promise<Event> { throw new Error("Not implemented"); }
  async getPurchasesByUser(): Promise<Purchase[]> { throw new Error("Not implemented"); }
  async updatePurchaseStatus(): Promise<Purchase> { throw new Error("Not implemented"); }
  async checkInTicket(): Promise<Purchase> { throw new Error("Not implemented"); }
  async createReview(): Promise<Review> { throw new Error("Not implemented"); }
  async getReview(): Promise<Review | undefined> { throw new Error("Not implemented"); }
  async getReviewsByEvent(): Promise<Review[]> { throw new Error("Not implemented"); }
  async getReviewsByUser(): Promise<Review[]> { throw new Error("Not implemented"); }
  async updateReview(): Promise<Review | undefined> { throw new Error("Not implemented"); }
  async deleteReview(): Promise<boolean> { throw new Error("Not implemented"); }
  async followOrganizer(): Promise<Follower> { throw new Error("Not implemented"); }
  async unfollowOrganizer(): Promise<boolean> { throw new Error("Not implemented"); }
  async getFollowers(): Promise<User[]> { throw new Error("Not implemented"); }
  async getFollowing(): Promise<User[]> { throw new Error("Not implemented"); }
  async isFollowing(): Promise<boolean> { throw new Error("Not implemented"); }
  async addToWishlist(): Promise<Wishlist> { throw new Error("Not implemented"); }
  async removeFromWishlist(): Promise<boolean> { throw new Error("Not implemented"); }
  async getWishlistByUser(): Promise<Event[]> { throw new Error("Not implemented"); }
  async isInWishlist(): Promise<boolean> { throw new Error("Not implemented"); }
  async createNotification(): Promise<Notification> { throw new Error("Not implemented"); }
  async getNotificationsByUser(): Promise<Notification[]> { throw new Error("Not implemented"); }
  async markNotificationAsRead(): Promise<Notification> { throw new Error("Not implemented"); }
  async markAllNotificationsAsRead(): Promise<boolean> { throw new Error("Not implemented"); }
  async deleteNotification(): Promise<boolean> { throw new Error("Not implemented"); }
  async createPromocode(): Promise<Promocode> { throw new Error("Not implemented"); }
  async getPromocode(): Promise<Promocode | undefined> { throw new Error("Not implemented"); }
  async getPromocodeByCode(): Promise<Promocode | undefined> { throw new Error("Not implemented"); }
  async getPromocodesByCreator(): Promise<Promocode[]> { throw new Error("Not implemented"); }
  async getPromocodesByEvent(): Promise<Promocode[]> { throw new Error("Not implemented"); }
  async validatePromocode(): Promise<Promocode | null> { throw new Error("Not implemented"); }
  async usePromocode(): Promise<Promocode> { throw new Error("Not implemented"); }
  async verifyCredentials(): Promise<User | null> { throw new Error("Not implemented"); }
}

// Database storage implementation
import { db } from "./db";
import { eq, like, or, and, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(user.password);
    const [newUser] = await db.insert(users)
      .values({
        ...user,
        password: hashedPassword
      })
      .returning();
    return newUser;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }
    
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateLastLogin(id: number): Promise<boolean> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
    return true;
  }
  
  async updateStripeCustomerId(userId: number, customerId: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ 
        stripeCustomerId: stripeInfo.customerId,
        stripeSubscriptionId: stripeInfo.subscriptionId
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }
  
  async searchUsers(query: string): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(
        or(
          like(users.username, query),
          like(users.email, query),
          like(users.fullName, query)
        )
      )
      .orderBy(users.username);
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // To be safe, we first check if the user exists
    const user = await this.getUser(id);
    if (!user) {
      return false;
    }
    
    // Then delete related records before deleting the user to maintain referential integrity
    // This is a simplification - in a production environment, you might want to soft delete
    // or archive user data instead of hard deleting it
    
    // Delete user's purchases (and related data)
    const purchases = await this.getPurchasesByUser(id);
    for (const purchase of purchases) {
      await db.delete(purchases).where(eq(purchases.id, purchase.id));
    }
    
    // Delete user's reviews
    await db.delete(reviews).where(eq(reviews.userId, id));
    
    // Delete user's followers/following relationships
    await db.delete(followers).where(eq(followers.followerId, id));
    await db.delete(followers).where(eq(followers.organizerId, id));
    
    // Delete user's wishlist items
    await db.delete(wishlists).where(eq(wishlists.userId, id));
    
    // Delete user's notifications
    await db.delete(notifications).where(eq(notifications.userId, id));
    
    // Delete user's promocodes
    await db.delete(promocodes).where(eq(promocodes.creatorId, id));
    
    // Finally, delete the user
    await db.delete(users).where(eq(users.id, id));
    
    return true;
  }
  
  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }
  
  async getFeaturedEvents(): Promise<Event[]> {
    return await db.select()
      .from(events)
      .where(eq(events.isFeatured, true));
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }
  
  async searchEvents(query: string): Promise<Event[]> {
    const searchPattern = `%${query}%`;
    return await db.select().from(events).where(
      or(
        like(events.title, searchPattern),
        like(events.description, searchPattern),
        like(events.location, searchPattern)
      )
    );
  }
  
  async getEventsByGenre(genre: string): Promise<Event[]> {
    if (genre === 'all') {
      return this.getAllEvents();
    }
    return await db.select().from(events).where(eq(events.genre, genre));
  }
  
  async getEventsByCreator(creatorId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.creatorId, creatorId));
  }
  
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    return await db.select()
      .from(events)
      .where(
        and(
          eq(events.published, true),
          // Compare string dates - not perfect but works for our date format (YYYY-MM-DD)
          or(
            eq(events.date, today),
            sql`${events.date} > ${today}`
          )
        )
      )
      .limit(limit);
  }
  
  async getEventsByDate(date: string): Promise<Event[]> {
    return await db.select()
      .from(events)
      .where(eq(events.date, date));
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db.update(events)
      .set({
        ...eventData,
        updatedAt: new Date()
      })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true; // If no error is thrown, consider it successful
  }
  
  async updateEventRating(eventId: number, rating: number): Promise<Event> {
    // Get the current event to calculate new average
    const event = await this.getEvent(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    // Calculate new average rating
    const currentTotal = (event.averageRating || 0) * (event.totalRatings || 0);
    const newTotalRatings = (event.totalRatings || 0) + 1;
    const newAverageRating = (currentTotal + rating) / newTotalRatings;
    
    // Update the event with new rating data
    const [updatedEvent] = await db.update(events)
      .set({
        averageRating: newAverageRating,
        totalRatings: newTotalRatings,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId))
      .returning();
    
    return updatedEvent;
  }
  
  // Purchase methods
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    // Generate a unique ticket code
    const ticketCode = generateTicketCode();
    
    const [newPurchase] = await db.insert(purchases)
      .values({
        ...purchase,
        ticketCode
      })
      .returning();
    
    // Create notification for the user
    const event = await this.getEvent(purchase.eventId);
    if (event) {
      await this.createNotification({
        userId: purchase.userId,
        type: "purchase",
        message: `You have successfully purchased ${purchase.quantity} ticket(s) for "${event.title}".`,
        relatedId: newPurchase.id
      });
    }
    
    return newPurchase;
  }
  
  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase;
  }
  
  async getPurchasesByEvent(eventId: number): Promise<Purchase[]> {
    return await db.select()
      .from(purchases)
      .where(eq(purchases.eventId, eventId));
  }
  
  async getPurchasesByUser(userId: number): Promise<Purchase[]> {
    return await db.select()
      .from(purchases)
      .where(eq(purchases.userId, userId));
  }
  
  async updatePurchaseStatus(id: number, status: "pending" | "completed" | "canceled" | "refunded"): Promise<Purchase> {
    const [updatedPurchase] = await db.update(purchases)
      .set({ status: status as any }) // Type casting to avoid strict type issues
      .where(eq(purchases.id, id))
      .returning();
    return updatedPurchase;
  }
  
  async checkInTicket(ticketCode: string): Promise<Purchase> {
    const [purchase] = await db.select()
      .from(purchases)
      .where(eq(purchases.ticketCode, ticketCode));
    
    if (!purchase) {
      throw new Error("Ticket not found");
    }
    
    if (purchase.isCheckedIn) {
      throw new Error("Ticket already checked in");
    }
    
    const [updatedPurchase] = await db.update(purchases)
      .set({ 
        isCheckedIn: true,
        checkInDate: new Date()
      })
      .where(eq(purchases.id, purchase.id))
      .returning();
    
    return updatedPurchase;
  }
  
  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews)
      .values(review)
      .returning();
    
    // Update the event's average rating
    await this.updateEventRating(review.eventId, review.rating);
    
    // Notify the event creator
    const event = await this.getEvent(review.eventId);
    if (event) {
      await this.createNotification({
        userId: event.creatorId,
        type: "review",
        message: `Someone left a ${review.rating}-star review for your event "${event.title}".`,
        relatedId: newReview.id
      });
    }
    
    return newReview;
  }
  
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByEvent(eventId: number): Promise<Review[]> {
    return await db.select()
      .from(reviews)
      .where(eq(reviews.eventId, eventId));
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db.select()
      .from(reviews)
      .where(eq(reviews.userId, userId));
  }
  
  async updateReview(id: number, reviewData: Partial<Review>): Promise<Review | undefined> {
    // If rating is changing, we need to update event's average rating
    const existingReview = await this.getReview(id);
    if (existingReview && reviewData.rating && reviewData.rating !== existingReview.rating) {
      // This is simplified - in a real app we'd recalculate the entire average
      await this.updateEventRating(existingReview.eventId, reviewData.rating);
    }
    
    const [updatedReview] = await db.update(reviews)
      .set({
        ...reviewData,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    // In a real app, deleting a review would also update the event's average rating
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  }
  
  // Follower methods
  async followOrganizer(follower: InsertFollower): Promise<Follower> {
    // Check if already following
    const isAlreadyFollowing = await this.isFollowing(
      follower.followerId, 
      follower.organizerId
    );
    
    if (isAlreadyFollowing) {
      throw new Error("Already following this organizer");
    }
    
    const [newFollower] = await db.insert(followers)
      .values(follower)
      .returning();
    
    // Notify the organizer
    const followerUser = await this.getUser(follower.followerId);
    await this.createNotification({
      userId: follower.organizerId,
      type: "follow",
      message: `${followerUser?.fullName || followerUser?.username || "Someone"} is now following you.`,
      relatedId: follower.followerId
    });
    
    return newFollower;
  }
  
  async unfollowOrganizer(followerId: number, organizerId: number): Promise<boolean> {
    await db.delete(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.organizerId, organizerId)
        )
      );
    return true;
  }
  
  async getFollowers(organizerId: number): Promise<User[]> {
    const followerRelations = await db.select()
      .from(followers)
      .where(eq(followers.organizerId, organizerId));
    
    // Get details of all followers
    const followerUsers: User[] = [];
    for (const relation of followerRelations) {
      const user = await this.getUser(relation.followerId);
      if (user) {
        followerUsers.push(user);
      }
    }
    
    return followerUsers;
  }
  
  async getFollowing(followerId: number): Promise<User[]> {
    const followingRelations = await db.select()
      .from(followers)
      .where(eq(followers.followerId, followerId));
    
    // Get details of all followed organizers
    const followedUsers: User[] = [];
    for (const relation of followingRelations) {
      const user = await this.getUser(relation.organizerId);
      if (user) {
        followedUsers.push(user);
      }
    }
    
    return followedUsers;
  }
  
  async isFollowing(followerId: number, organizerId: number): Promise<boolean> {
    const [result] = await db.select()
      .from(followers)
      .where(
        and(
          eq(followers.followerId, followerId),
          eq(followers.organizerId, organizerId)
        )
      );
    
    return !!result;
  }
  
  // Wishlist methods
  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    // Check if already in wishlist
    const isAlreadyInWishlist = await this.isInWishlist(
      wishlist.userId, 
      wishlist.eventId
    );
    
    if (isAlreadyInWishlist) {
      throw new Error("Event already in wishlist");
    }
    
    const [newWishlistItem] = await db.insert(wishlists)
      .values(wishlist)
      .returning();
    
    return newWishlistItem;
  }
  
  async removeFromWishlist(userId: number, eventId: number): Promise<boolean> {
    await db.delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.eventId, eventId)
        )
      );
    return true;
  }
  
  async getWishlistByUser(userId: number): Promise<Event[]> {
    // Get wishlist items
    const wishlistItems = await db.select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId));
    
    // Get details of all events
    const wishlistEvents: Event[] = [];
    for (const item of wishlistItems) {
      const event = await this.getEvent(item.eventId);
      if (event) {
        wishlistEvents.push(event);
      }
    }
    
    return wishlistEvents;
  }
  
  async isInWishlist(userId: number, eventId: number): Promise<boolean> {
    const [result] = await db.select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.eventId, eventId)
        )
      );
    
    return !!result;
  }
  
  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }
  
  async getNotificationsByUser(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
    if (unreadOnly) {
      return await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .orderBy(notifications.createdAt);
    } else {
      return await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(notifications.createdAt);
    }
  }
  
  async markNotificationAsRead(id: number): Promise<Notification> {
    const [updatedNotification] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
    return true;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }
  
  // Promocode methods
  async createPromocode(promocode: InsertPromocode): Promise<Promocode> {
    const [newPromocode] = await db.insert(promocodes)
      .values(promocode)
      .returning();
    return newPromocode;
  }
  
  async getPromocode(id: number): Promise<Promocode | undefined> {
    const [promocode] = await db.select().from(promocodes).where(eq(promocodes.id, id));
    return promocode;
  }
  
  async getPromocodeByCode(code: string): Promise<Promocode | undefined> {
    const [promocode] = await db.select().from(promocodes).where(eq(promocodes.code, code));
    return promocode;
  }
  
  async getPromocodesByCreator(creatorId: number): Promise<Promocode[]> {
    return await db.select()
      .from(promocodes)
      .where(eq(promocodes.creatorId, creatorId));
  }
  
  async getPromocodesByEvent(eventId: number): Promise<Promocode[]> {
    return await db.select()
      .from(promocodes)
      .where(eq(promocodes.eventId, eventId));
  }
  
  async validatePromocode(code: string, eventId?: number): Promise<Promocode | null> {
    const promocode = await this.getPromocodeByCode(code);
    
    // Check if promocode exists
    if (!promocode) {
      return null;
    }
    
    // Check if active
    if (!promocode.isActive) {
      return null;
    }
    
    // Check if not expired
    if (promocode.endDate && new Date(promocode.endDate) < new Date()) {
      return null;
    }
    
    // Check if not before start date
    if (promocode.startDate && new Date(promocode.startDate) > new Date()) {
      return null;
    }
    
    // Check if max uses not exceeded
    if (promocode.maxUses !== null && 
        promocode.usesCount !== null && 
        promocode.maxUses > 0 && 
        promocode.usesCount >= promocode.maxUses) {
      return null;
    }
    
    // Check if valid for this event (if promocode is event-specific)
    if (promocode.eventId && eventId && promocode.eventId !== eventId) {
      return null;
    }
    
    return promocode;
  }
  
  async usePromocode(id: number): Promise<Promocode> {
    const [updatedPromocode] = await db.update(promocodes)
      .set({ 
        usesCount: sql`${promocodes.usesCount} + 1` 
      })
      .where(eq(promocodes.id, id))
      .returning();
    return updatedPromocode;
  }
  
  // Auth methods
  async verifyCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (isPasswordValid) {
      // Update last login timestamp
      await this.updateLastLogin(user.id);
      return user;
    }
    
    return null;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
