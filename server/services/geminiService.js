require("dotenv").config();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let GEMINI_MODEL = process.env.GEMINI_MODEL || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function geminiApiUrlForModel(model) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

async function resolveGeminiModel() {
    if (GEMINI_MODEL) return GEMINI_MODEL;
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const resp = await axios.get(url);
    const models = resp.data?.models || [];

    const candidate = models.find(
        (m) =>
            Array.isArray(m.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes("generateContent")
    );

    const name = candidate?.name || "";
    if (!name) {
        throw new Error(
            "No Gemini models available that support generateContent for this API key."
        );
    }

    GEMINI_MODEL = name.startsWith("models/") ? name.slice("models/".length) : name;
    console.log("✅ Resolved Gemini model:", GEMINI_MODEL);
    return GEMINI_MODEL;
}

async function classifyEmailWithGemini(emailContent) {
    try {
        const model = await resolveGeminiModel();
        const prompt = `You are an email classification expert. Analyze the following email and determine its primary category. Return ONLY ONE of the following categories: urgent, positive, neutral, calendar.

    * urgent: High-priority issues, security alerts, requiring immediate action.
    * positive: Positive feedback, confirmations, successful outcomes, greetings.
    * neutral: General information, updates, non-urgent communication.
    * calendar: Meeting requests, event invitations, scheduling confirmations.

    Email Content:
    ${emailContent}

    Category:`;

        const response = await axios.post(geminiApiUrlForModel(model), {
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
}

async function getSummary(text) {
    try {
        const modelName = await resolveGeminiModel();
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Please provide a concise summary of the following text:\n\n${text}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Error generating summary";
    }
}

async function generateResponse(emailContent) {
    const modelName = await resolveGeminiModel();
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Given the following email, generate a single email response:\n\n${emailContent}`;
    const result = await model.generateContent(prompt);
    return await result.response.text();
}

module.exports = {
    resolveGeminiModel,
    classifyEmailWithGemini,
    getSummary,
    generateResponse,
};
