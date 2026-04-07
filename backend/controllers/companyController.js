const User = require("../models/User");
const Offer = require("../models/offer");
const Application = require("../models/Application");
const Convention = require("../models/Convention");

// ✅ PUBLIC: Get companies for registration dropdown (no auth required)
const getPublicCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: "company" })
      .select("name _id")
      .sort({ name: 1 });

    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get company dashboard stats
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

// Get recent applications for company
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

// Get ALL supervisors (global list)
const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: "supervisor" })
      .select("name email department createdAt isApproved")
      .sort({ createdAt: -1 });

    res.status(200).json(supervisors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Get pending supervisor requests for THIS company
const getSupervisorRequests = async (req, res) => {
  try {
    const companyId = req.user.id;

    const pending = await User.find({
      role: "supervisor",
      companyId: companyId,
      isApproved: false,
    }).select("-password");

    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Get approved supervisors for THIS company
const getApprovedSupervisors = async (req, res) => {
  try {
    const companyId = req.user.id;

    const approved = await User.find({
      role: "supervisor",
      companyId: companyId,
      isApproved: true,
    }).select("-password");

    res.status(200).json(approved);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Approve a supervisor
const approveSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const supervisor = await User.findOneAndUpdate(
      {
        _id: id,
        role: "supervisor",
        companyId: companyId,
        isApproved: false,
      },
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor request not found or already approved" });
    }

    res.status(200).json({
      message: "Supervisor approved successfully",
      supervisor,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Reject (delete) a supervisor request
const rejectSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const supervisor = await User.findOneAndDelete({
      _id: id,
      role: "supervisor",
      companyId: companyId,
      isApproved: false,
    });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor request not found or already approved" });
    }

    res.status(200).json({ message: "Supervisor request rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Get company's approved supervisors (for dropdown in CreateInternship)
const getCompanySupervisors = async (req, res) => {
  try {
    const companyId = req.user.id;

    const supervisors = await User.find({
      role: 'supervisor',
      companyId: companyId,
      isApproved: true
    }).select('name email department');

    res.status(200).json(supervisors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Assign supervisor to an offer
const assignSupervisorToOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { supervisorId } = req.body;
    const companyId = req.user.id;

    // Verify supervisor belongs to this company and is approved
    const supervisor = await User.findOne({
      _id: supervisorId,
      role: 'supervisor',
      companyId: companyId,
      isApproved: true
    });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found or not approved" });
    }

    // Update offer with supervisor
    const offer = await Offer.findOneAndUpdate(
      { _id: offerId, company: companyId },
      { supervisor: supervisorId },
      { new: true }
    ).populate('supervisor', 'name email department');

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Supervisor assigned to offer successfully",
      offer
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Remove supervisor from offer
const removeSupervisorFromOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const companyId = req.user.id;

    const offer = await Offer.findOneAndUpdate(
      { _id: offerId, company: companyId },
      { supervisor: null },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    res.status(200).json({
      message: "Supervisor removed from offer",
      offer
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Get offers with supervisor info for company
const getMyOffersWithSupervisors = async (req, res) => {
  try {
    const companyId = req.user.id;

    const offers = await Offer.find({ company: companyId })
      .populate('supervisor', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Get certificates for company students
const getCompanyCertificates = async (req, res) => {
  try {
    const companyId = req.user.id;
    const Certificate = require("../models/Certificate");

    // Get all offers for this company
    const companyOffers = await Offer.find({ company: companyId }).select("_id jobTitle");
    const offerIds = companyOffers.map((o) => o._id);

    // Get all certificates for students in this company's offers
    const certificates = await Certificate.find({ offer: { $in: offerIds } })
      .populate("student", "name email institution")
      .populate("company", "name email")
      .populate({
        path: "offer",
        select: "jobTitle location supervisor",
        populate: {
          path: "supervisor",
          select: "name email"
        }
      })
      .populate("convention")
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ NEW: Get student evaluations for company offers (for company portal)
const getStudentEvaluations = async (req, res) => {
  try {
    const companyId = req.user.id;

    // Get all offers for this company
    const companyOffers = await Offer.find({ company: companyId }).select("_id jobTitle");
    const offerIds = companyOffers.map((o) => o._id);

    // Get all applications with evaluations for these offers
    const applications = await Application.find({
      offer: { $in: offerIds },
      "evaluation.submittedAt": { $exists: true, $ne: null }
    })
      .populate("student", "name email institution")
      .populate("offer", "jobTitle location")
      .sort({ "evaluation.submittedAt": -1 });

    const evaluations = applications.map((app) => ({
      _id: app._id,
      student: app.student,
      offer: app.offer,
      status: app.status,
      evaluation: app.evaluation,
      appliedAt: app.createdAt,
    }));

    res.status(200).json({
      total: evaluations.length,
      evaluations,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ EXPORTS - All functions must be listed here!
module.exports = {
  getCompanyStats,
  getRecentApplications,
  getAllSupervisors,
  getPublicCompanies,
  // Supervisor approval functions
  getSupervisorRequests,
  getApprovedSupervisors,
  approveSupervisor,
  rejectSupervisor,
  // NEW: Supervisor assignment to offers
  getCompanySupervisors,
  assignSupervisorToOffer,
  removeSupervisorFromOffer,
  getMyOffersWithSupervisors,
  // NEW: Student evaluations and certificates
  getStudentEvaluations,
  getCompanyCertificates,
};