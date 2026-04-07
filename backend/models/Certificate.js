const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    // Linked to convention
    convention: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Convention",
      required: true,
      unique: true,
    },

    // Student info
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Company info
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Offer info
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },

    // Internship completion details
    completionDate: {
      type: Date,
      required: true,
    },
    evaluation: {
      type: String,
      enum: ["excellent", "very good", "good", "satisfactory"],
      required: true,
    },
    companyFeedback: {
      type: String,
      default: null,
    },

    // Admin validation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);