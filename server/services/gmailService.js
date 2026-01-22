const { google } = require("googleapis");

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

module.exports = { getEmailContent };
