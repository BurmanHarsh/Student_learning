const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const inviteMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        const projectId = req.params.id;
        const db = getDb();

        // 1. Verify project exists and user is owner
        const project = await db.collection('projects').findOne({
            _id: new ObjectId(projectId),
            ownerId: new ObjectId(req.user.userId)
        });
        if (!project) {
            return res.status(403).json({ success: false, message: 'Not authorized to invite members' });
        }

        // 2. Find user by email
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role !== 'student') {
            return res.status(400).json({ success: false, message: 'Only students can be invited to project teams' });
        }

        // 3. Check if already a member
        const existingMember = await db.collection('projectMembers').findOne({
            projectId: new ObjectId(projectId),
            userId: user._id
        });
        if (existingMember) {
            return res.status(400).json({ success: false, message: 'User is already a member or invited' });
        }

        // 4. Create invitation
        const invite = {
            projectId: new ObjectId(projectId),
            userId: user._id,
            role: role || 'Member',
            status: 'pending',
            joinedAt: null
        };

        await db.collection('projectMembers').insertOne(invite);
        res.status(201).json({ success: true, message: 'Invitation sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const respondToInvite = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const inviteId = req.params.id;
        const db = getDb();

        const invite = await db.collection('projectMembers').findOne({
            _id: new ObjectId(inviteId),
            userId: new ObjectId(req.user.userId)
        });

        if (!invite) {
            return res.status(404).json({ success: false, message: 'Invitation not found' });
        }

        await db.collection('projectMembers').updateOne(
            { _id: new ObjectId(inviteId) },
            { $set: { status, joinedAt: status === 'accepted' ? new Date() : null } }
        );

        res.status(200).json({ success: true, message: `Invitation ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMembers = async (req, res) => {
    try {
        const db = getDb();
        const members = await db.collection('projectMembers').find({
            projectId: new ObjectId(req.params.id),
            status: 'accepted'
        }).toArray();

        // Enrich member data with user details
        const enrichedMembers = await Promise.all(members.map(async (m) => {
            const user = await db.collection('users').findOne({ _id: m.userId }, { projection: { password: 0 } });
            return { ...m, user };
        }));

        res.status(200).json({ success: true, data: enrichedMembers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { inviteMember, respondToInvite, getMembers };
