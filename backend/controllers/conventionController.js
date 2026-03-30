const Convention = require("../models/Convention");
const Certificate = require("../models/Certificate");
const Application = require("../models/Application");
const Tracking = require("../models/tracking");
const { generateConventionPDF } = require("../config/pdfGenerator");

// Auto-generate convention when admin approves application
const generateConvention = async (applicationId) => {
  try {
    const application = await Application.findById(applicationId)
      .populate("offer")
      .populate("student");

    if (!application) return;

    const existing = await Convention.findOne({ application: applicationId });
    if (existing) return;

    const convention = new Convention({
      application: applicationId,
      student: application.student._id,
      company: application.offer.company,
      offer: application.offer._id,
      startDate: application.offer.startDate,
      endDate: new Date(
        new Date(application.offer.startDate).setMonth(
          new Date(application.offer.startDate).getMonth() +
            parseInt(application.offer.duration)
        )
      ),
      tasks: application.offer.keyResponsibilities,
      status: "pending",
    });

    await convention.save();
    console.log("Convention generated for application:", applicationId);
  } catch (err) {
    console.log("Convention generation error:", err.message);
  }
};

// @route   GET /api/conventions
// @access  Private (Admin only)
const getAllConventions = async (req, res) => {
  try {
    const conventions = await Convention.find()
      .populate("student", "name email")
      .populate("company", "name email")
      .populate("offer", "jobTitle location duration")
      .populate("supervisor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(conventions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/conventions/my
// @access  Private (Student)
const getMyConvention = async (req, res) => {
  try {
    const conventions = await Convention.find({ student: req.user.id })
      .populate("offer", "jobTitle location duration")
      .populate("company", "name email")
      .populate("supervisor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(conventions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/conventions/my/:id/download
// @access  Private (Student only)
// UC03 extension: Download Convention PDF
const downloadConvention = async (req, res) => {
  try {
    const convention = await Convention.findById(req.params.id);

    if (!convention) return res.status(404).json({ message: "Convention not found" });

    if (convention.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to download this convention" });
    }

    if (!convention.pdfUrl) {
      return res.status(400).json({
        message: "Convention PDF is not yet available. The convention must be approved by admin first.",
        conventionStatus: convention.status,
      });
    }

    res.status(200).json({
      message: "Convention PDF ready.",
      pdfUrl: convention.pdfUrl,
      conventionId: convention._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/conventions/:id
// @access  Private
const getConventionById = async (req, res) => {
  try {
    const convention = await Convention.findById(req.params.id)
      .populate("student", "name email")
      .populate("company", "name email")
      .populate("offer", "jobTitle location duration department")
      .populate("supervisor", "name email");

    if (!convention) return res.status(404).json({ message: "Convention not found" });

    res.status(200).json(convention);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/conventions/:id/validate
// @access  Private (Admin only)
const validateConvention = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use approved or rejected." });
    }

    const convention = await Convention.findById(req.params.id);
    if (!convention) return res.status(404).json({ message: "Convention not found" });

    convention.status = status;
    convention.adminNote = adminNote || null;
    convention.approvedAt = status === "approved" ? new Date() : null;

    if (status === "approved") {
      try {
        const fullConvention = await Convention.findById(req.params.id)
          .populate("student", "name email")
          .populate("company", "name email")
          .populate("offer", "jobTitle department location workType duration educationLevel keyResponsibilities")
          .populate("supervisor", "name email");

        const pdfUrl = await generateConventionPDF(fullConvention);
        convention.pdfUrl = pdfUrl;
        console.log("Convention PDF generated:", pdfUrl);
      } catch (pdfErr) {
        console.log("PDF generation failed:", pdfErr.message);
      }
    }

    await convention.save();

    res.status(200).json({
      message: `Convention ${status} successfully.`,
      convention,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/conventions/:id/supervisor
// @access  Private (Company only)
const assignSupervisor = async (req, res) => {
  try {
    const { supervisorId } = req.body;

    const convention = await Convention.findById(req.params.id);
    if (!convention) return res.status(404).json({ message: "Convention not found" });

    if (convention.company.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (convention.status !== "approved") {
      return res.status(400).json({ message: "Convention must be approved before assigning supervisor" });
    }

    convention.supervisor = supervisorId;
    await convention.save();

    const existingTracking = await Tracking.findOne({ convention: convention._id });
    if (!existingTracking) {
      const tracking = new Tracking({
        convention: convention._id,
        student: convention.student,
        supervisor: supervisorId,
        company: convention.company,
      });
      await tracking.save();
    }

    res.status(200).json({
      message: "Supervisor assigned and tracking started.",
      convention,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── CERTIFICATE ─────────────────────────────────────────

const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("student", "name email")
      .populate("company", "name email")
      .populate("offer", "jobTitle location")
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const validateCertificate = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ message: "Certificate not found" });

    certificate.status = status;
    certificate.adminNote = adminNote || null;
    certificate.approvedAt = status === "approved" ? new Date() : null;
    await certificate.save();

    res.status(200).json({
      message: `Certificate ${status} successfully.`,
      certificate,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyCertificate = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate("offer", "jobTitle location")
      .populate("company", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  generateConvention,
  getAllConventions,
  getMyConvention,
  downloadConvention,
  getConventionById,
  validateConvention,
  assignSupervisor,
  getAllCertificates,
  validateCertificate,
  getMyCertificate,
};