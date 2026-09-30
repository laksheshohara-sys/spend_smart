// backend/models/expenseModel.js
// All database operations for expenses, categories, and budgets

const { getDB } = require('../config/db');

const ExpenseModel = {

    // ── Categories ────────────────────────────────────────────

    getAllCategories() {
        return getDB().prepare('SELECT * FROM categories ORDER BY name').all();
    },

    getCategoryById(id) {
        return getDB().prepare('SELECT * FROM categories WHERE id = ?').get(id);
    },

    // ── Expenses ──────────────────────────────────────────────

    // Get all expenses for a user (joined with category info), newest first
    getByUser(userId, { limit = 100, offset = 0, category_id, startDate, endDate } = {}) {
        const db = getDB();
        let query = `
            SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.user_id = ?
        `;
        const params = [userId];

        if (category_id)  { query += ' AND e.category_id = ?'; params.push(category_id); }
        if (startDate)    { query += ' AND e.date >= ?';        params.push(startDate); }
        if (endDate)      { query += ' AND e.date <= ?';        params.push(endDate); }

        query += ' ORDER BY e.date DESC, e.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return db.prepare(query).all(...params);
    },

    // Get single expense by ID (owned by user)
    getById(id, userId) {
        return getDB().prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(id, userId);
    },

    // Add new expense
    create({ user_id, category_id, title, amount, note, date }) {
        const db = getDB();
        const stmt = db.prepare(
            'INSERT INTO expenses (user_id, category_id, title, amount, note, date) VALUES (?, ?, ?, ?, ?, ?)'
        );
        const result = stmt.run(user_id, category_id, title, amount, note || null, date);
        return result.lastInsertRowid;
    },

    // Delete expense (only if owned by user)
    delete(id, userId) {
        const result = getDB().prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, userId);
        return result.changes > 0;
    },

    // ── Analytics ─────────────────────────────────────────────

    // Total spending per category for a date range
    getCategoryTotals(userId, startDate, endDate) {
        return getDB().prepare(`
            SELECT c.id, c.name, c.icon, c.color,
                   COUNT(e.id)   AS count,
                   SUM(e.amount) AS total
            FROM categories c
            LEFT JOIN expenses e ON e.category_id = c.id
                AND e.user_id = ?
                AND e.date BETWEEN ? AND ?
            GROUP BY c.id
            ORDER BY total DESC
        `).all(userId, startDate, endDate);
    },

    // Daily totals for chart (last N days)
    getDailyTotals(userId, startDate, endDate) {
        return getDB().prepare(`
            SELECT date, SUM(amount) AS total
            FROM expenses
            WHERE user_id = ? AND date BETWEEN ? AND ?
            GROUP BY date
            ORDER BY date ASC
        `).all(userId, startDate, endDate);
    },

    // Monthly totals for current year
    getMonthlyTotals(userId, year) {
        return getDB().prepare(`
            SELECT strftime('%m', date) AS month,
                   SUM(amount) AS total
            FROM expenses
            WHERE user_id = ? AND strftime('%Y', date) = ?
            GROUP BY month
            ORDER BY month ASC
        `).all(userId, String(year));
    },

    // Grand total for a date range
    getTotalAmount(userId, startDate, endDate) {
        const row = getDB().prepare(`
            SELECT COALESCE(SUM(amount), 0) AS total
            FROM expenses
            WHERE user_id = ? AND date BETWEEN ? AND ?
        `).get(userId, startDate, endDate);
        return row.total;
    },

    // ── Budgets ───────────────────────────────────────────────

    setBudget({ user_id, category_id, amount, month, year }) {
        const db = getDB();
        db.prepare(`
            INSERT INTO budgets (user_id, category_id, amount, month, year)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, category_id, month, year)
            DO UPDATE SET amount = excluded.amount
        `).run(user_id, category_id, amount, month, year);
    },

    getBudgets(userId, month, year) {
        return getDB().prepare(`
            SELECT b.*, c.name AS category_name, c.icon, c.color
            FROM budgets b
            JOIN categories c ON b.category_id = c.id
            WHERE b.user_id = ? AND b.month = ? AND b.year = ?
        `).all(userId, month, year);
    }
};

module.exports = ExpenseModel;