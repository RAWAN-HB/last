const Application = require("../models/Application");
const Offer = require("../models/offer");
const nodemailer = require("nodemailer");

// Email notification helper
const sendNotification = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  } catch (err) {
    console.log("Email notification failed:", err.message);
  }
};

// @route   POST /api/applications/apply/:offerId
// @access  Private (Student only)
const applyToOffer = async (req, res) => {
  try {
    const { motivationStatement } = req.body;
    const offerId = req.params.offerId;

    const offer = await Offer.findById(offerId).populate("company", "name email");
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (offer.status !== "published") return res.status(400).json({ message: "This offer is not available" });

    const existing = await Application.findOne({ offer: offerId, student: req.user.id });
    if (existing) return res.status(400).json({ message: "You have already applied to this offer" });

    if (!req.file) return res.status(400).json({ message: "Please upload your CV" });

    const application = new Application({
      offer: offerId,
      student: req.user.id,
      fullName: req.body.fullName,
      email: req.body.email,
      motivationStatement,
      cvUrl: req.file.path,
      status: "pending",
    });

    await application.save();

    await sendNotification(
      offer.company.email,
      `New Application for ${offer.jobTitle}`,
      `Hello ${offer.company.name},\n\nA new student has applied for "${offer.jobTitle}".\n\nApplicant: ${req.body.fullName}\nEmail: ${req.body.email}\n\nLogin to Stag.io to review.\n\nBest regards,\nStag.io Team`
    );

    res.status(201).json({ message: "Application submitted successfully!", application });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "You have already applied to this offer" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/applications/my/applications
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("offer", "jobTitle location company duration status")
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/applications/my/:id
// @access  Private (Student only)
const getMyApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate("offer", "jobTitle location company duration status description requiredSkills")
      .populate({ path: "offer", populate: { path: "company", select: "name email" } });

    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this application" });
    }

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   DELETE /api/applications/my/:id
// @access  Private (Student only)
// UC01 extension: Withdraw Application — only allowed when status is "pending"
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to withdraw this application" });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: `Cannot withdraw an application with status "${application.status}". Only pending applications can be withdrawn.`,
      });
    }

    await application.deleteOne();
    res.status(200).json({ message: "Application withdrawn successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/applications/offer/:offerId
// @access  Private (Company)
const getOfferApplications = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (offer.company.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const applications = await Application.find({ offer: req.params.offerId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/applications/:id/review
// @access  Private (Company only)
const reviewApplication = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending_admin_approval", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Company can only set: pending_admin_approval or rejected" });
    }

    const application = await Application.findById(req.params.id)
      .populate("offer")
      .populate("student", "name email");

    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.offer.company.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    application.status = status;
    await application.save();

    const msg = status === "pending_admin_approval"
      ? "Your application has been accepted by the company and is awaiting admin approval."
      : "Your application has been rejected by the company.";

    await sendNotification(
      application.student.email,
      `Application Update for ${application.offer.jobTitle}`,
      `Hello ${application.student.name},\n\n${msg}\n\nBest regards,\nStag.io Team`
    );

    res.status(200).json({
      message: status === "pending_admin_approval"
        ? "Application accepted. Waiting for admin approval."
        : "Application rejected.",
      application,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/applications/:id/validate
// @access  Private (Admin only)
const validateApplication = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Admin can only set: accepted or rejected" });
    }

    const application = await Application.findById(req.params.id)
      .populate("offer")
      .populate("student", "name email");

    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== "pending_admin_approval") {
      return res.status(400).json({ message: "Application is not pending admin approval" });
    }

    application.status = status;
    await application.save();

    if (status === "accepted") {
      const { generateConvention } = require("./conventionController");
      await generateConvention(application._id);
    }

    const msg = status === "accepted"
      ? "Congratulations! Your application has been approved. Your internship convention has been generated."
      : `Your application has been rejected by admin. ${adminNote || ""}`;

    await sendNotification(
      application.student.email,
      `Application ${status === "accepted" ? "Approved" : "Rejected"} - ${application.offer.jobTitle}`,
      `Hello ${application.student.name},\n\n${msg}\n\nBest regards,\nStag.io Team`
    );

    res.status(200).json({
      message: status === "accepted"
        ? "Application approved and convention generated!"
        : "Application rejected.",
      application,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/applications/admin/all
// @access  Private (Admin only)
const getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("offer", "jobTitle location")
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  applyToOffer,
  getMyApplications,
  getMyApplicationById,
  withdrawApplication,
  getOfferApplications,
  reviewApplication,
  validateApplication,
  getAllApplicationsAdmin,
};