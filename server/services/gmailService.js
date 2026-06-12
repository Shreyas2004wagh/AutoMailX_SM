const { google } = require("googleapis");

function decodeGmailBody(data = "") {
    const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(normalized, "base64").toString("utf-8");
}

function findMimePart(payload, mimeType) {
    if (!payload) {
        return null;
    }

    if (payload.mimeType === mimeType && payload.body?.data) {
        return payload;
    }

    for (const part of payload.parts || []) {
        const found = findMimePart(part, mimeType);
        if (found) {
            return found;
        }
    }

    return null;
}

function stripHtml(html) {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

async function getEmailContent(gmail, emailId) {
    try {
        const email = await gmail.users.messages.get({
            userId: "me",
            id: emailId,
        });

        const payload = email.data.payload;
        const headers = payload.headers || [];
        const from = headers.find((h) => h.name === "From")?.value || "Unknown";
        const subject = headers.find((h) => h.name === "Subject")?.value || "No Subject";

        let emailContent = "No Content Available";
        const textPart = findMimePart(payload, "text/plain");
        const htmlPart = findMimePart(payload, "text/html");

        if (textPart?.body?.data) {
            emailContent = decodeGmailBody(textPart.body.data);
        } else if (htmlPart?.body?.data) {
            emailContent = stripHtml(decodeGmailBody(htmlPart.body.data));
        } else if (payload.body?.data) {
            emailContent = decodeGmailBody(payload.body.data);
        }

        return { id: emailId, from, subject, content: emailContent };
    } catch (error) {
        console.error("Error fetching email content:", error);
        return {
            id: emailId,
            from: "Unknown",
            subject: "Error",
            content: "Failed to fetch email content.",
        };
    }
}

module.exports = { getEmailContent };
