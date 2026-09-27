const { generateToken, verifyToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

const register = async (req, res) => {
    try {
        const { name, email, password, role, enrollmentNumber, departmentId, skills } = req.body;
        const db = getDb();

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            name,
            email,
            password: hashedPassword,
            role, // 'student', 'faculty', 'admin'
            departmentId: departmentId ? new ObjectId(departmentId) : null,
            enrollmentNumber,
            skills: skills || [],
            profileImage: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        const token = generateToken(result.insertedId, role);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            userId: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDb();

        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user.userId) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, getMe };
