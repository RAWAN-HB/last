const express = require("express");
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  getStudentDashboard,
} = require("../controllers/studentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student profile and dashboard routes
 */

/**
 * @swagger
 * /api/student/profile:
 *   get:
 *     summary: Get the logged-in student's profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 institution:
 *                   type: string
 *                 major:
 *                   type: string
 *                 graduationYear:
 *                   type: number
 *                 profileCvUrl:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", protect, authorizeRoles("student"), getStudentProfile);

/**
 * @swagger
 * /api/student/profile:
 *   put:
 *     summary: Update the logged-in student's profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               institution:
 *                 type: string
 *               major:
 *                 type: string
 *               graduationYear:
 *                 type: number
 *               profileCv:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile CV file (PDF or DOCX)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", protect, authorizeRoles("student"), upload.single("profileCv"), updateStudentProfile);

/**
 * @swagger
 * /api/student/dashboard:
 *   get:
 *     summary: Get dashboard stats for the logged-in student
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalApplications:
 *                   type: number
 *                 pendingApplications:
 *                   type: number
 *                 acceptedApplications:
 *                   type: number
 *                 rejectedApplications:
 *                   type: number
 *                 hasActiveConvention:
 *                   type: boolean
 *                 hasCertificate:
 *                   type: boolean
 *                 recentApplications:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", protect, authorizeRoles("student"), getStudentDashboard);

module.exports = router;