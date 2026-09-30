// backend/routes/authRoutes.js
// Handles user registration, login, and profile

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { protect } = require('../middleware/authMiddleware');

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'SpendSmart_super_secret_2024';
const JWT_EXPIRES = '7d';

// Helper: generate JWT
function signToken(user) {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, currency, monthly_budget } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });

        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

        const existing = UserModel.findByEmail(email);
        if (existing)
            return res.status(409).json({ success: false, message: 'Email already registered.' });

        const hashed = await bcrypt.hash(password, 12);
        const userId = UserModel.create({ name, email, password: hashed, currency, monthly_budget });

        const user  = UserModel.findById(userId);
        const token = signToken(user);

        res.status(201).json({ success: true, token, user });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Email and password are required.' });

        const user = UserModel.findByEmail(email);
        if (!user)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const safeUser = UserModel.findById(user.id); // no password field
        const token    = signToken(safeUser);

        res.json({ success: true, token, user: safeUser });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', protect, (req, res) => {
    const user = UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
});

// ── PATCH /api/auth/budget ───────────────────────────────────
router.patch('/budget', protect, (req, res) => {
    const { monthly_budget } = req.body;
    if (monthly_budget === undefined)
        return res.status(400).json({ success: false, message: 'monthly_budget is required.' });
    UserModel.updateBudget(req.user.id, monthly_budget);
    res.json({ success: true, message: 'Budget updated.' });
});

module.exports = router;