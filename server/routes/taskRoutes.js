const express = require('express');
const router = express.Router();
const { createTask, updateTask, getProjectTasks, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.patch('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.get('/project/:id', protect, getProjectTasks);

module.exports = router;
