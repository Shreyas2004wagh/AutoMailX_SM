const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
  emailId: { type: String, required: true, unique: true }, // Unique ID for each email
  from: { type: String, required: true }, 
  subject: { type: String, required: true }, 
  content: { type: String, required: true }, 
  aiSummary: { type: String }, // AI summary (can be generated later)
  aiResponse: { type: String },
}, { timestamps: true });

const Email = mongoose.model("Email", EmailSchema);
module.exports = Email;
