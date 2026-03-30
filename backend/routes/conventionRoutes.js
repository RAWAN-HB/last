const express = require("express");
const router = express.Router();
const {
  getAllConventions,
  getMyConvention,
  downloadConvention,
  getConventionById,
  validateConvention,
  assignSupervisor,
  getAllCertificates,
  validateCertificate,
  getMyCertificate,
} = require("../controllers/conventionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Conventions
 *   description: Convention management routes
 */

/**
 * @swagger
 * /api/conventions:
 *   get:
 *     summary: Get all conventions (admin)
 *     tags: [Conventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conventions
 */
router.get("/", protect, authorizeRoles("admin", "super_admin"), getAllConventions);

/**
 * @swagger
 * /api/conventions/my:
 *   get:
 *     summary: Get my conventions (student)
 *     tags: [Conventions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's conventions
 */
router.get("/my", protect, authorizeRoles("student"), getMyConvention);

/**
 * @swagger
 * /api/conventions/{id}:
 *   get:
 *     summary: Get convention by ID
 *     tags: [Conventions]
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
 *         description: Convention details
 */
router.get("/:id", protect, getConventionById);

/**
 * @swagger
 * /api/conventions/my/{id}/download:
 *   get:
 *     summary: Download my convention PDF (student)
 *     tags: [Conventions]
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
 *         description: PDF URL
 */
router.get("/my/:id/download", protect, authorizeRoles("student"), downloadConvention);

/**
 * @swagger
 * /api/conventions/{id}/validate:
 *   put:
 *     summary: Validate convention (admin)
 *     tags: [Conventions]
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
 *                 enum: [approved, rejected]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Convention validated
 */
router.put("/:id/validate", protect, authorizeRoles("admin", "super_admin"), validateConvention);

/**
 * @swagger
 * /api/conventions/{id}/supervisor:
 *   put:
 *     summary: Assign supervisor (company)
 *     tags: [Conventions]
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
 *               supervisorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Supervisor assigned
 */
router.put("/:id/supervisor", protect, authorizeRoles("company"), assignSupervisor);

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: Certificate management routes
 */

/**
 * @swagger
 * /api/conventions/certificates:
 *   get:
 *     summary: Get all certificates (admin)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of certificates
 */
router.get("/certificates", protect, authorizeRoles("admin", "super_admin"), getAllCertificates);

/**
 * @swagger
 * /api/conventions/certificates/{id}:
 *   put:
 *     summary: Validate certificate (admin)
 *     tags: [Certificates]
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
 *                 enum: [approved, rejected]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificate validated
 */
router.put("/certificates/:id", protect, authorizeRoles("admin", "super_admin"), validateCertificate);

/**
 * @swagger
 * /api/conventions/my/certificate:
 *   get:
 *     summary: Get my certificate (student)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's certificate
 */
router.get("/my/certificate", protect, authorizeRoles("student"), getMyCertificate);

module.exports = router;
