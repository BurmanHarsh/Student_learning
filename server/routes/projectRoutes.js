const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProjectById, updateProject } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student', 'admin'), createProject);
router.get('/', protect, getAllProjects);
router.get('/:id', protect, getProjectById);
router.put('/:id', protect, authorize('student', 'admin'), updateProject);

module.exports = router;
