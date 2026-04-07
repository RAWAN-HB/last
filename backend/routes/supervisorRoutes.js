const express = require("express");
const router = express.Router();
const {
  getAssignedStudents,
  getStudentDetails,
  markAttendance,
  submitWeeklyReport,
  submitFinalEvaluation,
} = require("../controllers/supervisorController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Supervisor
 *   description: Routes for supervisor users
 */

/**
 * @swagger
 * /api/supervisor/students:
 *   get:
 *     summary: Get all assigned students with stats
 *     tags: [Supervisor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned students
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/students", protect, authorizeRoles("supervisor"), getAssignedStudents);

/**
 * @swagger
 * /api/supervisor/students/{trackingId}:
 *   get:
 *     summary: Get details of a specific student
 *     tags: [Supervisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student tracking ID
 *     responses:
 *       200:
 *         description: Student details retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/students/:trackingId", protect, authorizeRoles("supervisor"), getStudentDetails);

/**
 * @swagger
 * /api/supervisor/students/{trackingId}/attendance:
 *   post:
 *     summary: Mark attendance for a student
 *     tags: [Supervisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student tracking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               present:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/students/:trackingId/attendance", protect, authorizeRoles("supervisor"), markAttendance);

/**
 * @swagger
 * /api/supervisor/students/{trackingId}/weekly-report:
 *   post:
 *     summary: Submit weekly report for a student
 *     tags: [Supervisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student tracking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               report:
 *                 type: string
 *                 description: Weekly report content
 *     responses:
 *       200:
 *         description: Weekly report submitted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/students/:trackingId/weekly-report", protect, authorizeRoles("supervisor"), submitWeeklyReport);

/**
 * @swagger
 * /api/supervisor/students/{trackingId}/evaluate:
 *   post:
 *     summary: Submit final evaluation for a student
 *     tags: [Supervisor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student tracking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evaluation:
 *                 type: string
 *                 description: Final evaluation content
 *     responses:
 *       200:
 *         description: Final evaluation submitted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/students/:trackingId/evaluate", protect, authorizeRoles("supervisor"), submitFinalEvaluation);

module.exports = router;