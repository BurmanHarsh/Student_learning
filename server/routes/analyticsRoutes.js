const express = require('express');
const router = express.Router();
const { getStudentStats, getAdminStats, getFacultyStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/student', protect, authorize('student'), getStudentStats);
router.get('/faculty', protect, authorize('faculty'), getFacultyStats);
router.get('/admin', protect, authorize('admin'), getAdminStats);

module.exports = router;
