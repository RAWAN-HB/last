const Tracking = require("../models/tracking");
const Convention = require("../models/Convention");
const Certificate = require("../models/Certificate");
const Offer = require("../models/offer");
const Application = require("../models/Application");

// Helper: get evaluation label from score
const getEvaluationLabel = (score) => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "very good";
  if (score >= 60) return "good";
  if (score >= 50) return "satisfactory";
  return "failed";
};

// @route   GET /api/supervisor/students
// @access  Private (Supervisor only)
// Get all students assigned to offers this supervisor oversees
const getAssignedStudents = async (req, res) => {
  try {
    // Find all offers where this supervisor is assigned
    const offers = await Offer.find({ supervisor: req.user.id });
    const offerIds = offers.map(o => o._id);

    // Find all accepted applications for these offers
    const applications = await Application.find({
      offer: { $in: offerIds },
      status: { $in: ["pending_admin_approval", "accepted"] }
    })
      .populate("student", "name email")
      .populate("offer", "jobTitle location")
      .sort({ createdAt: -1 });

    // Build student list
    const students = applications.map((app) => ({
      trackingId: app._id,
      student: app.student,
      offer: app.offer,
      status: app.status,
      evaluation: app.evaluation,
      applicationDate: app.createdAt,
    }));

    // Dashboard stats
    const stats = {
      totalStudents: students.length,
      accepted: students.filter(s => s.evaluation && s.evaluation.passed === true).length,
      pendingApproval: students.filter(s => s.evaluation && s.evaluation.passed === false).length,
    };

    res.status(200).json({ stats, students });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/supervisor/students/:trackingId
// @access  Private (Supervisor only)
// In new flow: trackingId is actually applicationId
const getStudentDetails = async (req, res) => {
  try {
    const id = req.params.trackingId;
    
    // Try to get as Application first (new flow)
    let application = await Application.findById(id)
      .populate("student", "name email")
      .populate("offer", "jobTitle location department")
      .populate("offer.company", "name email");
    
    if (application) {
      // Check if supervisor is assigned to this offer
      const offer = await Offer.findById(application.offer._id);
      if (!offer || offer.supervisor.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      return res.status(200).json({
        _id: application._id,
        student: application.student,
        offer: application.offer,
        status: application.status,
        motivationStatement: application.motivationStatement,
        cvUrl: application.cvUrl,
        createdAt: application.createdAt,
        type: "application"
      });
    }
    
    // Fallback to Tracking (old flow)
    const tracking = await Tracking.findById(id)
      .populate("student", "name email")
      .populate("convention", "startDate endDate tasks")
      .populate("company", "name email");

    if (!tracking) return res.status(404).json({ message: "Record not found" });
    if (tracking.supervisor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({
      ...tracking.toObject(),
      type: "tracking"
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/supervisor/students/:trackingId/attendance
// @access  Private (Supervisor only)
const markAttendance = async (req, res) => {
  try {
    const { date, status, note } = req.body;

    const tracking = await Tracking.findById(req.params.trackingId);
    if (!tracking) return res.status(404).json({ message: "Tracking not found" });
    if (tracking.supervisor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if attendance already marked for this date
    const existingDate = tracking.attendance.find(
      (a) => new Date(a.date).toDateString() === new Date(date).toDateString()
    );
    if (existingDate) {
      return res.status(400).json({ message: "Attendance already marked for this date" });
    }

    tracking.attendance.push({ date, status, note });
    await tracking.save();

    res.status(201).json({
      message: "Attendance marked successfully.",
      attendance: tracking.attendance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/supervisor/students/:trackingId/weekly-report
// @access  Private (Supervisor only)
const submitWeeklyReport = async (req, res) => {
  try {
    const {
      weekNumber, startDate, endDate,
      tasksCompleted, tasksCompletedCount,
      totalTasks, performanceScore, supervisorComment,
    } = req.body;

    const tracking = await Tracking.findById(req.params.trackingId);
    if (!tracking) return res.status(404).json({ message: "Tracking not found" });
    if (tracking.supervisor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check week report doesn't already exist
    const existingWeek = tracking.weeklyReports.find((r) => r.weekNumber === weekNumber);
    if (existingWeek) {
      return res.status(400).json({ message: `Week ${weekNumber} report already submitted` });
    }

    tracking.weeklyReports.push({
      weekNumber, startDate, endDate,
      tasksCompleted, tasksCompletedCount,
      totalTasks, performanceScore, supervisorComment,
    });

    await tracking.save();

    res.status(201).json({
      message: `Week ${weekNumber} report submitted successfully.`,
      weeklyReports: tracking.weeklyReports,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /api/supervisor/students/:trackingId/evaluate
// @access  Private (Supervisor only)
// In new flow: trackingId is actually applicationId
const submitFinalEvaluation = async (req, res) => {
  try {
    const { performanceScore, attendanceScore, tasksScore, comment } = req.body;
    const id = req.params.trackingId;

    // Try Application first (new flow)
    let application = await Application.findById(id);
    
    if (application) {
      // Verify supervisor is assigned to this offer
      const offer = await Offer.findById(application.offer);
      if (!offer || offer.supervisor.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Calculate overall score
      const overallScore = Math.round(
        (performanceScore + attendanceScore + tasksScore) / 3
      );
      const passed = overallScore >= 50;
      const evaluation = getEvaluationLabel(overallScore);
      
      // Store evaluation in application
      application.evaluation = {
        performanceScore,
        attendanceScore,
        tasksScore,
        overallScore,
        evaluation,
        passed,
        comment,
        submittedAt: new Date(),
      };
      
      // Update application status based on evaluation
      application.status = passed ? "accepted" : "rejected";
      
      await application.save();
      
      // Auto-generate certificate if passed
      if (passed) {
        const convention = await Convention.findOne({ application: application._id });
        if (convention) {
          const existing = await Certificate.findOne({ convention: convention._id });
          if (!existing) {
            const offerData = await Offer.findById(application.offer);
            const certificate = new Certificate({
              convention: convention._id,
              student: application.student,
              company: offerData.company,
              offer: application.offer,
              completionDate: new Date(),
              evaluation,
              companyFeedback: comment,
              status: "approved",
              approvedAt: new Date(),
            });
            await certificate.save();
            console.log("Certificate auto-generated for student:", application.student);
          }
        }
      }
      
      return res.status(200).json({
        message: passed
          ? `Student passed with score ${overallScore}%. Certificate generated!`
          : `Student failed with score ${overallScore}%. Evaluation saved.`,
        evaluation: application.evaluation,
        passed,
        overallScore,
      });
    }

    // Fallback to Tracking (old flow)
    const tracking = await Tracking.findById(id)
      .populate("convention");

    if (!tracking) return res.status(404).json({ message: "Record not found" });
    if (tracking.supervisor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (tracking.finalEvaluation.submittedAt) {
      return res.status(400).json({ message: "Final evaluation already submitted" });
    }

    // Calculate overall score
    const overallScore = Math.round(
      (performanceScore + attendanceScore + tasksScore) / 3
    );
    const passed = overallScore >= 50;
    const evaluation = getEvaluationLabel(overallScore);

    tracking.finalEvaluation = {
      performanceScore,
      attendanceScore,
      tasksScore,
      evaluation,
      comment,
      passed,
      submittedAt: new Date(),
    };

    tracking.status = passed ? "completed" : "failed";
    await tracking.save();

    // Auto-generate certificate if passed
    if (passed) {
      const existing = await Certificate.findOne({ convention: tracking.convention._id });
      if (!existing) {
        const certificate = new Certificate({
          convention: tracking.convention._id,
          student: tracking.student,
          company: tracking.company,
          offer: tracking.convention.offer,
          completionDate: new Date(),
          evaluation,
          companyFeedback: comment,
          status: "approved",
          approvedAt: new Date(),
        });
        await certificate.save();
        console.log("Certificate auto-generated for student:", tracking.student);
      }
    }

    res.status(200).json({
      message: passed
        ? `Student passed with score ${overallScore}%. Certificate generated!`
        : `Student failed with score ${overallScore}%.`,
      finalEvaluation: tracking.finalEvaluation,
      passed,
      overallScore,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAssignedStudents,
  getStudentDetails,
  markAttendance,
  submitWeeklyReport,
  submitFinalEvaluation,
};