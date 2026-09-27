const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadDeliverable, getProjectSubmissions } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('file'), uploadDeliverable);
router.get('/project/:id', protect, getProjectSubmissions);

module.exports = router;
