require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const emailRoutes = require("./routes/emailRoutes");
const authRoutes = require("./routes");
const { hasGoogleOAuthConfig } = require("./auth");

const app = express();
const port = process.env.PORT || 5000;
const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured");
}

if (!sessionSecret) {
  throw new Error("SESSION_SECRET or JWT_SECRET must be configured");
}

connectDB();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://automailx.vercel.app",
      "https://auto-mail-x-sm.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully" });
});

app.get(
  "/auth/google",
  (req, res, next) => {
    if (!hasGoogleOAuthConfig) {
      return res.status(503).json({
        message: "Google OAuth is not configured on this server",
      });
    }

    return next();
  },
  passport.authenticate("google", {
    scope: ["email", "profile", "https://www.googleapis.com/auth/gmail.readonly"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("User authenticated via Google");

    req.session.user = {
      id: req.user.profile.id,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      email: req.user.profile.emails[0].value,
      name: req.user.profile.displayName,
    };

    const token = jwt.sign(
      { id: req.user.profile.id, email: req.user.profile.emails[0].value },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/content?token=${token}`);
  }
);

app.get("/debug-session", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

app.use(authRoutes);
app.use(emailRoutes);

app.listen(port, () => console.log(`Server running on PORT: ${port}`));
