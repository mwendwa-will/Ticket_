import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseSchema, insertEventSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and get role-based middleware
  const { checkRole } = setupAuth(app);
  
  // Define user roles
  const ROLE_ADMIN = "admin";
  const ROLE_ORGANIZER = "organizer";
  const ROLE_USER = "user";
  
  // Get all events
  app.get("/api/events", async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const genre = req.query.genre as string | undefined;
      
      let events;
      
      if (search) {
        events = await storage.searchEvents(search);
      } else if (genre) {
        events = await storage.getEventsByGenre(genre);
      } else {
        events = await storage.getAllEvents();
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Get a specific event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });
  
  // Get events created by the current user (for organizers)
  app.get("/api/my-events", checkRole([ROLE_ADMIN, ROLE_ORGANIZER]), async (req, res) => {
    try {
      const events = await storage.getEventsByCreator(req.user!.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ error: "Failed to fetch your events" });
    }
  });
  
  // Create a new event (for organizers and admins)
  app.post("/api/events", checkRole([ROLE_ADMIN, ROLE_ORGANIZER]), async (req, res) => {
    try {
      // Create event data with creator ID
      const eventData = {
        ...req.body,
        creatorId: req.user!.id,
        published: true,
      };
      
      // Validate event data
      const validatedData = insertEventSchema.parse(eventData);
      
      // Create event
      const event = await storage.createEvent(validatedData);
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid event data",
          details: error.errors
        });
      }
      res.status(500).json({ error: "Failed to create event" });
    }
  });
  
  // Update an event (only by creator or admin)
  app.put("/api/events/:id", checkRole([ROLE_ADMIN, ROLE_ORGANIZER]), async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if user is the creator or an admin
      if (event.creatorId !== req.user!.id && req.user!.role !== ROLE_ADMIN) {
        return res.status(403).json({ error: "You don't have permission to update this event" });
      }
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });
  
  // Delete an event (only by creator or admin)
  app.delete("/api/events/:id", checkRole([ROLE_ADMIN, ROLE_ORGANIZER]), async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Check if user is the creator or an admin
      if (event.creatorId !== req.user!.id && req.user!.role !== ROLE_ADMIN) {
        return res.status(403).json({ error: "You don't have permission to delete this event" });
      }
      
      await storage.deleteEvent(eventId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Create a purchase (requires authentication)
  app.post("/api/purchases", checkRole([ROLE_USER, ROLE_ORGANIZER, ROLE_ADMIN]), async (req, res) => {
    try {
      // Validate purchase data
      const purchaseData = insertPurchaseSchema.extend({
        purchaseDate: z.string().default(() => new Date().toISOString()),
        userId: z.number().default(() => req.user!.id), // Get user ID from session
      }).parse({
        ...req.body,
        purchaseDate: new Date().toISOString(),
        userId: req.user!.id,
      });
      
      // Check if event exists
      const event = await storage.getEvent(purchaseData.eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      // Create purchase
      const purchase = await storage.createPurchase(purchaseData);
      
      res.status(201).json({ 
        message: "Purchase successful", 
        purchase 
      });
    } catch (error) {
      console.error("Error creating purchase:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid purchase data",
          details: error.errors
        });
      }
      res.status(500).json({ error: "Failed to create purchase" });
    }
  });

  // Get purchases for an event (admin only)
  app.get("/api/events/:id/purchases", checkRole([ROLE_ADMIN]), async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const purchases = await storage.getPurchasesByEvent(eventId);
      
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });
  
  // Get user's purchases
  app.get("/api/my-purchases", checkRole([ROLE_USER, ROLE_ORGANIZER, ROLE_ADMIN]), async (req, res) => {
    try {
      const purchases = await storage.getPurchasesByUser(req.user!.id);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ error: "Failed to fetch your purchases" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
