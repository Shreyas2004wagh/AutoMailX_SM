const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    if (!process.env.DATABASE_URI) {
        throw new Error("DATABASE_URI is not configured");
    }

    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
