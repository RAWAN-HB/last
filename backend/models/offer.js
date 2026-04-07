const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    // Basic Information
    jobTitle: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    workType: {
      type: String,
      enum: ["on-site", "remote", "hybrid"],
      default: "on-site",
    },
    duration: { type: String, required: true },
    salary: { type: String, default: null },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    numberOfPositions: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    applicationDeadline: { type: Date, required: true },

    // Internship Type
    internshipType: {
      type: String,
      enum: ["PFE", "graduation", "seasonal", "part-time", "academic"],
      default: "PFE",
    },

    // Requirements & Qualifications
    educationLevel: {
      type: String,
      required: true,
      enum: ["bachelor", "master", "phd", "any"],
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ["entry level", "intermediate", "senior"],
    },
    requiredSkills: { type: [String], required: true },
    additionalRequirements: { type: String, default: null },

    // Job Description
    description: { type: String, required: true },
    keyResponsibilities: { type: String, required: true },
    domain: { type: String, required: true },

    // Meta
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ✅ NEW: Assigned supervisor for this offer
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "closed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Index for faster search
offerSchema.index({ jobTitle: "text", domain: "text", description: "text" });

module.exports = mongoose.model("Offer", offerSchema);