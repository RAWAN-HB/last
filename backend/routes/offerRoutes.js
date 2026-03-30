const express = require("express");
const router = express.Router();
const {
  getAllOffers,
  getAllOffersAdmin,
  getMyOffers,
  getDomains,
  getLocations,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  updateOfferStatus,
} = require("../controllers/offerController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Routes for offers management
 */

/**
 * @swagger
 * /api/offers/:
 *   get:
 *     summary: Get all offers (public)
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: List of all offers
 */
router.get("/", getAllOffers);

/**
 * @swagger
 * /api/offers/domains:
 *   get:
 *     summary: Get all offer domains (public)
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: List of domains
 */
router.get("/domains", getDomains);

/**
 * @swagger
 * /api/offers/locations:
 *   get:
 *     summary: Get all offer locations (public)
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: List of locations
 */
router.get("/locations", getLocations);

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Get offer by ID (public)
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the offer
 *     responses:
 *       200:
 *         description: Offer details retrieved
 */
router.get("/:id", getOfferById);

/**
 * @swagger
 * /api/offers/:
 *   post:
 *     summary: Create a new offer (company)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               domain:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Offer created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", protect, authorizeRoles("company"), createOffer);

/**
 * @swagger
 * /api/offers/company/my:
 *   get:
 *     summary: Get logged-in company's offers
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of company's offers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/company/my", protect, authorizeRoles("company"), getMyOffers);

/**
 * @swagger
 * /api/offers/{id}:
 *   put:
 *     summary: Update an offer (company)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the offer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               domain:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id", protect, authorizeRoles("company"), updateOffer);

/**
 * @swagger
 * /api/offers/{id}:
 *   delete:
 *     summary: Delete an offer (company, admin, super admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the offer
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", protect, authorizeRoles("company", "admin", "super_admin"), deleteOffer);

/**
 * @swagger
 * /api/offers/admin/all:
 *   get:
 *     summary: Get all offers (admin and super admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all offers for admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/admin/all", protect, authorizeRoles("admin", "super_admin"), getAllOffersAdmin);

/**
 * @swagger
 * /api/offers/{id}/status:
 *   put:
 *     summary: Update offer status (admin and super admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the offer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Offer status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id/status", protect, authorizeRoles("admin", "super_admin"), updateOfferStatus);

module.exports = router;