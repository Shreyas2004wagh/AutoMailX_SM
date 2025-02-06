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

// ✅ Dummy User Database (replace with a real database in production)
const users = [
  { username: "testuser", password: "password123" }, // Example user
];

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use((req, res, next) => {
  console.log("Session data:", req.session);
  next();
});


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

// ✅ Login Route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Save user in session
  req.session.user = { username: user.username };
  res.json({ message: "Login successful", user: req.session.user });
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

    // Store user details and access token in the session
    req.session.user = {
      id: req.user.id,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken, // Optional for token refreshing
      email: req.user.email,
    };

    // Redirect to frontend
    res.redirect("http://localhost:5000/dashboard");
  }
);



// ✅ Fetch Emails Route
let fetchedEmails = []; // Global variable to store fetched emails

// ✅ Route to Fetch and Store Emails
app.get("/emails", async (req, res) => {
  console.log("Session data in /emails route:", req.session); // Debugging

  if (!req.session.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const accessToken = req.session.user.accessToken;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });

    const messages = response.data.messages;
    if (!messages) return res.status(200).json({ emails: [] });

    // Fetch and store emails
    fetchedEmails = await Promise.all(
      messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        return {
          id: email.data.id,
          snippet: email.data.snippet,
          from:
            email.data.payload.headers.find(
              (header) => header.name === "From"
            )?.value || "Unknown",
          subject:
            email.data.payload.headers.find(
              (header) => header.name === "Subject"
            )?.value || "No Subject",
        };
      })
    );

    res.json({ emails: fetchedEmails }); // Send response
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ New Route to Serve Stored Emails
app.get("/get-emails", (req, res) => {
  if (!fetchedEmails.length) {
    return res.status(404).json({ error: "No emails fetched yet" });
  }

  res.json({ emails: fetchedEmails });
});


// ✅ Debug Route: Check Session Data
app.get("/debug-session", (req, res) => {
  res.json({ user: req.session.user || null });
});

// ✅ Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// ✅ Import additional routes
app.use(Router);

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server running on PORT: ${port}`));
