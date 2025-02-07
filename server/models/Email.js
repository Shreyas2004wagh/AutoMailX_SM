//Email.js models
const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema(
  {
    emailId: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    aiSummary: { type: String }, //for fututre uses
    category: { type: String }, //Store category generated
  },
  { timestamps: true }
);

const Email = mongoose.model("Email", EmailSchema);

module.exports = Email;
