import { events, purchases, users, type Event, type InsertEvent, type Purchase, type InsertPurchase, type User, type InsertUser, UserRole } from "@shared/schema";
import { Store } from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

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

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Event methods
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  searchEvents(query: string): Promise<Event[]>;
  getEventsByGenre(genre: string): Promise<Event[]>;
  getEventsByCreator(creatorId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchasesByEvent(eventId: number): Promise<Purchase[]>;
  getPurchasesByUser(userId: number): Promise<Purchase[]>;
  
  // Auth methods
  verifyCredentials(username: string, password: string): Promise<User | null>;
  
  // Session store
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private purchases: Map<number, Purchase>;
  private eventIdCounter: number;
  private purchaseIdCounter: number;

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
}

// Database storage implementation
import { db } from "./db";
import { eq, like, or, and } from "drizzle-orm";
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
  
  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
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
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db.update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true; // If no error is thrown, consider it successful
  }
  
  // Purchase methods
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db.insert(purchases).values(purchase).returning();
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
  
  // Auth methods
  async verifyCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isPasswordValid = await comparePasswords(password, user.password);
    return isPasswordValid ? user : null;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
