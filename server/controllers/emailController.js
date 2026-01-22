const { google } = require("googleapis");
const Email = require("../models/Email.js");
const {
    resolveGeminiModel,
    classifyEmailWithGemini,
    generateResponse,
} = require("../services/geminiService.js");
const { getEmailContent } = require("../services/gmailService.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET /emails - Fetch emails from Gmail and store in DB
const getEmails = async (req, res) => {
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
};

// GET /get-emails - Get all emails from DB with AI classification
const getEmailsFromDB = async (req, res) => {
    try {
        const emails = await Email.find().lean();

        const classifiedEmails = await Promise.all(
            emails.map(async (email) => {
                const mappedEmail = {
                    ...email,
                    id: email.emailId || email._id.toString(),
                    content: email.content || "",
                };

                if (email.category) {
                    return mappedEmail;
                }

                const combinedContent = `${email.subject || ""} ${email.content || ""}`;
                if (combinedContent.trim().length > 0) {
                    const category = await classifyEmailWithGemini(combinedContent);

                    await Email.updateOne(
                        { _id: email._id },
                        { $set: { category: category } }
                    );

                    return { ...mappedEmail, category };
                }

                return { ...mappedEmail, category: "neutral" };
            })
        );

        res.json({ emails: classifiedEmails });
    } catch (error) {
        console.error("Error fetching and classifying emails:", error);
        res.status(500).json({ error: "Failed to fetch and classify emails." });
    }
};

// POST /summarize - Summarize email content
const summarizeEmail = async (req, res) => {
    try {
        const { emailContent } = req.body;

        if (!emailContent || typeof emailContent !== "string" || emailContent.trim().length === 0) {
            console.error("Invalid email content received:", { emailContent, type: typeof emailContent });
            return res.status(400).json({ message: "Email content is required and must be a non-empty string" });
        }

        await resolveGeminiModel();

        console.log("📝 Summarizing email content, length:", emailContent.length);

        const modelName = await resolveGeminiModel();
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Please provide a concise summary of the following text:\n\n${emailContent.trim()}`;
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        if (!responseText || responseText.trim().length === 0) {
            console.error("Empty response from Gemini API");
            return res.status(500).json({ message: "Received empty response from AI service" });
        }

        console.log("✅ Summary generated successfully, length:", responseText.length);
        res.json({ summary: responseText.trim() });
    } catch (error) {
        console.error("❌ Error generating summary:", error);
        const errorMessage = error.message || "Unknown error occurred";
        res.status(500).json({ message: `Error summarizing email: ${errorMessage}` });
    }
};

// POST /generate-response - Generate AI response to email
const generateEmailResponse = async (req, res) => {
    try {
        console.log("📩 Incoming Request Body:", req.body);

        const { emailContent } = req.body;
        if (!emailContent) {
            console.log("🚨 Missing email content in request.");
            return res.status(400).json({ message: "Email content is required" });
        }

        const responseText = await generateResponse(emailContent);
        if (!responseText) {
            console.log("🚨 Gemini API returned an empty response.");
            return res.status(500).json({ message: "No response generated" });
        }

        res.json({ response: responseText });
    } catch (error) {
        console.error("🚨 API Call Failed:", error.response?.data || error.message);
        res.status(500).json({ message: "Error generating response", error: error.message });
    }
};

module.exports = {
    getEmails,
    getEmailsFromDB,
    summarizeEmail,
    generateEmailResponse,
};
