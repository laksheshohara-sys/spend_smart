// backend/middleware/authMiddleware.js
// Protects routes by verifying JWT Bearer token

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SpendSmart_super_secret_2024';

function protect(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, name, email }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }
}

module.exports = { protect };