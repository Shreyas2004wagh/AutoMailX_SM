require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const { google } = require("googleapis");
const Router = require("./routes.js"); // Import your existing routes
require("./auth"); // Import Google OAuth strategy
const axios = require("axios");
const Email = require("./models/Email.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:3000", // Local development
    "http://localhost:5173", // Possibly another local dev port
    "https://auto-mail-x-sm.vercel.app",
    "https://auto-mail-x-sm.vercel.app/content",
    "https://auto-mail-x-sm.vercel.app/Login",
    "https://auto-mail-x-sm.vercel.app/login",
    "https://auto-mail-x-sm.vercel.app/SignUp",
    "https://auto-mail-x-sm.vercel.app/Emails",
    "https://auto-mail-x-sm.vercel.app/",
    "https://automailx-sm.onrender.com/get-emails",
    "*",
    "**"
     // Your production frontend
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // IMPORTANT for sessions
  optionsSuccessStatus: 204, // Best practice for preflight
};
app.use(cors(corsOptions));

// Database Connection (Error Handling Improved)
mongoose
  .connect(process.env.DATABASE_URI) // No need for the deprecated options
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit the process on a fatal error
  });

// Middleware
app.use(express.json());

// Session Configuration (More Secure)
app.use(
  session({
    secret: process.env.JWT_SECRET, // Use a strong secret!
    resave: false,
    saveUninitialized: false, // Better for privacy/efficiency
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      sameSite: "lax", // CSRF protection.  'strict' might be too restrictive.
    },
  })
);

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---

// Home Route
app.get("/", (req, res) => {
  res.json({ message: "Server is running successfully 🚀" });
});

// Gemini Classification Function (with better error handling)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const classifyEmailWithGemini = async (emailContent) => {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    return "neutral"; // Return a default or throw error
  }

  try {
    const prompt = `You are an email classification expert. Analyze the following email and determine its primary category. Return ONLY ONE of the following categories: urgent, positive, neutral, calendar.

Email Content:
${emailContent}

Category:`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let classification = responseText.trim().toLowerCase() || "neutral";
    if (
      !["urgent", "positive", "neutral", "calendar"].includes(classification)
    ) {
      classification = "neutral";
    }
    return classification;
  } catch (error) {
    console.error("Gemini API Error:", error); // Log the full error object
    return "neutral"; // Default category
  }
};

// Summarization Route
async function getSummary(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Please provide a concise summary of the following text:\n\n${text}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
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
    res.status(200).json({ summary }); // Use consistent status codes
  } catch (error) {
    console.error("Error in /summarize:", error); // More detailed logging
    res
      .status(500)
      .json({ message: "Error summarizing email", error: error.message }); // Include error details
  }
});

// Response Generation Route
app.post("/generate-response", async (req, res) => {
  try {
    const { emailContent } = req.body;
    if (!emailContent) {
      return res.status(400).json({ message: "Email content is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Given the following email, please generate a suitable response:\n\n${emailContent}\n\nResponse:`;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error in /generate-response:", error);
    res
      .status(500)
      .json({ message: "Error generating response", error: error.message });
  }
});

// Save response. Make sure the client is sending correct request body data
app.post("/save-response", async (req, res) => {
  try {
    const { emailId, response } = req.body; //receive emailID and the response that user confirmed
    if (!emailId || !response) {
      return res
        .status(400)
        .json({ message: "Email Id and response are required" }); //
    }
    // Find email, and upate. {new:true} --> return the updated doc
    const updateEmail = await Email.findOneAndUpdate(
      { emailId: emailId },
      { aiSummary: response },
      { new: true }
    );

    if (!updateEmail) {
      return res.status(404).json({ message: "Email not found" });
    }
    //send success response with update data
    res.status(200).json({ message: "Response saved", email: updateEmail });
  } catch (error) {
    console.error("Error saving response:", error);
    res
      .status(500)
      .json({ message: "Error saving response", error: error.message }); //send to frontend
  }
});

// Get Emails with Classification (Improved)
app.get("/get-emails", async (req, res) => {
  try {
    const emails = await Email.find().lean(); // Use .lean()

    const classifiedEmails = await Promise.all(
      emails.map(async (email) => {
        if (email.category) {
          return email; // Already classified
        }

        const combinedContent = `${email.subject} ${email.content}`;
        const category = await classifyEmailWithGemini(combinedContent);

        // Update the email in DB. Await this to complete!
        const updatedEmail = await Email.findByIdAndUpdate(
          email._id,
          { $set: { category: category } },
          { new: true, lean: true } // Return the modified document
        );
        //If could not update for any reasion
        return updatedEmail || { ...email, category: "neutral" }; // Fallback
      })
    );

    res.status(200).json({ emails: classifiedEmails }); // 200 OK
  } catch (error) {
    console.error("Error in /get-emails:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch and classify emails.",
        message: error.message,
      }); // More detail
  }
});

// Fetch Emails from Gmail (Simplified and more robust)
app.get("/emails", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: req.session.user.accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10, // Or however many you want
    });

    const messages = response.data.messages || [];
    const fetchedEmails = await Promise.all(
      messages.map((msg) => getEmailContent(gmail, msg.id))
    );

    // Save/Update emails in database.
    for (const email of fetchedEmails) {
      const existingEmail = await Email.findOne({ emailId: email.id });

      if (existingEmail) {
        //Update exisiting
        await Email.updateOne(
          { emailId: email.id },
          {
            $set: {
              from: email.from,
              subject: email.subject,
              content: email.content,
              // No aiSummary as new ones should come up un summarized
            },
          }
        );
      } else {
        await Email.create({
          emailId: email.id,
          from: email.from,
          subject: email.subject,
          content: email.content,
          aiSummary: "",
        });
      }
    }

    res.status(200).json({ emails: fetchedEmails });
  } catch (error) {
    console.error("Error fetching emails from Gmail:", error);
    res.status(500).json({ error: error.message });
  }
});

//Helper function to get each emails (centralize error handling)
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

    let content = "No Content Available";
    if (email.data.payload.parts) {
      // Multipart email.  Prioritize plain text.
      const textPart = email.data.payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );
      const htmlPart = email.data.payload.parts.find(
        (part) => part.mimeType === "text/html"
      );

      if (textPart) {
        content = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      } else if (htmlPart) {
        content = Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
      }
    } else if (email.data.payload.body && email.data.payload.body.data) {
      content = Buffer.from(email.data.payload.body.data, "base64").toString(
        "utf-8"
      );
    }

    return { id: emailId, from, subject, content };
  } catch (error) {
    console.error("Error in getEmailContent:", error); //Detailed error
    return {
      id: emailId,
      from: "Unknown",
      subject: "Error",
      content: "Failed to fetch content.",
    };
  }
}

// Login Route (Simplified - Consider using a database)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  ); // DUMMY

  if (user) {
    req.session.user = { username: user.username }; //set User session
    res
      .status(200)
      .json({ message: "Login successful", user: req.session.user });
  } else {
    return res.status(401).json({ error: "Invalid credentials" });
  }
});

// Google OAuth Routes (Keep these as they are mostly correct)
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("User Authenticated:", req.user);
    req.session.user = {
      id: req.user.id,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      email: req.user.email,
    };

    res.redirect("http://localhost:5173/content"); //change if necessary
  }
);

// Debug Session Route
app.get("/debug-session", (req, res) => {
  res.json({ session: req.session }); // Return the entire session for debugging
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    // Destroy the session
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    //Redirect to login page on successfull logout
    res.status(200).json({ message: "Log out!" });
  });
});

// Use your other routes
app.use(Router);

// Start the Server
app.listen(port, () => console.log(`🚀 Server running on PORT: ${port}`));
