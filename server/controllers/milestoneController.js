const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const createMilestone = async (req, res) => {
    try {
        const { title, description, deadline } = req.body;
        const projectId = req.body.projectId;
        const db = getDb();

        const newMilestone = {
            title,
            description,
            projectId: new ObjectId(projectId),
            deadline: deadline ? new Date(deadline) : null,
            status: 'pending',
            completionPercentage: 0,
            createdAt: new Date()
        };

        const result = await db.collection('milestones').insertOne(newMilestone);
        res.status(201).json({ success: true, data: { ...newMilestone, _id: result.insertedId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProjectMilestones = async (req, res) => {
    try {
        const db = getDb();
        const milestones = await db.collection('milestones').find({
            projectId: new ObjectId(req.params.id)
        }).toArray();

        res.status(200).json({ success: true, data: milestones });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMilestone = async (req, res) => {
    try {
        const db = getDb();
        const updates = { ...req.body, updatedAt: new Date() };

        const result = await db.collection('milestones').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        res.status(200).json({ success: true, message: 'Milestone updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createMilestone, getProjectMilestones, updateMilestone };
