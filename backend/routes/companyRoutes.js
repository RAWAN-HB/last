const express = require("express");
const router = express.Router();
const {
  getCompanyStats,
  getRecentApplications,
  getAllSupervisors,
} = require("../controllers/companyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Routes for company users
 */

/**
 * @swagger
 * /api/company/stats:
 *   get:
 *     summary: Get company dashboard statistics
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/stats", protect, authorizeRoles("company"), getCompanyStats);

/**
 * @swagger
 * /api/company/applications/recent:
 *   get:
 *     summary: Get recent applications received by the company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent applications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/applications/recent", protect, authorizeRoles("company"), getRecentApplications);

/**
 * @swagger
 * /api/company/supervisors:
 *   get:
 *     summary: Get all supervisors to assign to offers
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of supervisors retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/supervisors", protect, authorizeRoles("company"), getAllSupervisors);

module.exports = router;