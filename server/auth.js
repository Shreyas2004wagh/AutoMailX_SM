const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const callbackURL = `${BASE_URL}/auth/google/callback`;
const hasGoogleOAuthConfig =
  Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

if (hasGoogleOAuthConfig) {
  console.log("Google OAuth callback URL:", callbackURL);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
        scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.readonly"],
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, {
          profile,
          accessToken,
          refreshToken,
        });
      }
    )
  );
} else {
  console.warn("Google OAuth is disabled because credentials are not configured");
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = { hasGoogleOAuthConfig };
