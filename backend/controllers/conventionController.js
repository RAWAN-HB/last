const Convention = require("../models/Convention");

// Generate convention from approved application
const generateConvention = async (applicationId) => {
  try {
    const Application = require("../models/Application");
    const Offer = require("../models/offer");
    const User = require("../models/User");

    const application = await Application.findById(applicationId)
      .populate('student')
      .populate('offer')
      .populate({
        path: 'offer',
        populate: {
          path: 'company',
          model: 'User'
        }
      });

    if (!application || application.status !== 'accepted') {
      throw new Error('Invalid application for convention generation');
    }

    const convention = new Convention({
      student: application.student._id,
      company: application.offer.company._id,
      offer: application.offer._id,
      internName: application.student.name,
      role: application.offer.jobTitle,
      school: application.student.institution || "Université Constantine 2",
      department: application.offer.department || "Informatique",
      startDate: application.offer.startDate || new Date(),
      endDate: application.offer.endDate || new Date(new Date().setMonth(new Date().getMonth() + 2)),
      // supervisor: null, // Assigned later by company
      status: 'pending_admin_approval'
    });

    await convention.save();
    console.log('Convention generated:', convention._id);
    return convention;
  } catch (err) {
    console.error('generateConvention error:', err);
    throw err;
  }
};

const getMyConvention = async (req, res) => {
  try {
    const conventions = await Convention.find({ student: req.user.id })
      .populate('company', 'name email')
      .populate('offer', 'jobTitle');
    res.json(conventions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllConventions = async (req, res) => {
  try {
    const conventions = await Convention.find()
      .populate('student', 'name email')
      .populate('company', 'name email')
      .populate('supervisor', 'name email')
      .populate('offer', 'jobTitle');
    res.json(conventions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const validateConvention = async (req, res) => {
  try {
    const convention = await Convention.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
      adminApprovedAt: new Date()
    }, { new: true }).populate('student company');
    res.json(convention);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const assignSupervisor = async (req, res) => {
  try {
    const convention = await Convention.findByIdAndUpdate(req.params.id, {
      supervisor: req.body.supervisorId,
      status: 'supervisor_assigned'
    }, { new: true }).populate('student company supervisor');
    res.json(convention);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const downloadConvention = async (req, res) => {
  res.status(501).json({ message: 'Download not implemented' });
};

module.exports = {
  generateConvention,
  downloadConvention,
  getMyConvention,
  getAllConventions,
  validateConvention,
  assignSupervisor
};
