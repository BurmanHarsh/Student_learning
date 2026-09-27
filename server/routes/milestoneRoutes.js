const express = require('express');
const router = express.Router();
const { createMilestone, getProjectMilestones, updateMilestone } = require('../controllers/milestoneController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createMilestone);
router.get('/project/:id', protect, getProjectMilestones);
router.patch('/:id', protect, updateMilestone);

module.exports = router;
