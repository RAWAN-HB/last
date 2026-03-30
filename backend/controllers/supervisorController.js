const Tracking = require("../models/tracking");
const Convention = require("../models/Convention");
const Certificate = require("../models/Certificate");

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
// Get all assigned students with their stats
const getAssignedStudents = async (req, res) => {
  try {
    const trackings = await Tracking.find({ supervisor: req.user.id })
      .populate("student", "name email")
      .populate("convention", "startDate endDate status")
      .populate("company", "name")
      .sort({ createdAt: -1 });

    // Build summary stats for dashboard
    const students = trackings.map((t) => {
      const totalDays = t.attendance.length;
      const presentDays = t.attendance.filter((a) => a.status === "present").length;
      const attendanceScore = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      const weeklyScores = t.weeklyReports.map((r) => r.performanceScore);
      const avgPerformance = weeklyScores.length > 0
        ? Math.round(weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length)
        : 0;

      const lastReport = t.weeklyReports[t.weeklyReports.length - 1];
      const tasksCompleted = lastReport ? lastReport.tasksCompletedCount : 0;
      const totalTasks = lastReport ? lastReport.totalTasks : 0;

      const overallScore = t.finalEvaluation.performanceScore ||
        Math.round((attendanceScore + avgPerformance) / 2);

      let badge = "under evaluation";
      if (t.finalEvaluation.passed === true) badge = getEvaluationLabel(overallScore);
      else if (t.finalEvaluation.passed === false) badge = "failed";

      return {
        trackingId: t._id,
        student: t.student,
        company: t.company,
        convention: t.convention,
        attendance: attendanceScore,
        performance: avgPerformance,
        tasksCompleted,
        totalTasks,
        overallScore,
        badge,
        status: t.status,
        finalEvaluationSubmitted: t.finalEvaluation.submittedAt !== null,
      };
    });

    // Dashboard stats
    const stats = {
      totalStudents: students.length,
      passing: students.filter((s) => s.overallScore >= 50).length,
      underEvaluation: students.filter((s) => !s.finalEvaluationSubmitted).length,
      failing: students.filter((s) => s.overallScore < 50 && s.finalEvaluationSubmitted).length,
    };

    res.status(200).json({ stats, students });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   GET /api/supervisor/students/:trackingId
// @access  Private (Supervisor only)
const getStudentDetails = async (req, res) => {
  try {
    const tracking = await Tracking.findById(req.params.trackingId)
      .populate("student", "name email")
      .populate("convention", "startDate endDate tasks")
      .populate("company", "name email");

    if (!tracking) return res.status(404).json({ message: "Tracking not found" });
    if (tracking.supervisor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(tracking);
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
const submitFinalEvaluation = async (req, res) => {
  try {
    const { performanceScore, attendanceScore, tasksScore, comment } = req.body;

    const tracking = await Tracking.findById(req.params.trackingId)
      .populate("convention");

    if (!tracking) return res.status(404).json({ message: "Tracking not found" });
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
          status: "pending",
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