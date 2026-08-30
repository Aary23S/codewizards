//contact.controller.js
const ContactInfo = require("../models/ContactInfo");
const sendEmail = require("../utils/sendEmail");

const getContact = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) {
      // Return defaults if not set yet
      info = {
        email: "codewizards@dypatil.edu",
        location: "D.Y. Patil Agriculture & Technical University, Talsande",
        department: "Department of Computer Science & Engineering",
        github: "https://github.com/codewizards",
        linkedin: "",
        instagram: "",
        twitter: "",
      };
    }
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upsertContact = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (info) {
      info = await ContactInfo.findByIdAndUpdate(info._id, req.body, { new: true });
    } else {
      info = await ContactInfo.create(req.body);
    }
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// POST /api/v1/contact/message — public "send us a message" form
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    if (name.length > 200 || email.length > 200 || message.length > 5000) {
      return res.status(400).json({ success: false, message: "One of the fields is too long" });
    }

    const info = await ContactInfo.findOne();
    const inboxEmail = process.env.CONTACT_INBOX_EMAIL || info?.email || "codewizards@dypatil.edu";

    await sendEmail({
      to: inboxEmail,
      subject: `CodeWizards contact form — ${name.trim()}`,
      html: `
        <p><strong>From:</strong> ${escapeHtml(name.trim())} (${escapeHtml(email.trim())})</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message.trim()).replace(/\n/g, "<br>")}</p>
      `,
    });

    res.json({ success: true, message: "Message sent — we'll get back to you soon." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not send your message, please try again later" });
  }
};

module.exports = { getContact, upsertContact, sendContactMessage };