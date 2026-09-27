const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const createTask = async (req, res) => {
    try {
        const { title, description, projectId, assignedTo, priority, deadline, estimatedHours } = req.body;
        const db = getDb();

        const newTask = {
            title,
            description,
            projectId: new ObjectId(projectId),
            assignedTo: assignedTo ? new ObjectId(assignedTo) : null,
            createdBy: new ObjectId(req.user.userId),
            priority: priority || 'MEDIUM',
            status: 'TODO',
            deadline: deadline ? new Date(deadline) : null,
            estimatedHours: estimatedHours || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('tasks').insertOne(newTask);
        res.status(201).json({ success: true, data: { ...newTask, _id: result.insertedId } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const db = getDb();
        const updates = { ...req.body, updatedAt: new Date() };

        const result = await db.collection('tasks').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const db = getDb();
        const tasks = await db.collection('tasks').find({
            projectId: new ObjectId(req.params.id)
        }).toArray();

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const db = getDb();
        const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createTask, updateTask, getProjectTasks, deleteTask };
