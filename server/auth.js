const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// Use BASE_URL from env or default to localhost for dev
// Production should always set BASE_URL to the actual domain (e.g. https://automailx-sm.onrender.com)
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const callbackURL = `${BASE_URL}/auth/google/callback`;

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