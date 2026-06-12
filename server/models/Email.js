//Email.js models
const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema(
  {
    emailId: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    aiSummary: { type: String },
    aiResponse: { type: String },
    category: { type: String },
  },
  { timestamps: true }
);

const Email = mongoose.model("Email", EmailSchema);

module.exports = Email;
