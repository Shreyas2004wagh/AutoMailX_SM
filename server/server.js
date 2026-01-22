require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");
const emailRoutes = require("./routes/emailRoutes");
const authRoutes = require("./routes"); // Existing auth routes (login/signup)

require("./auth"); // Import Google OAuth strategy

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Trust proxy for Render (important for HTTPS detection)
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5174/content",
      "https://automailx.vercel.app",
      "https://automailx-sm.onrender.com/get-emails",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    // console.log("Session data:", req.session);
  }
  next();
});

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  try {
    res.json({ message: "Server is running successfully 🚀" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile", "https://www.googleapis.com/auth/gmail.readonly"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ User Authenticated via Google");

    req.session.user = {
      id: req.user.profile.id,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      email: req.user.profile.emails[0].value,
      name: req.user.profile.displayName,
    };

    // Generate JWT token for frontend
    const token = jwt.sign(
      { id: req.user.profile.id, email: req.user.profile.emails[0].value },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Redirect to frontend with token
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

// Use Routes
app.use(authRoutes); // Login/Signup
app.use(emailRoutes); // Email related routes

app.listen(port, () => console.log(`🚀 Server running on PORT: ${port}`));