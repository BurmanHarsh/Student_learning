const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const createProject = async (req, res) => {
    try {
        const { title, description, category, technologies, facultyId, deadline } = req.body;
        const db = getDb();

        const newProject = {
            title,
            description,
            category,
            technologies: Array.isArray(technologies) ? technologies : [],
            ownerId: new ObjectId(req.user.userId),
            facultyId: facultyId ? new ObjectId(facultyId) : null,
            status: 'planning',
            startDate: new Date(),
            deadline: deadline ? new Date(deadline) : null,
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('projects').insertOne(newProject);
        res.status(201).json({ success: true, data: { ...newProject, _id: result.insertedId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const db = getDb();
        const { search, status, page = 1, limit = 10 } = req.query;

        const query = {};

        // 1. Filter by Status
        if (status) query.status = status;

        // 2. Search by title or description (Case-insensitive regex)
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // 3. Role-based access
        if (req.user.role === 'student') {
            const memberships = await db.collection('projectMembers').find({ userId: new ObjectId(req.user.userId), status: 'accepted' }).toArray();
            const memberProjectIds = memberships.map(m => m.projectId);
            const ownedProjects = await db.collection('projects').find({ ownerId: new ObjectId(req.user.userId) }).toArray();
            const ownedIds = ownedProjects.map(p => p._id);

            query._id = { $in: [...memberProjectIds, ...ownedIds] };
        }

        // 4. Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const total = await db.collection('projects').countDocuments(query);
        const projects = await db.collection('projects')
            .find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .toArray();

        res.status(200).json({
            success: true,
            data: projects,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const db = getDb();
        const project = await db.collection('projects').findOne({ _id: new ObjectId(req.params.id) });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const db = getDb();
        const updates = { ...req.body, updatedAt: new Date() };

        const result = await db.collection('projects').updateOne(
            { _id: new ObjectId(req.params.id), ownerId: new ObjectId(req.user.userId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(403).json({ success: false, message: 'Unauthorized or project not found' });
        }

        res.status(200).json({ success: true, message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createProject, getAllProjects, getProjectById, updateProject };
