require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const { google } = require("googleapis");

const Router = require("./routes.js");
require("./auth");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

const Router = require("./routes.js"); // Your existing routes
require("./auth"); // Import Google OAuth strategy
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure you have this in .env
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${GEMINI_API_KEY}`;

const axios = require("axios");
const Email = require("./models/Email.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const users = [
  { username: "testuser", password: "password123" },
];

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5174/content",
      "https://automailx.vercel.app",
      "https://automailx-sm-52mt.onrender.com/get-emails"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use((req, res, next) => {
  console.log("Session data:", req.session);
  next();
});

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
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

const classifyEmailWithGemini = async (emailContent) => {
  try {
    const prompt = `You are an email classification expert. Analyze the following email and determine its primary category. Return ONLY ONE of the following categories: urgent, positive, neutral, calendar.

    * urgent: High-priority issues, security alerts, requiring immediate action.
    * positive: Positive feedback, confirmations, successful outcomes, greetings.
    * neutral: General information, updates, non-urgent communication.
    * calendar: Meeting requests, event invitations, scheduling confirmations.

    Email Content:
    ${emailContent}

    Category:`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    let classification =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?.trim()
        .toLowerCase() || "neutral";

    if (!["urgent", "positive", "neutral", "calendar"].includes(classification)) {
      classification = "neutral";
    }

    return classification;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return "neutral";
  }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getSummary(text) {
  try {

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" }); // ✅ Correct Model

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


    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });


    const prompt = `Please provide a concise summary of the following text:\n\n${emailContent}`;
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    res.json({ summary: responseText });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Error summarizing email" });
  }
});

app.post("/generate-response", async (req, res) => {
  try {
    console.log("📩 Incoming Request Body:", req.body);

    const { emailContent } = req.body;
    if (!emailContent) {
      console.log("🚨 Missing email content in request.");
      return res.status(400).json({ message: "Email content is required" });
    }


    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

    const prompt = `Given the following email, generate a single email response:\n\n${emailContent}`;
    console.log("🔹 Sending Prompt to Gemini:", prompt);

    const result = await model.generateContent(prompt);
    console.log("✅ Gemini API Response:", result);

    const responseText = await result.response.text();
    if (!responseText) {
      console.log("🚨 Gemini API returned an empty response.");
      return res.status(500).json({ message: "No response generated" });
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error("🚨 API Call Failed:", error.response?.data || error.message);
    res.status(500).json({ message: "Error generating response", error: error.message });
  }
});

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
      maxResults: 10,
    });
    const messages = response.data.messages || [];

    const fetchedEmails = await Promise.all(
      messages.map((msg) => getEmailContent(gmail, msg.id))
    );

    for (const email of fetchedEmails) {
      const existingEmail = await Email.findOne({ emailId: email.id });

      if (!existingEmail) {
        await Email.create({
          emailId: email.id,
          from: email.from,
          subject: email.subject,
          content: email.content,
          aiSummary: "",
        });
      }
    }

    return res.json({ emails: fetchedEmails });
  } catch (error) {
    console.error("❌ Error fetching emails:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/get-emails", async (req, res) => {
  try {
    const emails = await Email.find().lean();

    const classifiedEmails = await Promise.all(
      emails.map(async (email) => {
        if (email.category) {
          return email;
        }

        const combinedContent = `${email.subject} ${email.content}`;
        const category = await classifyEmailWithGemini(combinedContent);

        await Email.updateOne(
          { _id: email._id },
          { $set: { category: category } }
        );

        return { ...email, category };
      })
    );

    res.json({ emails: classifiedEmails });
  } catch (error) {
    console.error("Error fetching and classifying emails:", error);
    res.status(500).json({ error: "Failed to fetch and classify emails." });
  }
});

async function getEmailContent(gmail, emailId) {
  try {
    const email = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
    });

    const headers = email.data.payload.headers;
    const from = headers.find((h) => h.name === "From")?.value || "Unknown";
    const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject";

    let emailContent = "No Content Available";

    if (email.data.payload.parts) {
      for (let part of email.data.payload.parts) {
        if (part.mimeType === "text/plain") {
          emailContent = Buffer.from(part.body.data, "base64").toString("utf-8");
          break;
        }
      }
    } else {
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

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.session.user = { username: user.username };
  res.json({ message: "Login successful", user: req.session.user });
});

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
    console.log("✅ User Authenticated:", req.user);

    req.session.user = {
      id: req.user.id,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      email: req.user.email,
    };

    res.redirect("http://localhost:5000/dashboard");
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

app.use(Router);

app.listen(port, () => console.log(`🚀 Server running on PORT: ${port}`));