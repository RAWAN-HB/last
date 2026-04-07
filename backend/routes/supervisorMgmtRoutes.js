const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Offer = require("../models/offer");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// GET /api/company/supervisor-requests
router.get("/supervisor-requests", protect, authorizeRoles("company"), async (req, res) => {
  try {
    const supervisors = await User.find({
      role: "supervisor",
      companyId: req.user.id,
      isApproved: false
    }).select("-password").sort({ createdAt: -1 });
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/company/approved-supervisors
router.get("/approved-supervisors", protect, authorizeRoles("company"), async (req, res) => {
  try {
    const supervisors = await User.find({
      role: "supervisor",
      companyId: req.user.id,
      isApproved: true
    }).select("-password").sort({ createdAt: -1 });
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/company/supervisor-requests/:id/approve
router.put("/supervisor-requests/:id/approve", protect, authorizeRoles("company"), async (req, res) => {
  try {
    const supervisor = await User.findById(req.params.id);
    if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });
    if (supervisor.companyId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    supervisor.isApproved = true;
    await supervisor.save();
    res.json({ message: "Supervisor approved!", supervisor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/company/supervisor-requests/:id/reject
router.put("/supervisor-requests/:id/reject", protect, authorizeRoles("company"), async (req, res) => {
  try {
    const supervisor = await User.findById(req.params.id);
    if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });
    await supervisor.deleteOne();
    res.json({ message: "Supervisor rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/company/supervisor-requests/:id/assign-offer
// Assign supervisor to an internship offer
router.put("/supervisor-requests/:id/assign-offer", protect, authorizeRoles("company"), async (req, res) => {
  try {
    const { offerId } = req.body;
    const supervisor = await User.findById(req.params.id);
    if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });
    if (supervisor.companyId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Update the offer to assign this supervisor
    await Offer.findByIdAndUpdate(offerId, { supervisor: supervisor._id });

    res.json({ message: "Supervisor assigned to internship!", supervisor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;