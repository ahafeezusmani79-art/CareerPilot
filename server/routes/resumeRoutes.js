
const express = require("express");
const Resume = require("../models/Resume");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Retrieve the logged-in user's resume

router.get("/", protect, async (req, res) => {
  try {
    console.log("Frontend authenticated user ID:", req.userId);

    const resume = await Resume.findOne({ user: req.userId });

    console.log("Resume found:", resume);

    return res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve resume.",
    });
  }
});

// POST: Create or update the logged-in user's resume
router.post("/", protect, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "title",
      "summary",
      "education",
      "skills",
      "experience",
      "projects",
    ];

    const resumeData = {};

    for (const field of allowedFields) {
      if (typeof req.body[field] === "string") {
        resumeData[field] = req.body[field];
      }
    }

    const resume = await Resume.findOneAndUpdate(
      { user: req.userId },
      {
        $set: resumeData,
        $setOnInsert: { user: req.userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Resume saved successfully!",
      resume,
    });
  } catch (error) {
    console.error("Save resume error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save resume.",
    });
  }
});

module.exports = router;
