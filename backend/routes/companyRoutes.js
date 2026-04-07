const express = require("express");
const router = express.Router();
const {
  getCompanyStats,
  getRecentApplications,
  getAllSupervisors,
  getPublicCompanies,
  getSupervisorRequests,
  getApprovedSupervisors,
  approveSupervisor,
  rejectSupervisor,
  // NEW: Supervisor assignment functions
  getCompanySupervisors,
  assignSupervisorToOffer,
  removeSupervisorFromOffer,
  getMyOffersWithSupervisors,
  // NEW: Student evaluations and certificates
  getStudentEvaluations,
  getCompanyCertificates,
} = require("../controllers/companyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Company
 *     description: Routes for company users
 */

/**
 * @swagger
 * /api/company/public/list:
 *   get:
 *     summary: Get all companies for registration dropdown
 *     description: Accessible without a token (Public)
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/public/list", getPublicCompanies);

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
 *     summary: Get all supervisors (global list)
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

// ✅ NEW: Supervisor approval routes
router.get("/supervisor-requests", protect, authorizeRoles("company"), getSupervisorRequests);
router.get("/approved-supervisors", protect, authorizeRoles("company"), getApprovedSupervisors);
router.put("/supervisor-requests/:id/approve", protect, authorizeRoles("company"), approveSupervisor);
router.put("/supervisor-requests/:id/reject", protect, authorizeRoles("company"), rejectSupervisor);

// ✅ NEW: Supervisor assignment to offers routes
router.get("/my-supervisors", protect, authorizeRoles("company"), getCompanySupervisors);
router.get("/my-offers-with-supervisors", protect, authorizeRoles("company"), getMyOffersWithSupervisors);
router.put("/offers/:offerId/supervisor", protect, authorizeRoles("company"), assignSupervisorToOffer);
router.delete("/offers/:offerId/supervisor", protect, authorizeRoles("company"), removeSupervisorFromOffer);

// ✅ NEW: Student evaluations route
router.get("/evaluations/students", protect, authorizeRoles("company"), getStudentEvaluations);

// ✅ NEW: Company certificates route
router.get("/certificates", protect, authorizeRoles("company"), getCompanyCertificates);

module.exports = router;