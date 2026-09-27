const express = require('express');
const router = express.Router();
const { inviteMember, respondToInvite, getMembers } = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:id/invite', protect, authorize('student', 'admin'), inviteMember);
router.patch('/invite/:id', protect, respondToInvite);
router.get('/:id/members', protect, getMembers);

module.exports = router;
