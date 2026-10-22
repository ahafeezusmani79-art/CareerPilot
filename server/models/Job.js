
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: 100,
    },

    position: {
      type: String,
      required: [true, "Job position is required"],
      trim: true,
      maxlength: 100,
    },

    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote", ""],
      default: "",
    },

    status: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },

    jobUrl: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    salary: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
