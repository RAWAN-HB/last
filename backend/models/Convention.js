const mongoose = require("mongoose");

const conventionSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tasks: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    pdfUrl: { type: String, default: null }, // ← PDF stored on Cloudinary
  },
  { timestamps: true }
);

module.exports = mongoose.model("Convention", conventionSchema);