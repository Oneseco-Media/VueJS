import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.js";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const callbackURL = process.env.CALLBACK_URL || `${process.env.REPLIT_DOMAINS?.split(',')[0] ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/callback` : 'http://localhost:5000/api/callback'}`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;
          const firstName = profile.name?.givenName || null;
          const lastName = profile.name?.familyName || null;
          const profileImageUrl = profile.photos?.[0]?.value || null;

          // Optional: Restrict to specific Google Workspace domain
          if (process.env.GOOGLE_WORKSPACE_DOMAIN) {
            const domain = email?.split('@')[1];
            if (domain !== process.env.GOOGLE_WORKSPACE_DOMAIN) {
              return done(new Error(`Only ${process.env.GOOGLE_WORKSPACE_DOMAIN} accounts are allowed`));
            }
          }

          const user = await storage.upsertUser({
            id: profile.id,
            email,
            firstName,
            lastName,
            profileImageUrl,
          });

          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.get(
    "/api/login",
    passport.authenticate("google", {
      scope: ['profile', 'email'],
      // Add hd parameter for Google Workspace domain hint if configured
      ...(process.env.GOOGLE_WORKSPACE_DOMAIN && {
        hd: process.env.GOOGLE_WORKSPACE_DOMAIN,
      }),
    })
  );

  app.get(
    "/api/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/landing",
    })
  );

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/landing");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
