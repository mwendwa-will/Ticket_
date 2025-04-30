import { db } from "./db";
import { 
  UserRole, users, events, purchases, reviews, followers, 
  wishlists, notifications, promocodes 
} from "../shared/schema";
import { log } from "./vite";
import { sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// For password hashing
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function setupDatabase() {
  try {
    log("Starting database setup...");
    
    // First, check if we need to drop tables for a clean start
    // This is not ideal for production, but helps during development
    // when schema changes need to be applied
    const shouldRecreateSchema = process.env.RECREATE_SCHEMA === 'true';
    
    if (shouldRecreateSchema) {
      log("Recreating database schema...");
      // Drop tables in reverse order of dependencies
      try {
        await db.execute(sql`DROP TABLE IF EXISTS promocodes`);
        await db.execute(sql`DROP TABLE IF EXISTS notifications`);
        await db.execute(sql`DROP TABLE IF EXISTS wishlists`);
        await db.execute(sql`DROP TABLE IF EXISTS followers`);
        await db.execute(sql`DROP TABLE IF EXISTS reviews`);
        await db.execute(sql`DROP TABLE IF EXISTS purchases`);
        await db.execute(sql`DROP TABLE IF EXISTS events`);
        await db.execute(sql`DROP TABLE IF EXISTS users`);
        
        log("All tables dropped successfully");
      } catch (error) {
        console.error("Error dropping tables:", error);
      }
    }
    
    // Check if users table exists by trying to query it
    try {
      await db.select().from(users).limit(1);
      log("Users table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating users table...");
        // Create users table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            full_name TEXT,
            role TEXT NOT NULL DEFAULT 'user',
            profile_image TEXT,
            bio TEXT,
            phone TEXT,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        log("Users table created successfully");
      } else {
        throw error;
      }
    }
    
    // Check if events table exists
    try {
      await db.select().from(events).limit(1);
      log("Events table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating events table...");
        // Create events table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            location TEXT NOT NULL,
            price NUMERIC NOT NULL,
            genre TEXT,
            image_url TEXT NOT NULL,
            capacity INTEGER,
            is_featured BOOLEAN DEFAULT FALSE,
            creator_id INTEGER NOT NULL,
            published BOOLEAN DEFAULT TRUE,
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION,
            end_date TEXT,
            end_time TEXT,
            average_rating DOUBLE PRECISION,
            total_ratings INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        log("Events table created successfully");
      } else {
        throw error;
      }
    }
    
    // Check if purchases table exists
    try {
      await db.select().from(purchases).limit(1);
      log("Purchases table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating purchases table...");
        // Create purchases table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS purchases (
            id SERIAL PRIMARY KEY,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total_amount NUMERIC NOT NULL,
            status TEXT DEFAULT 'completed',
            payment_intent_id TEXT,
            ticket_code TEXT,
            promocode_id INTEGER,
            discount_amount NUMERIC,
            is_checked_in BOOLEAN DEFAULT FALSE,
            check_in_date TIMESTAMP,
            purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        log("Purchases table created successfully");
      } else {
        throw error;
      }
    }
    
    // Check if reviews table exists
    try {
      await db.select().from(reviews).limit(1);
      log("Reviews table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating reviews table...");
        // Create reviews table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        log("Reviews table created successfully");
      } else {
        throw error;
      }
    }
    
    // Check if followers table exists
    try {
      await db.select().from(followers).limit(1);
      log("Followers table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating followers table...");
        // Create followers table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS followers (
            id SERIAL PRIMARY KEY,
            follower_id INTEGER NOT NULL,
            organizer_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, organizer_id)
          )
        `);
        log("Followers table created successfully");
      } else {
        throw error;
      }
    }
    
    // Check if wishlists table exists
    try {
      await db.select().from(wishlists).limit(1);
      log("Wishlists table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating wishlists table...");
        // Create wishlists table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS wishlists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, event_id)
          )
        `);
        log("Wishlists table created successfully");
      } else {
        throw error;
      }
    }
    
    // Check if notifications table exists
    try {
      await db.select().from(notifications).limit(1);
      log("Notifications table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating notifications table...");
        // Create notifications table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            message TEXT NOT NULL,
            related_id INTEGER,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        log("Notifications table created successfully");
      } else {
        throw error;
      }
    }
    
    // Check if promocodes table exists
    try {
      await db.select().from(promocodes).limit(1);
      log("Promocodes table already exists");
    } catch (error: any) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        log("Creating promocodes table...");
        // Create promocodes table
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS promocodes (
            id SERIAL PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            discount_type TEXT NOT NULL,
            discount_amount NUMERIC NOT NULL,
            max_uses INTEGER,
            uses_count INTEGER DEFAULT 0,
            event_id INTEGER,
            creator_id INTEGER NOT NULL,
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        log("Promocodes table created successfully");
      } else {
        throw error;
      }
    }
    
    // Create admin user if no users exist
    try {
      const countResult = await db.execute(sql`SELECT COUNT(*) FROM users`);
      const count = parseInt(countResult.rows[0][0] as string);
      
      if (count === 0) {
        log("Creating admin user...");
        
        // Admin password hash
        const hashedPassword = await hashPassword("admin123");
        
        // Insert admin user
        await db.insert(users).values({
          username: "admin",
          email: "admin@ticketmaster.com",
          password: hashedPassword,
          fullName: "Admin User",
          role: UserRole.ADMIN,
          bio: "System administrator",
          phone: "+1234567890"
        });
        
        log("Admin user created with username: 'admin' and password: 'admin123'");
      }
    } catch (error) {
      console.error("Error checking or creating admin user:", error);
    }
    
    log("Database setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}

export default setupDatabase;