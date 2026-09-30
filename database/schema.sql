-- ============================================================
-- SpendSmart Database Schema
-- Database: SQLite
-- ============================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    currency    TEXT    DEFAULT 'INR',
    monthly_budget REAL DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expense Categories (reference table)
CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL UNIQUE,
    icon  TEXT    NOT NULL,
    color TEXT    NOT NULL
);

-- Seed default categories
INSERT OR IGNORE INTO categories (name, icon, color) VALUES
    ('Food & Dining',    '🍔', '#FF6B6B'),
    ('Transport',        '🚗', '#4ECDC4'),
    ('Shopping',         '🛍️', '#45B7D1'),
    ('Entertainment',    '🎬', '#96CEB4'),
    ('Health & Medical', '💊', '#FFEAA7'),
    ('Education',        '📚', '#DDA0DD'),
    ('Utilities',        '⚡', '#98D8C8'),
    ('Rent & Housing',   '🏠', '#F7DC6F'),
    ('Travel',           '✈️', '#BB8FCE'),
    ('Others',           '💸', '#AAB7B8');

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    title       TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    note        TEXT,
    date        DATE    NOT NULL DEFAULT (DATE('now')),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Budgets Table (per-category monthly budgets)
CREATE TABLE IF NOT EXISTS budgets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount      REAL    NOT NULL,
    month       INTEGER NOT NULL,  -- 1-12
    year        INTEGER NOT NULL,
    UNIQUE(user_id, category_id, month, year),
    FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user    ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date    ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_cat     ON expenses(category_id);