const express = require("express");
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  getPendingCompanies,
  approveCompany,
  suspendCompany,
  createAdmin,
  updateUserRole,
  deleteUser,
  toggleUserStatus,
} = require("../controllers/superAdminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: Routes for super admin users
 */

/**
 * @swagger
 * /api/super/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform stats retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/stats", protect, authorizeRoles("super_admin"), getPlatformStats);

/**
 * @swagger
 * /api/super/users:
 *   get:
 *     summary: Get all users
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/users", protect, authorizeRoles("super_admin"), getAllUsers);

/**
 * @swagger
 * /api/super/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/users/:id/role", protect, authorizeRoles("super_admin"), updateUserRole);

/**
 * @swagger
 * /api/super/users/{id}/toggle:
 *   put:
 *     summary: Toggle user active/inactive status
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User status toggled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/users/:id/toggle", protect, authorizeRoles("super_admin"), toggleUserStatus);

/**
 * @swagger
 * /api/super/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/users/:id", protect, authorizeRoles("super_admin"), deleteUser);

/**
 * @swagger
 * /api/super/companies/pending:
 *   get:
 *     summary: Get all pending companies for approval
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending companies retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/companies/pending", protect, authorizeRoles("super_admin"), getPendingCompanies);

/**
 * @swagger
 * /api/super/companies/{id}/approve:
 *   put:
 *     summary: Approve a company
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Company approved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/companies/:id/approve", protect, authorizeRoles("super_admin"), approveCompany);

/**
 * @swagger
 * /api/super/companies/{id}/suspend:
 *   put:
 *     summary: Suspend a company
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Company suspended
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/companies/:id/suspend", protect, authorizeRoles("super_admin"), suspendCompany);

/**
 * @swagger
 * /api/super/admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/admins", protect, authorizeRoles("super_admin"), createAdmin);

module.exports = router;