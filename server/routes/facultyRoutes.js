const express = require('express');
const router = express.Router();
const { reviewSubmission, getAssignedProjects, updateProjectStatus } = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/projects', protect, authorize('faculty', 'admin'), getAssignedProjects);
router.patch('/review/:id', protect, authorize('faculty', 'admin'), reviewSubmission);
router.patch('/project/:id/status', protect, authorize('faculty', 'admin'), updateProjectStatus);

module.exports = router;
