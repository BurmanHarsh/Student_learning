const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const uploadDeliverable = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { projectId, milestoneId } = req.body;
        const db = getDb();

        const submission = {
            projectId: new ObjectId(projectId),
            milestoneId: milestoneId ? new ObjectId(milestoneId) : null,
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            uploadedBy: new ObjectId(req.user.userId),
            uploadedAt: new Date(),
            status: 'pending',
            facultyFeedback: null
        };

        const result = await db.collection('submissions').insertOne(submission);
        res.status(201).json({ success: true, data: { ...submission, _id: result.insertedId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProjectSubmissions = async (req, res) => {
    try {
        const db = getDb();
        const submissions = await db.collection('submissions').find({
            projectId: new ObjectId(req.params.id)
        }).toArray();

        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { uploadDeliverable, getProjectSubmissions };
