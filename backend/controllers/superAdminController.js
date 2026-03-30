const User = require("../models/User");
const Offer = require("../models/offer");
const Application = require("../models/Application");
const Convention = require("../models/Convention");
const Certificate = require("../models/Certificate");

// @route   GET /api/super/stats
// @access  Private (Super Admin only)
const getPlatformStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCompanies = await User.countDocuments({ role: "company" });
    const totalSupervisors = await User.countDocuments({ role: "supervisor" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalOffers = await Offer.countDocuments({ status: "published" });
    const totalApplications = await Application.countDocuments();
    const totalConventions = await Convention.countDocuments();
    const totalCertificates = await Certificate.countDocuments({ status: "approved" });
    const pendingCompanies = await User.countDocuments({ role: "company", isApproved: false });
    const pendingOffers = await Offer.countDocuments({ status: "pending" });

    res.status(200).json({
      users: { totalStudents, totalCompanies, totalSupervisors, totalAdmins },
      platform: { totalOffers, totalApplications, totalConventions, totalCertificates },
      pending: { pendingCompanies, pendingOffers },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/super/users
// @access  Private (Super Admin only)
// Get all users with filters
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10, isApproved } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";
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

// @route   GET /api/super/companies/pending
// @access  Private (Super Admin only)
const getPendingCompanies = async (req, res) => {
  try {
    const companies = await User.find({
      role: "company",
      isApproved: false,
    }).select("-password").sort({ createdAt: -1 });

    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/super/companies/:id/approve
// @access  Private (Super Admin only)
const approveCompany = async (req, res) => {
  try {
    const company = await User.findById(req.params.id);

    if (!company) return res.status(404).json({ message: "Company not found" });
    if (company.role !== "company") return res.status(400).json({ message: "User is not a company" });

    company.isApproved = true;
    await company.save();

    res.status(200).json({ message: "Company approved successfully.", company });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/super/companies/:id/suspend
// @access  Private (Super Admin only)
const suspendCompany = async (req, res) => {
  try {
    const company = await User.findById(req.params.id);

    if (!company) return res.status(404).json({ message: "Company not found" });
    if (company.role !== "company") return res.status(400).json({ message: "User is not a company" });

    company.isApproved = false;
    await company.save();

    res.status(200).json({ message: "Company suspended successfully.", company });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/super/admins
// @access  Private (Super Admin only)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const admin = new User({ name, email, password, role: "admin", isApproved: true });
    await admin.save();

    res.status(201).json({
      message: "Admin created successfully.",
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/super/users/:id/role
// @access  Private (Super Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["student", "company", "admin", "supervisor"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User role updated successfully.", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   DELETE /api/super/users/:id
// @access  Private (Super Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "super_admin") {
      return res.status(403).json({ message: "Cannot delete super admin" });
    }

    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/super/users/:id/toggle
// @access  Private (Super Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isApproved = !user.isApproved;
    await user.save();

    res.status(200).json({
      message: `User ${user.isApproved ? "activated" : "deactivated"} successfully.`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  getPendingCompanies,
  approveCompany,
  suspendCompany,
  createAdmin,
  updateUserRole,
  deleteUser,
  toggleUserStatus,
};