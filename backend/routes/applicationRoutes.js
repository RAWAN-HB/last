const express = require("express");
const router = express.Router();
const {
  applyToOffer,
  getMyApplications,
  getMyApplicationById,
  withdrawApplication,
  getOfferApplications,
  reviewApplication,
  validateApplication,
  getAllApplicationsAdmin,
} = require("../controllers/applicationController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application management routes for students, companies, and admins
 */

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/applications/apply/{offerId}:
 *   post:
 *     summary: Student applies to an offer
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the offer to apply to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *               - fullName
 *               - email
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF or DOCX only)
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               motivationStatement:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Already applied, offer not available, or missing CV
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Offer not found
 */
// FIX: was POST /:offerId — wildcard collided with /:id/review and /:id/validate
router.post("/apply/:offerId", protect, authorizeRoles("student"), upload.single("cv"), applyToOffer);

/**
 * @swagger
 * /api/applications/my/applications:
 *   get:
 *     summary: Get all applications of the logged-in student
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of student's applications
 *       401:
 *         description: Unauthorized
 */
router.get("/my/applications", protect, authorizeRoles("student"), getMyApplications);

/**
 * @swagger
 * /api/applications/my/{id}:
 *   get:
 *     summary: Get a single application by ID (student, own only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
 *       403:
 *         description: Not authorized to view this application
 *       404:
 *         description: Application not found
 */
router.get("/my/:id", protect, authorizeRoles("student"), getMyApplicationById);

/**
 * @swagger
 * /api/applications/my/{id}:
 *   delete:
 *     summary: Withdraw an application (only allowed when status is pending)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 *       400:
 *         description: Cannot withdraw — application is no longer pending
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Application not found
 */
router.delete("/my/:id", protect, authorizeRoles("student"), withdrawApplication);

// ─── COMPANY ROUTES ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/applications/offer/{offerId}:
 *   get:
 *     summary: Get all applications for a specific offer (company, own offers only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *     responses:
 *       200:
 *         description: List of applications for the offer
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Offer not found
 */
router.get("/offer/:offerId", protect, authorizeRoles("company"), getOfferApplications);

/**
 * @swagger
 * /api/applications/{id}/review:
 *   put:
 *     summary: Company accepts or rejects an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending_admin_approval, rejected]
 *     responses:
 *       200:
 *         description: Application reviewed
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Application not found
 */
router.put("/:id/review", protect, authorizeRoles("company"), reviewApplication);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/applications/admin/all:
 *   get:
 *     summary: Get all applications (admin and super admin)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all applications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/admin/all", protect, authorizeRoles("admin", "super_admin"), getAllApplicationsAdmin);

/**
 * @swagger
 * /api/applications/{id}/validate:
 *   put:
 *     summary: Admin approves or rejects an application — triggers convention generation on approval
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application validated and convention generated if accepted
 *       400:
 *         description: Invalid status or application not in pending_admin_approval state
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.put("/:id/validate", protect, authorizeRoles("admin", "super_admin"), validateApplication);

module.exports = router;