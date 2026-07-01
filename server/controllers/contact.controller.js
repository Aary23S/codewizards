const ContactInfo = require("../models/ContactInfo");

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

module.exports = { getContact, upsertContact };