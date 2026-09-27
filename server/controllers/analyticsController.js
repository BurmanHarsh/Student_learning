const { getDb } = require('../config/database');

const getStudentStats = async (req, res) => {
    try {
        const db = getDb();
        const userId = req.user.userId;

        // 1. Count total projects user is member of
        const projectCount = await db.collection('projectMembers').countDocuments({ userId: new ObjectId(userId), status: 'accepted' });

        // 2. Count tasks assigned to user by status
        const taskStats = await db.collection('tasks').aggregate([
            { $match: { assignedTo: new ObjectId(userId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]).toArray();

        // 3. Get upcoming deadlines
        const upcomingTasks = await db.collection('tasks').find({
            assignedTo: new ObjectId(userId),
            status: { $ne: 'DONE' },
            deadline: { $gt: new Date() }
        }).sort({ deadline: 1 }).limit(5).toArray();

        res.status(200).json({
            success: true,
            data: {
                projectCount,
                taskStats,
                upcomingTasks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const db = getDb();

        const totalStudents = await db.collection('users').countDocuments({ role: 'student' });
        const totalFaculty = await db.collection('users').countDocuments({ role: 'faculty' });
        const totalProjects = await db.collection('projects').countDocuments();
        const activeProjects = await db.collection('projects').countDocuments({ status: 'active' });

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalFaculty,
                totalProjects,
                activeProjects
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFacultyStats = async (req, res) => {
    try {
        const db = getDb();
        const facultyId = req.user.userId;

        const assignedProjects = await db.collection('projects').countDocuments({ facultyId: new ObjectId(facultyId) });
        const pendingReviews = await db.collection('submissions').countDocuments({
            status: 'pending',
            projectId: { $in: (await db.collection('projects').find({ facultyId: new ObjectId(facultyId) }).map(p => p._id)) }
        });

        res.status(200).json({
            success: true,
            data: {
                assignedProjects,
                pendingReviews
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStudentStats, getAdminStats, getFacultyStats };
