
const express = require("express");
const Job = require("../models/Job");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Fetch all jobs belonging to the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.userId }).sort({
      appliedDate: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve job applications.",
    });
  }
});

// GET: Fetch one job belonging to the logged-in user
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const job = await Job.findOne({
      _id: id,
      user: req.userId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get job error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve job application.",
    });
  }
});

// POST: Create a new job application
router.post("/", protect, async (req, res) => {
  try {
    const {
      company,
      position,
      location,
      jobType,
      status,
      jobUrl,
      salary,
      notes,
      appliedDate,
    } = req.body;

    if (
      typeof company !== "string" ||
      !company.trim() ||
      typeof position !== "string" ||
      !position.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name and job position are required.",
      });
    }

    const jobData = {
      company: company.trim(),
      position: position.trim(),
      user: req.userId,
    };

    const optionalStrings = {
      location,
      jobUrl,
      salary,
      notes,
    };

    for (const [field, value] of Object.entries(optionalStrings)) {
      if (value !== undefined) {
        if (typeof value !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
        }

        jobData[field] = value;
      }
    }

    if (jobType !== undefined) {
      jobData.jobType = jobType;
    }

    if (status !== undefined) {
      jobData.status = status;
    }

    if (appliedDate !== undefined) {
      const parsedDate = new Date(appliedDate);

      if (
        typeof appliedDate !== "string" ||
        !appliedDate.trim() ||
        Number.isNaN(parsedDate.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid application date.",
        });
      }

      jobData.appliedDate = parsedDate;
    }

    const job = await Job.create(jobData);

    return res.status(201).json({
      success: true,
      message: "Job application added successfully!",
      job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create job application.",
    });
  }
});

// PUT: Update a job belonging to the logged-in user
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const allowedFields = [
      "company",
      "position",
      "location",
      "jobType",
      "status",
      "jobUrl",
      "salary",
      "notes",
      "appliedDate",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    for (const field of [
      "company",
      "position",
      "location",
      "jobUrl",
      "salary",
      "notes",
    ]) {
      if (updateData[field] !== undefined) {
        if (typeof updateData[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
        }

        updateData[field] = updateData[field].trim();
      }
    }

    if (
      ("company" in updateData && !updateData.company) ||
      ("position" in updateData && !updateData.position)
    ) {
      return res.status(400).json({
        success: false,
        message: "Company name and position cannot be empty.",
      });
    }

    if ("appliedDate" in updateData) {
      const parsedDate = new Date(updateData.appliedDate);

      if (
        typeof updateData.appliedDate !== "string" ||
        !updateData.appliedDate.trim() ||
        Number.isNaN(parsedDate.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid application date.",
        });
      }

      updateData.appliedDate = parsedDate;
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job application updated successfully!",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update job application.",
    });
  }
});

// DELETE: Delete a job belonging to the logged-in user
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const job = await Job.findOneAndDelete({
      _id: id,
      user: req.userId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job application deleted successfully!",
    });
  } catch (error) {
    console.error("Delete job error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete job application.",
    });
  }
});

module.exports = router;
