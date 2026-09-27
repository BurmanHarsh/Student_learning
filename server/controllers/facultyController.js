const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const reviewSubmission = async (req, res) => {
    try {
        const { feedback, status } = req.body; // 'approved' or 'rejected'
        const submissionId = req.params.id;
        const db = getDb();

        const result = await db.collection('submissions').updateOne(
            { _id: new ObjectId(submissionId) },
            { $set: { facultyFeedback: feedback, status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAssignedProjects = async (req, res) => {
    try {
        const db = getDb();
        const projects = await db.collection('projects').find({
            facultyId: new ObjectId(req.user.userId)
        }).toArray();

        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProjectStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const projectId = req.params.id;
        const db = getDb();

        const result = await db.collection('projects').updateOne(
            { _id: new ObjectId(projectId), facultyId: new ObjectId(req.user.userId) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(403).json({ success: false, message: 'Not authorized to change status' });
        }

        res.status(200).json({ success: true, message: 'Project status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { reviewSubmission, getAssignedProjects, updateProjectStatus };
