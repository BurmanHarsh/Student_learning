const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function initializeDatabase() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB for initialization...');
        const db = client.db();

        const collections = [
            'users',
            'projects',
            'projectMembers',
            'tasks',
            'milestones',
            'submissions',
            'comments',
            'notifications',
            'departments',
            'activityLogs'
        ];

        for (const colName of collections) {
            await db.createCollection(colName);
            console.log(`Created collection: ${colName}`);
        }

        // Create Indexes
        console.log('Creating indexes...');

        // Users: Unique Email
        await db.collection('users').createIndex({ email: 1 }, { unique: true });

        // Projects: Indexes for faster lookups
        await db.collection('projects').createIndex({ ownerId: 1 });
        await db.collection('projects').createIndex({ facultyId: 1 });
        await db.collection('projects').createIndex({ status: 1 });

        // Project Members: Index on projectId and userId
        await db.collection('projectMembers').createIndex({ projectId: 1 });
        await db.collection('projectMembers').createIndex({ userId: 1 });

        // Tasks: Index on projectId and assignee
        await db.collection('tasks').createIndex({ projectId: 1 });
        await db.collection('tasks').createIndex({ assignedTo: 1 });
        await db.collection('tasks').createIndex({ status: 1 });

        // Milestones: Index on projectId
        await db.collection('milestones').createIndex({ projectId: 1 });

        // Submissions: Index on projectId
        await db.collection('submissions').createIndex({ projectId: 1 });

        // Notifications: Index on userId
        await db.collection('notifications').createIndex({ userId: 1 });

        console.log('✅ All collections and indexes initialized successfully!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    } finally {
        await client.close();
    }
}

initializeDatabase();
