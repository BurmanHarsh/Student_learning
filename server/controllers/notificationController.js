const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const createNotification = async (userId, type, message, referenceId = null) => {
    const db = getDb();
    const notification = {
        userId: new ObjectId(userId),
        type,
        message,
        referenceId: referenceId ? new ObjectId(referenceId) : null,
        isRead: false,
        createdAt: new Date()
    };
    await db.collection('notifications').insertOne(notification);
};

const getNotifications = async (req, res) => {
    try {
        const db = getDb();
        const notifications = await db.collection('notifications').find({
            userId: new ObjectId(req.user.userId)
        }).sort({ createdAt: -1 }).toArray();

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const db = getDb();
        await db.collection('notifications').updateOne(
            { _id: new ObjectId(req.params.id), userId: new ObjectId(req.user.userId) },
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        const db = getDb();
        await db.collection('notifications').updateMany(
            { userId: new ObjectId(req.user.userId) },
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createNotification, getNotifications, markAsRead, markAllRead };
