import { events, purchases, type Event, type InsertEvent, type Purchase, type InsertPurchase } from "@shared/schema";

export interface IStorage {
  // Event methods
  getAllEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  searchEvents(query: string): Promise<Event[]>;
  getEventsByGenre(genre: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchasesByEvent(eventId: number): Promise<Purchase[]>;
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

export const storage = new MemStorage();
