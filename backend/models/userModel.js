// backend/models/userModel.js
// All database operations related to users

const { getDB } = require('../config/db');

const UserModel = {

    // Find user by email
    findByEmail(email) {
        const db = getDB();
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    },

    // Find user by ID
    findById(id) {
        const db = getDB();
        return db.prepare('SELECT id, name, email, currency, monthly_budget, created_at FROM users WHERE id = ?').get(id);
    },

    // Create new user
    create({ name, email, password, currency = 'INR', monthly_budget = 0 }) {
        const db = getDB();
        const stmt = db.prepare(
            'INSERT INTO users (name, email, password, currency, monthly_budget) VALUES (?, ?, ?, ?, ?)'
        );
        const result = stmt.run(name, email, password, currency, monthly_budget);
        return result.lastInsertRowid;
    },

    // Update monthly budget
    updateBudget(userId, monthlyBudget) {
        const db = getDB();
        db.prepare('UPDATE users SET monthly_budget = ? WHERE id = ?').run(monthlyBudget, userId);
    }
};

module.exports = UserModel;