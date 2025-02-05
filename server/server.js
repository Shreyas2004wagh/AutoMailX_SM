const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const { google } = require("googleapis");
const Router = require("./routes.js"); // Your existing routes
require("./auth"); // Import Google OAuth strategy

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ✅ Session setup
app.use(
  session({
    secret: process.env.JWT_SECRET, // Using JWT_SECRET from .env
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Home Route
app.get("/", (req, res) => {
  try {
    res.json({ message: "Server is running successfully 🚀" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Google OAuth Login
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile", "https://www.googleapis.com/auth/gmail.readonly"],
  })
);

// ✅ Google OAuth Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ User Authenticated:", req.user);

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/dashboard?token=${req.user.accessToken}`);
  }
);

// ✅ Fetch Emails Route
app.get("/emails", async (req, res) => {
  console.log("User session data:", req.user);

  if (!req.user || !req.user.accessToken) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: req.user.accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = response.data.messages;
    if (!messages) return res.status(200).json({ emails: [] });

    const emails = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        return {
          id: email.data.id,
          snippet: email.data.snippet,
          from: email.data.payload.headers.find(header => header.name === "From")?.value || "Unknown",
          subject: email.data.payload.headers.find(header => header.name === "Subject")?.value || "No Subject",
        };
      })
    );

    res.json({ emails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Debug Route: Check Session Data
app.get("/debug-session", (req, res) => {
  res.json({ user: req.user || null });
});

// ✅ Logout Route
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// ✅ Import additional routes
app.use(Router);

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server running on PORT: ${port}`));
