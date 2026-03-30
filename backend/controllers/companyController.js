const User = require("../models/User");
const Offer = require("../models/offer");
const Application = require("../models/Application");
const Convention = require("../models/Convention");

// @route   GET /api/company/stats
// @access  Private (Company only)
const getCompanyStats = async (req, res) => {
  try {
    const companyId = req.user.id;

    const activeOffers = await Offer.countDocuments({
      company: companyId,
      status: "published",
    });

    const companyOffers = await Offer.find({ company: companyId }).select("_id");
    const offerIds = companyOffers.map((o) => o._id);

    const totalCandidates = await Application.countDocuments({
      offer: { $in: offerIds },
    });

    const pendingReview = await Application.countDocuments({
      offer: { $in: offerIds },
      status: "pending",
    });

    res.status(200).json({ activeOffers, totalCandidates, pendingReview });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/company/applications/recent
// @access  Private (Company only)
const getRecentApplications = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { limit = 10, page = 1 } = req.query;

    const companyOffers = await Offer.find({ company: companyId }).select("_id jobTitle");
    const offerIds = companyOffers.map((o) => o._id);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Application.countDocuments({ offer: { $in: offerIds } });

    const applications = await Application.find({ offer: { $in: offerIds } })
      .populate("student", "name email")
      .populate("offer", "jobTitle department")
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

// @route   GET /api/company/supervisors
// @access  Private (Company only)
// Get all supervisors available on the platform to assign
const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: "supervisor" })
      .select("name email department createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(supervisors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getCompanyStats,
  getRecentApplications,
  getAllSupervisors,
};