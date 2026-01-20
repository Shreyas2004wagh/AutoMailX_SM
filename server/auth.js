const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// Ensure callback URL uses HTTPS - ALWAYS use HTTPS for production
let callbackURL = process.env.GOOGLE_CALLBACK_URL || "https://automailx-sm.onrender.com/auth/google/callback";

// Force HTTPS - never allow HTTP in production
if (callbackURL.startsWith("http://")) {
  console.warn("⚠️  WARNING: Callback URL was HTTP, forcing HTTPS");
  callbackURL = callbackURL.replace("http://", "https://");
}

// Ensure it ends with /auth/google/callback
if (!callbackURL.endsWith("/auth/google/callback")) {
  callbackURL = callbackURL.replace(/\/$/, "") + "/auth/google/callback";
}

// Final validation - must be HTTPS
if (!callbackURL.startsWith("https://")) {
  throw new Error(`Invalid callback URL: ${callbackURL}. Must use HTTPS.`);
}

console.log("🔐 Google OAuth Callback URL:", callbackURL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { 
        profile, 
        accessToken, 
        refreshToken 
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});