const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "late", "excused"],
    required: true,
  },
  note: { type: String, default: null },
});

const weeklyReportSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  tasksCompleted: { type: String, required: true },
  tasksCompletedCount: { type: Number, default: 0 },
  totalTasks: { type: Number, default: 0 },
  performanceScore: { type: Number, min: 0, max: 100, required: true },
  supervisorComment: { type: String, default: null },
  submittedAt: { type: Date, default: Date.now },
});

const trackingSchema = new mongoose.Schema(
  {
    convention: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Convention",
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Attendance records
    attendance: [attendanceSchema],

    // Weekly reports
    weeklyReports: [weeklyReportSchema],

    // Final evaluation
    finalEvaluation: {
      performanceScore: { type: Number, min: 0, max: 100, default: null },
      attendanceScore: { type: Number, min: 0, max: 100, default: null },
      tasksScore: { type: Number, min: 0, max: 100, default: null },
      evaluation: {
        type: String,
        enum: ["excellent", "very good", "good", "satisfactory", "failed", null],
        default: null,
      },
      comment: { type: String, default: null },
      passed: { type: Boolean, default: null },
      submittedAt: { type: Date, default: null },
    },

    // Overall status
    status: {
      type: String,
      enum: ["in_progress", "completed", "failed"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tracking", trackingSchema);