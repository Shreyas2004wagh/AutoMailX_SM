const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const { google } = require("googleapis");
const Router = require("./routes.js"); // Your existing routes
require("./auth"); // Import Google OAuth strategy
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure you have this in .env
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const axios = require("axios");
const Email = require("./models/Email.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");


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

const classifyEmailWithGemini = async (emailContent) => {
  try {
    // Craft a CLEAR prompt for Gemini:
    const prompt = `You are an email classification expert. Analyze the following email and determine its primary category.  Return ONLY ONE of the following categories: urgent, positive, neutral, calendar.

    * urgent: High-priority issues, security alerts, requiring immediate action.
    * positive:  Positive feedback, confirmations, successful outcomes, greetings.
    * neutral: General information, updates, non-urgent communication.
    * calendar: Meeting requests, event invitations, scheduling confirmations.

    Email Content:
    ${emailContent}

    Category:`; //  CRUCIAL: End with "Category:" for consistent results.

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
      //  { headers: { "Content-Type": "application/json" } }  // Not needed, axios does this by default
    );

    //  More robust result parsing:
    let classification =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?.trim()
        .toLowerCase() || "neutral";

    //Handle unexpected output formats
    if (
      !["urgent", "positive", "neutral", "calendar"].includes(classification)
    ) {
      classification = "neutral";
    }

    return classification;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message); // Log detailed errors!
    return "neutral"; // Default to neutral on error.
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getSummary(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Please provide a concise summary of the following text:\n\n${text}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Gemini Response:", response); // Debugging
    return response.text();
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary";
  }
}


app.post("/summarize", async (req, res) => {
  try {
    const { emailContent } = req.body;
    if (!emailContent) {
      return res.status(400).json({ message: "Email content is required" });
    }
    const summary = await getSummary(emailContent);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: "Error summarizing email"});
}
});

// Add this new route
app.post("/generate-response", async (req, res) => {
  try {
    const { emailContent } = req.body;
    if (!emailContent) {
      return res.status(400).json({ message: "Email content is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Given the following email, please generate a suitable response:\n\n${emailContent}\n\nResponse:`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text(); // Important: get .text()

    res.json({ response: responseText }); // Send back the response text
  } catch (error) {
    console.error("Error generating response:", error);
    res
      .status(500)
      .json({ message: "Error generating response", error: error.message });
  }
});

// --- Modified /get-emails Route ---

app.get("/get-emails", async (req, res) => {
  try {
    const emails = await Email.find().lean(); // Use .lean() for performance!

    const classifiedEmails = await Promise.all(
      emails.map(async (email) => {
        //check in the db if the email already exits category
        if (email.category) {
          return email;
        }

        const combinedContent = `${email.subject} ${email.content}`;
        const category = await classifyEmailWithGemini(combinedContent);

        // Update the email document in the database WITH THE CATEGORY
        await Email.updateOne(
          { _id: email._id },
          { $set: { category: category } }
        ); //MongoDB Id always has an "_"

        //add category to email
        return { ...email, category };
      })
    );

    res.json({ emails: classifiedEmails });
  } catch (error) {
    console.error("Error fetching and classifying emails:", error);
    res.status(500).json({ error: "Failed to fetch and classify emails." }); // Consistent error message.
  }
});

//IMPORTANT -- This should go before any route that might need to read the emails from Gmail
//Fetch All emails
app.get("/emails", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "User not authenticated" });

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: req.session.user.accessToken });
  const gmail = google.gmail({ version: "v1", auth });
  let fetchedEmails = [];
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });
    const messages = response.data.messages || [];

    // Fetch full content for each email and store in fetchedEmails
    fetchedEmails = await Promise.all(
      messages.map((msg) => getEmailContent(gmail, msg.id))
    );
    for (const email of fetchedEmails) {
      // Check if the email already exists in the database to prevent duplicates
      const existingEmail = await Email.findOne({ emailId: email.id });

      if (!existingEmail) {
        await Email.create({
          emailId: email.id,
          from: email.from,
          subject: email.subject,
          content: email.content,
          aiSummary: "", // AI Summary can be added later
        });
      }
    }
    return res.json({ emails: fetchedEmails }); // Send response to frontend  //Return for an early return
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    res.status(500).json({ error: error.message });
  }
});

// ... (rest of your server.js file: logout, debug, etc.)

async function getEmailContent(gmail, emailId) {
  try {
    const email = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
    });

    const headers = email.data.payload.headers;

    const from = headers.find((h) => h.name === "From")?.value || "Unknown";
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "No Subject";

    let emailContent = "No Content Available";

    // Check if the email has parts (multipart emails)
    if (email.data.payload.parts) {
      for (let part of email.data.payload.parts) {
        if (part.mimeType === "text/plain") {
          emailContent = Buffer.from(part.body.data, "base64").toString(
            "utf-8"
          );
          break;
        }
      }
    } else {
      // If it's a single-part email
      emailContent = Buffer.from(
        email.data.payload.body.data || "",
        "base64"
      ).toString("utf-8");
    }

    return { id: emailId, from, subject, content: emailContent };
  } catch (error) {
    console.error("❌ Error fetching email content:", error);
    return {
      id: emailId,
      from: "Unknown",
      subject: "Error",
      content: "Failed to fetch email content.",
    };
  }
}

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
