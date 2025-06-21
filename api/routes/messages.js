const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to check for specific roles
const hasRole = (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
        return next();
    }
    res.status(403).json({ message: 'Forbidden' });
};

// Contact form: submit message
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }
    try {
        await pool.query(
            'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ message: 'Error saving message.' });
    }
});

// Admin: get all messages and mark unseen as seen
router.get('/', isAuthenticated, hasRole(['super', 'sub-super']), async (req, res) => {
    try {
        const [messages] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        // Mark all unseen messages as seen
        await pool.query('UPDATE messages SET seen = TRUE WHERE seen = FALSE');
        res.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages.' });
    }
});

// Get count of unseen messages (for notification badge)
router.get('/unseen/count', hasRole(['super', 'sub-super']), async (req, res) => {
    try {
        const [result] = await pool.query('SELECT COUNT(*) as unseenCount FROM messages WHERE seen = FALSE');
        res.json({ unseenCount: result[0].unseenCount });
    } catch (error) {
        console.error('Error fetching unseen messages count:', error);
        res.status(500).json({ message: 'Error fetching unseen messages count.' });
    }
});


module.exports = router;