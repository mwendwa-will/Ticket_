import { storage } from "./storage";
import { db } from "./db";
import { events } from "@shared/schema";
import { hashPassword } from "./auth";

async function seedSampleEvents() {
  console.log("Starting event seeding...");
  
  try {
    // First, check if we already have events
    const existingEvents = await storage.getAllEvents();
    
    if (existingEvents.length > 0) {
      console.log(`Database already contains ${existingEvents.length} events. Skipping seeding.`);
      return;
    }
    
    // Create sample users first if not exist
    const adminUser = await storage.getUserByUsername("admin");
    const organizerUser = await storage.getUserByUsername("organizer");
    
    let adminId: number;
    let organizerId: number;
    
    if (!adminUser) {
      const admin = await storage.createUser({
        username: "admin",
        email: "admin@example.com",
        password: await hashPassword("admin123"),
        role: "admin",
        fullName: "Admin User",
      });
      adminId = admin.id;
      console.log("Created admin user with ID:", adminId);
    } else {
      adminId = adminUser.id;
    }
    
    if (!organizerUser) {
      const organizer = await storage.createUser({
        username: "organizer",
        email: "organizer@example.com",
        password: await hashPassword("organizer123"),
        role: "organizer",
        fullName: "Event Organizer",
      });
      organizerId = organizer.id;
      console.log("Created organizer user with ID:", organizerId);
    } else {
      organizerId = organizerUser.id;
    }
    
    // Sample events
    const sampleEvents = [
      {
        title: "Summer Music Festival",
        description: "A three-day music festival featuring top artists from around the world. Enjoy live performances, food stalls, and camping under the stars.",
        date: "2025-07-15",
        time: "14:00",
        location: "Central Park, New York",
        price: "150.00",
        genre: "Music Festival",
        imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        capacity: 5000,
        creatorId: organizerId,
        isFeatured: true,
        published: true,
      },
      {
        title: "Tech Conference 2025",
        description: "Join industry leaders and innovators for a conference on the latest technology trends. Sessions include AI, blockchain, and quantum computing.",
        date: "2025-09-05",
        time: "09:00",
        location: "Moscone Center, San Francisco",
        price: "299.99",
        genre: "Conference",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        capacity: 2000,
        creatorId: adminId,
        isFeatured: true,
        published: true,
      },
      {
        title: "Broadway Musical: Hamilton",
        description: "Experience the award-winning musical about the life of American Founding Father Alexander Hamilton. Featuring an incredible score that blends hip-hop, jazz, and R&B.",
        date: "2025-08-10",
        time: "19:30",
        location: "Richard Rodgers Theatre, New York",
        price: "199.50",
        genre: "Theater",
        imageUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        capacity: 1300,
        creatorId: organizerId,
        isFeatured: true,
        published: true,
      },
      {
        title: "International Food Festival",
        description: "Sample cuisines from over 30 countries at this international food festival. Live cooking demonstrations, wine tastings, and cultural performances.",
        date: "2025-06-20",
        time: "11:00",
        location: "Waterfront Park, San Diego",
        price: "45.00",
        genre: "Food",
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
        capacity: 3000,
        creatorId: organizerId,
        isFeatured: false,
        published: true,
      },
      {
        title: "Marathon for Charity",
        description: "Run for a cause in this annual charity marathon. Choose from 5K, 10K, half, or full marathon distances. All proceeds go to children's education.",
        date: "2025-05-10",
        time: "07:00",
        location: "Downtown, Chicago",
        price: "75.00",
        genre: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        capacity: 10000,
        creatorId: adminId,
        isFeatured: false,
        published: true,
      },
      {
        title: "Comic Con 2025",
        description: "The ultimate fan experience with celebrity panels, exhibitors, artists, and exclusive merchandise. Cosplay encouraged!",
        date: "2025-10-15",
        time: "10:00",
        location: "Convention Center, San Diego",
        price: "120.00",
        genre: "Entertainment",
        imageUrl: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80",
        capacity: 15000,
        creatorId: organizerId,
        isFeatured: true,
        published: true,
      },
      {
        title: "Wine & Cheese Festival",
        description: "Taste premium wines from local and international vineyards paired with artisanal cheeses. Learn from sommeliers and cheese makers in interactive workshops.",
        date: "2025-04-25",
        time: "16:00",
        location: "Napa Valley, California",
        price: "85.00",
        genre: "Food",
        imageUrl: "https://images.unsplash.com/photo-1567131658599-6711552ea08c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1372&q=80",
        capacity: 1000,
        creatorId: organizerId,
        isFeatured: false,
        published: true,
      },
      {
        title: "Art Exhibition: Modern Masters",
        description: "A curated collection of modern art masterpieces on loan from major museums around the world. Audio guides and expert tours available.",
        date: "2025-02-10",
        time: "10:00",
        location: "Metropolitan Museum, New York",
        price: "25.00",
        genre: "Art",
        imageUrl: "https://images.unsplash.com/photo-1574182245530-7a5b86c12aa1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1527&q=80",
        capacity: 500,
        creatorId: adminId,
        isFeatured: false,
        published: true,
      },
      {
        title: "Rock Concert: Imagine Dragons",
        description: "Experience the energy of Imagine Dragons live in concert as part of their world tour. Special guests and opening acts to be announced.",
        date: "2025-11-18",
        time: "20:00",
        location: "Madison Square Garden, New York",
        price: "125.00",
        genre: "Concert",
        imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        capacity: 20000,
        creatorId: organizerId,
        isFeatured: true,
        published: true,
      },
      {
        title: "Business Leadership Summit",
        description: "A two-day summit featuring keynote speakers, workshops, and networking opportunities for business leaders and entrepreneurs.",
        date: "2025-03-15",
        time: "08:30",
        location: "Hilton Hotel, Chicago",
        price: "349.99",
        genre: "Conference",
        imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        capacity: 800,
        creatorId: adminId,
        isFeatured: false,
        published: true,
      }
    ];
    
    // Insert events
    for (const eventData of sampleEvents) {
      await storage.createEvent(eventData);
    }
    
    console.log(`Successfully seeded ${sampleEvents.length} events`);
  } catch (error) {
    console.error("Error seeding events:", error);
  }
}

export { seedSampleEvents };