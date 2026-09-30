// backend/server.js
// SpendSmart — Express Server Entry Point

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const authRoutes   = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*' }));         // Allow all origins for dev
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/expenses', expenseRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'SpendSmart', version: '1.0.0' });
});

// ── 404 for unknown API routes ────────────────────────────────
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found.' });
});

// ── SPA Fallback (serve index.html for all non-API routes) ───
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 SpendSmart Server running at http://localhost:${PORT}`);
    console.log(`📁 Database: ./database/SpendSmart.db`);
    console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'from .env' : 'default (set JWT_SECRET in .env!)'}\n`);
});