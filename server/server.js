const app = require('./app');
const { connectDB } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Connect to Database
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
