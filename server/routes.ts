import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPurchaseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get a specific event by ID
  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // Create a purchase
  app.post("/api/purchases", async (req, res) => {
    try {
      // Validate purchase data
      const purchaseData = insertPurchaseSchema.extend({
        purchaseDate: z.string().default(() => new Date().toISOString()),
      }).parse({
        ...req.body,
        purchaseDate: new Date().toISOString(),
      });
      
      // Check if event exists
      const event = await storage.getEvent(purchaseData.eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
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
          message: "Invalid purchase data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  // Get purchases for an event
  app.get("/api/events/:id/purchases", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const purchases = await storage.getPurchasesByEvent(eventId);
      
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
