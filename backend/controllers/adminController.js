const User = require("../models/User");
const Offer = require("../models/offer");
const Application = require("../models/Application");
const Convention = require("../models/Convention");
const Certificate = require("../models/Certificate");

// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Placed students = students with accepted applications
    const placedStudents = await Application.countDocuments({ status: "accepted" });

    // Unplaced students
    const unplacedStudents = totalStudents - placedStudents;

    // Validation queue = applications pending admin approval
    const validationQueue = await Application.countDocuments({
      status: "pending_admin_approval",
    });

    // Total companies
    const totalCompanies = await User.countDocuments({ role: "company", isApproved: true });

    // Pending conventions
    const pendingConventions = await Convention.countDocuments({ status: "pending" });

    // Pending certificates
    const pendingCertificates = await Certificate.countDocuments({ status: "pending" });

    res.status(200).json({
      totalStudents,
      placedStudents,
      unplacedStudents,
      validationQueue,
      totalCompanies,
      pendingConventions,
      pendingCertificates,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/admin/validation-queue
// @access  Private (Admin only)
const getValidationQueue = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Application.countDocuments({
      status: "pending_admin_approval",
    });

    const applications = await Application.find({
      status: "pending_admin_approval",
    })
      .populate("student", "name email")
      .populate("offer", "jobTitle company")
      .populate({
        path: "offer",
        populate: { path: "company", select: "name" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      applications,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/admin/conventions/pending
// @access  Private (Admin only)
const getPendingConventions = async (req, res) => {
  try {
    const conventions = await Convention.find({ status: "pending" })
      .populate("student", "name email")
      .populate("company", "name email")
      .populate("offer", "jobTitle")
      .sort({ createdAt: -1 });

    res.status(200).json(conventions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/admin/certificates/pending
// @access  Private (Admin only)
const getPendingCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ status: "pending" })
      .populate("student", "name email")
      .populate("company", "name email")
      .populate("offer", "jobTitle")
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAdminStats,
  getValidationQueue,
  getPendingConventions,
  getPendingCertificates,
  getAllUsers,
};