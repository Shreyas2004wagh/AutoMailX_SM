const { google } = require("googleapis");
const Email = require("../models/Email.js");
const {
    classifyEmailWithGemini,
    getSummary,
    generateResponse,
} = require("../services/geminiService.js");
const { getEmailContent } = require("../services/gmailService.js");

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
        console.error("Error fetching emails:", error);
        return res.status(500).json({ error: error.message });
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
                        { $set: { category } }
                    );

                    return { ...mappedEmail, category };
                }

                return { ...mappedEmail, category: "neutral" };
            })
        );

        return res.json({ emails: classifiedEmails });
    } catch (error) {
        console.error("Error fetching and classifying emails:", error);
        return res.status(500).json({ error: "Failed to fetch and classify emails." });
    }
};

// POST /summarize - Summarize email content
const summarizeEmail = async (req, res) => {
    try {
        const { emailContent } = req.body;

        if (!emailContent || typeof emailContent !== "string" || emailContent.trim().length === 0) {
            console.error("Invalid email content received:", {
                emailContent,
                type: typeof emailContent,
            });
            return res.status(400).json({
                message: "Email content is required and must be a non-empty string",
            });
        }

        console.log("Summarizing email content, length:", emailContent.length);
        const summaryText = await getSummary(emailContent.trim());

        if (!summaryText || summaryText.trim().length === 0) {
            return res.status(500).json({
                message: "Received empty response from AI service",
            });
        }

        if (summaryText === "Error generating summary") {
            return res.status(503).json({
                message: "AI service is temporarily unavailable. Please try again.",
            });
        }

        console.log("Summary generated successfully, length:", summaryText.length);
        return res.json({ summary: summaryText.trim() });
    } catch (error) {
        console.error("Error generating summary:", error);
        return res.status(500).json({
            message: `Error summarizing email: ${error.message || "Unknown error occurred"}`,
        });
    }
};

// POST /generate-response - Generate AI response to email
const generateEmailResponse = async (req, res) => {
    try {
        console.log("Incoming request body:", req.body);

        const { emailContent } = req.body;
        if (!emailContent) {
            return res.status(400).json({ message: "Email content is required" });
        }

        const responseText = await generateResponse(emailContent);
        if (!responseText) {
            return res.status(500).json({ message: "No response generated" });
        }

        return res.json({ response: responseText });
    } catch (error) {
        console.error("AI response generation failed:", error.message || error);
        return res.status(503).json({
            message: "Error generating response",
            error: error.message,
        });
    }
};

module.exports = {
    getEmails,
    getEmailsFromDB,
    summarizeEmail,
    generateEmailResponse,
};
