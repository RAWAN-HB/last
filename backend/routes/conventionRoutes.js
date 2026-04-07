const express = require('express');
const router = express.Router();
const { 
    downloadConvention, 
    getMyConvention, 
    getAllConventions, 
    validateConvention, 
    assignSupervisor 
} = require('../controllers/conventionController');

// Middleware (Make sure these exist in your project)
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// --- ROUTES ---

// 1. Student Routes
router.get('/my', protect, getMyConvention);
router.get('/my/:id/download', protect, downloadConvention);

// 2. Admin Routes
router.get('/all', protect, authorizeRoles('admin', 'super_admin'), getAllConventions);
router.put('/:id/validate', protect, authorizeRoles('admin', 'super_admin'), validateConvention);

// 3. Company Routes
router.put('/:id/assign-supervisor', protect, authorizeRoles('company'), assignSupervisor);

module.exports = router;