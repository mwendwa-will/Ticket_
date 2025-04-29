import { db } from "./db";
import { UserRole, users, events, purchases } from "../shared/schema";
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
            role TEXT NOT NULL DEFAULT '${UserRole.USER}',
            profile_image TEXT,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
            purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        log("Purchases table created successfully");
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
          role: UserRole.ADMIN
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