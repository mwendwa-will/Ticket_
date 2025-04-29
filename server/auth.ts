import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { comparePasswords } from "./storage";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  // Session setup
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ticket-booking-app-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // LocalStrategy for username/password auth
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.verifyCredentials(username, password);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user for session management
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Create the user
      const user = await storage.createUser(req.body);

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send back password and other sensitive info
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        // Don't send back password and other sensitive info
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Don't send back password and other sensitive info
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Helper middleware for role-based authorization
  const authorizeRoles = (roles: string[]) => {
    return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "You don't have permission to access this resource" });
      }
      
      next();
    };
  };

  return { authorizeRoles };
}