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
 *         description: Already applied or missing CV
 *       404:
 *         description: Offer not found
 */
router.post(
  "/apply/:offerId",
  protect,
  authorizeRoles("student"),
  (req, res, next) => {
    upload.single("cv")(req, res, (err) => {
      if (err) {
        console.error("❌ UPLOAD ERROR:", err);
        return res.status(500).json({ message: "File upload failed", error: err.message });
      }
      next();
    });
  },
  applyToOffer
);

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
 */
router.get("/my/applications", protect, authorizeRoles("student"), getMyApplications);

/**
 * @swagger
 * /api/applications/my/{id}:
 *   get:
 *     summary: Get a single application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.get("/my/:id", protect, authorizeRoles("student"), getMyApplicationById);

/**
 * @swagger
 * /api/applications/my/{id}:
 *   delete:
 *     summary: Withdraw an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Withdrawn successfully
 *       400:
 *         description: Cannot withdraw
 *       404:
 *         description: Not found
 */
router.delete("/my/:id", protect, authorizeRoles("student"), withdrawApplication);

// ─── COMPANY ROUTES ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/applications/offer/{offerId}:
 *   get:
 *     summary: Get all applications for a specific offer
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applications
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending_admin_approval, rejected]
 *     responses:
 *       200:
 *         description: Application reviewed
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.put("/:id/review", protect, authorizeRoles("company"), reviewApplication);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/applications/admin/all:
 *   get:
 *     summary: Get all applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All applications
 */
router.get("/admin/all", protect, authorizeRoles("admin", "super_admin"), getAllApplicationsAdmin);

/**
 * @swagger
 * /api/applications/{id}/validate:
 *   put:
 *     summary: Admin approves or rejects an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application validated
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put("/:id/validate", protect, authorizeRoles("admin", "super_admin"), validateApplication);

module.exports = router;