require("dotenv").config();
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let GEMINI_MODEL = process.env.GEMINI_MODEL || "";
let AVAILABLE_MODELS = null;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const DEFAULT_MODEL_FALLBACKS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-pro",
    "gemini-pro-latest",
];

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeModelName(name) {
    return name.startsWith("models/") ? name.slice("models/".length) : name;
}

function isRetryableGeminiError(error) {
    const status = error?.status || error?.response?.status;
    return [429, 500, 503, 504].includes(status);
}

async function listAvailableGenerativeModels() {
    if (AVAILABLE_MODELS) {
        return AVAILABLE_MODELS;
    }

    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const resp = await axios.get(url);
    const models = resp.data?.models || [];

    AVAILABLE_MODELS = models
        .filter(
            (model) =>
                Array.isArray(model.supportedGenerationMethods) &&
                model.supportedGenerationMethods.includes("generateContent")
        )
        .map((model) => normalizeModelName(model.name));

    return AVAILABLE_MODELS;
}

async function resolveGeminiModel() {
    if (GEMINI_MODEL) {
        return GEMINI_MODEL;
    }

    const models = await listAvailableGenerativeModels();
    const preferredCandidates = [...DEFAULT_MODEL_FALLBACKS, ...models];
    const name = preferredCandidates.find((candidate) => models.includes(candidate)) || "";

    if (!name) {
        throw new Error(
            "No Gemini models available that support generateContent for this API key."
        );
    }

    GEMINI_MODEL = normalizeModelName(name);
    console.log("Resolved Gemini model:", GEMINI_MODEL);
    return GEMINI_MODEL;
}

async function getCandidateModels() {
    const availableModels = await listAvailableGenerativeModels();
    const orderedCandidates = [
        GEMINI_MODEL,
        ...DEFAULT_MODEL_FALLBACKS,
        ...availableModels,
    ]
        .filter(Boolean)
        .map((model) => normalizeModelName(model));

    return [...new Set(orderedCandidates)].filter((model) =>
        availableModels.includes(model)
    );
}

async function generateTextWithFallback(prompt) {
    const modelsToTry = await getCandidateModels();
    if (modelsToTry.length === 0) {
        throw new Error("No Gemini text generation models are available for this API key.");
    }

    let lastError = null;

    for (const modelName of modelsToTry) {
        const model = genAI.getGenerativeModel({ model: modelName });

        for (let attempt = 1; attempt <= 2; attempt += 1) {
            try {
                const result = await model.generateContent(prompt);
                const text = await result.response.text();

                if (text && text.trim().length > 0) {
                    return text.trim();
                }

                throw new Error(`Gemini returned an empty response for model ${modelName}.`);
            } catch (error) {
                lastError = error;
                const status = error?.status || error?.response?.status || "unknown";

                console.error(
                    `Gemini request failed for model ${modelName} on attempt ${attempt}:`,
                    status,
                    error?.message || error
                );

                if (attempt < 2 && isRetryableGeminiError(error)) {
                    await sleep(1000 * attempt);
                    continue;
                }

                break;
            }
        }
    }

    const fallbackError = new Error(
        `All Gemini models failed. Last error: ${lastError?.message || "Unknown error"}`
    );
    fallbackError.cause = lastError;
    throw fallbackError;
}

async function classifyEmailWithGemini(emailContent) {
    try {
        const prompt = `You are an email classification expert. Analyze the following email and determine its primary category. Return ONLY ONE of the following categories: urgent, positive, neutral, calendar.

    * urgent: High-priority issues, security alerts, requiring immediate action.
    * positive: Positive feedback, confirmations, successful outcomes, greetings.
    * neutral: General information, updates, non-urgent communication.
    * calendar: Meeting requests, event invitations, scheduling confirmations.

    Email Content:
    ${emailContent}

    Category:`;

        let classification = (await generateTextWithFallback(prompt)).toLowerCase();

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
        const prompt = `Please provide a concise summary of the following text:\n\n${text}`;
        return await generateTextWithFallback(prompt);
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Error generating summary";
    }
}

async function generateResponse(emailContent) {
    const prompt = `Given the following email, generate a single email response:\n\n${emailContent}`;
    return await generateTextWithFallback(prompt);
}

module.exports = {
    resolveGeminiModel,
    classifyEmailWithGemini,
    getSummary,
    generateResponse,
};
