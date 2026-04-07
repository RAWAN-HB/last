const User = require("../models/User");
const Application = require("../models/Application");
const Convention = require("../models/Convention");
const Certificate = require("../models/Certificate");

// @route   GET /api/student/profile
// @access  Private (Student only)
const getStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   PUT /api/student/profile
// @access  Private (Student only)
const updateStudentProfile = async (req, res) => {
  try {
    const { name, bio, institution, major, graduationYear } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (institution !== undefined) updates.institution = institution;
    if (major !== undefined) updates.major = major;
    if (graduationYear !== undefined) updates.graduationYear = graduationYear;

    // If a new profile CV was uploaded via multer/cloudinary
    if (req.file) {
      updates.profileCvUrl = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated successfully.", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/student/dashboard
// @access  Private (Student only)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Application counts by status
    const [
      totalApplications,
      pendingApplications,
      pendingAdminApproval,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      Application.countDocuments({ student: studentId }),
      Application.countDocuments({ student: studentId, status: "pending" }),
      Application.countDocuments({ student: studentId, status: "pending_admin_approval" }),
      Application.countDocuments({ student: studentId, status: "accepted" }),
      Application.countDocuments({ student: studentId, status: "rejected" }),
    ]);

    // Convention and certificate status
    const convention = await Convention.findOne({ student: studentId })
      .populate("offer", "jobTitle location")
      .populate("company", "name")
      .sort({ createdAt: -1 });

    const certificate = await Certificate.findOne({ student: studentId })
      .sort({ createdAt: -1 });

    // 5 most recent applications for the dashboard feed
    const recentApplications = await Application.find({ student: studentId })
      .populate("offer", "jobTitle location company duration")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalApplications,
      pendingApplications,
      pendingAdminApproval,
      acceptedApplications,
      rejectedApplications,
      hasActiveConvention: !!convention,
      conventionStatus: convention ? convention.status : null,
      activeConvention: convention || null,
      hasCertificate: !!certificate,
      certificateStatus: certificate ? certificate.status : null,
      recentApplications,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentDashboard,
};