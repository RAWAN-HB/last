const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getValidationQueue,
  getPendingConventions,
  getPendingCertificates,
  getAllUsers,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Routes accessible by admin users
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/stats", protect, authorizeRoles("admin"), getAdminStats);

/**
 * @swagger
 * /api/admin/validation-queue:
 *   get:
 *     summary: Get validation queue for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Validation queue retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/validation-queue", protect, authorizeRoles("admin"), getValidationQueue);

/**
 * @swagger
 * /api/admin/conventions/pending:
 *   get:
 *     summary: Get all pending conventions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending conventions retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/conventions/pending", protect, authorizeRoles("admin"), getPendingConventions);

/**
 * @swagger
 * /api/admin/certificates/pending:
 *   get:
 *     summary: Get all pending certificates
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending certificates retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/certificates/pending", protect, authorizeRoles("admin"), getPendingCertificates);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

module.exports = router;