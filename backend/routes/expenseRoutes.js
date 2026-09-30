// backend/routes/expenseRoutes.js
// CRUD for expenses + analytics + AI-style savings suggestions

const express      = require('express');
const ExpenseModel = require('../models/expenseModel');
const { protect }  = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// ── Helper: date helpers ──────────────────────────────────────
function today()      { return new Date().toISOString().split('T')[0]; }
function daysAgo(n)   { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; }
function monthStart() { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; }
function yearStart()  { return `${new Date().getFullYear()}-01-01`; }

// ── GET /api/expenses/categories ────────────────────────────
router.get('/categories', (req, res) => {
    const cats = ExpenseModel.getAllCategories();
    res.json({ success: true, categories: cats });
});

// ── GET /api/expenses/summary ────────────────────────────────
// Returns weekly & monthly totals, category breakdowns, daily chart data
router.get('/summary', (req, res) => {
    const uid = req.user.id;
    const t   = today();
    const w   = daysAgo(6);   // last 7 days
    const ms  = monthStart();
    const yr  = new Date().getFullYear();

    const weekly  = ExpenseModel.getTotalAmount(uid, w, t);
    const monthly = ExpenseModel.getTotalAmount(uid, ms, t);

    const weeklyByCategory  = ExpenseModel.getCategoryTotals(uid, w, t);
    const monthlyByCategory = ExpenseModel.getCategoryTotals(uid, ms, t);

    const dailyWeek   = ExpenseModel.getDailyTotals(uid, w, t);
    const monthlyYear = ExpenseModel.getMonthlyTotals(uid, yr);

    res.json({
        success: true,
        summary: {
            weekly,
            monthly,
            weeklyByCategory,
            monthlyByCategory,
            dailyWeek,
            monthlyYear
        }
    });
});

// ── GET /api/expenses/suggestions ───────────────────────────
// Generate rule-based savings suggestions per category
router.get('/suggestions', (req, res) => {
    const uid = req.user.id;
    const ms  = monthStart();
    const t   = today();

    const catTotals = ExpenseModel.getCategoryTotals(uid, ms, t);
    const monthly   = ExpenseModel.getTotalAmount(uid, ms, t);

    const TIPS = {
        'Food & Dining':    ['Try meal prepping on Sundays to cut dining costs by up to 40%.', 'Cooking at home just 3 extra days a week can save significantly.', 'Use grocery apps like BigBasket during sale periods.'],
        'Transport':        ['Carpooling or metro commuting can halve your travel spend.', 'Refuel during non-peak hours to avoid rush markups.', 'Consider a monthly metro pass — it pays off after 12 rides.'],
        'Shopping':         ['Apply the 48-hour rule: wait 2 days before buying non-essentials.', 'Use cashback cards or coupons for regular purchases.', 'Unsubscribe from retail newsletters to reduce impulse buying.'],
        'Entertainment':    ['Share streaming subscriptions with family to reduce costs.', 'Look for student discounts or early-bird movie tickets.', 'One free outdoor activity per week can replace paid entertainment.'],
        'Health & Medical': ['Preventive check-ups reduce expensive emergency bills long-term.', 'Buy generic medicines — same efficacy, lower price.', 'Health insurance with OPD cover can offset routine expenses.'],
        'Education':        ['Use free resources: Coursera audits, YouTube, Khan Academy.', 'Buy used textbooks or borrow from the library.', 'Group study reduces cost of shared study materials.'],
        'Utilities':        ['Switch off appliances at the plug — standby mode wastes power.', 'LED bulbs pay for themselves in 3 months via savings.', 'Fix leaking taps promptly — they waste thousands of litres annually.'],
        'Rent & Housing':   ['Negotiate your rent annually — many landlords prefer stable tenants.', 'Share accommodation to split fixed housing costs.', 'Small maintenance prevents costly repairs — inspect quarterly.'],
        'Travel':           ['Book flights 6-8 weeks in advance for best fares.', 'Travel during off-peak season for up to 50% savings.', 'Use reward points and air miles for upgrade benefits.'],
        'Others':           ['Track every ₹10 spend — small leaks sink big ships.', 'Review subscriptions monthly and cancel unused ones.', 'Set a daily cash limit to build spending awareness.']
    };

    const suggestions = catTotals
        .filter(c => c.total > 0)
        .map(c => {
            const pct  = monthly > 0 ? ((c.total / monthly) * 100).toFixed(1) : 0;
            const tips = TIPS[c.name] || TIPS['Others'];
            const tip  = tips[Math.floor(Math.random() * tips.length)];

            // Alert level based on % of spend
            let alert = 'normal';
            if (pct > 40) alert = 'high';
            else if (pct > 25) alert = 'medium';

            return {
                category:    c.name,
                icon:        c.icon,
                color:       c.color,
                total:       c.total,
                percentage:  pct,
                alert,
                tip
            };
        })
        .sort((a, b) => b.total - a.total);

    res.json({ success: true, suggestions });
});

// ── GET /api/expenses ────────────────────────────────────────
router.get('/', (req, res) => {
    const { category_id, startDate, endDate, limit, offset } = req.query;
    const expenses = ExpenseModel.getByUser(req.user.id, {
        category_id: category_id ? parseInt(category_id) : undefined,
        startDate,
        endDate,
        limit:  limit  ? parseInt(limit)  : 100,
        offset: offset ? parseInt(offset) : 0
    });
    res.json({ success: true, expenses });
});

// ── POST /api/expenses ───────────────────────────────────────
router.post('/', (req, res) => {
    const { category_id, title, amount, note, date } = req.body;

    if (!category_id || !title || !amount)
        return res.status(400).json({ success: false, message: 'category_id, title, and amount are required.' });

    if (isNaN(amount) || amount <= 0)
        return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });

    const cat = ExpenseModel.getCategoryById(category_id);
    if (!cat)
        return res.status(404).json({ success: false, message: 'Category not found.' });

    const id = ExpenseModel.create({
        user_id: req.user.id,
        category_id,
        title:  title.trim(),
        amount: parseFloat(amount),
        note:   note?.trim(),
        date:   date || today()
    });

    // Return the full expense with category info
    const expense = ExpenseModel.getByUser(req.user.id, { limit: 1 });
    res.status(201).json({ success: true, expense: expense[0], id });
});

// ── DELETE /api/expenses/:id ─────────────────────────────────
router.delete('/:id', (req, res) => {
    const deleted = ExpenseModel.delete(parseInt(req.params.id), req.user.id);
    if (!deleted)
        return res.status(404).json({ success: false, message: 'Expense not found or not owned by you.' });
    res.json({ success: true, message: 'Expense deleted.' });
});

// ── POST /api/expenses/budget ────────────────────────────────
router.post('/budget', (req, res) => {
    const { category_id, amount, month, year } = req.body;
    if (!category_id || !amount)
        return res.status(400).json({ success: false, message: 'category_id and amount required.' });

    const d = new Date();
    ExpenseModel.setBudget({
        user_id: req.user.id,
        category_id,
        amount:  parseFloat(amount),
        month:   month || (d.getMonth() + 1),
        year:    year  || d.getFullYear()
    });
    res.json({ success: true, message: 'Budget set.' });
});

// ── GET /api/expenses/budget ─────────────────────────────────
router.get('/budget', (req, res) => {
    const d = new Date();
    const budgets = ExpenseModel.getBudgets(
        req.user.id,
        req.query.month || (d.getMonth() + 1),
        req.query.year  || d.getFullYear()
    );
    res.json({ success: true, budgets });
});

module.exports = router;