const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    motivationStatement: {
      type: String,
      required: true,
    },
    cvUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",               // just submitted by student
        "pending_admin_approval", // company accepted, waiting for admin
        "accepted",              // admin approved → convention generated
        "rejected",              // company or admin rejected
      ],
      default: "pending",
    },
    // Supervisor evaluation (added after internship completion)
    evaluation: {
      performanceScore: { type: Number, min: 0, max: 100, default: null },
      attendanceScore: { type: Number, min: 0, max: 100, default: null },
      tasksScore: { type: Number, min: 0, max: 100, default: null },
      overallScore: { type: Number, min: 0, max: 100, default: null },
      evaluation: {
        type: String,
        enum: ["excellent", "very good", "good", "satisfactory", "failed", null],
        default: null,
      },
      passed: { type: Boolean, default: null },
      comment: { type: String, default: null },
      submittedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Prevent student from applying to same offer twice
applicationSchema.index({ offer: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);