const express = require("express");
const {
    getEmails,
    getEmailsFromDB,
    summarizeEmail,
    generateEmailResponse,
} = require("../controllers/emailController.js");

const router = express.Router();

router.get("/emails", getEmails);
router.get("/get-emails", getEmailsFromDB);
router.post("/summarize", summarizeEmail);
router.post("/generate-response", generateEmailResponse);

module.exports = router;
