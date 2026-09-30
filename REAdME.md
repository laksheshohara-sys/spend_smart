# 💰 SpendSmart — Smart Expense Tracker

A full-stack expense tracking web application with AI-powered savings suggestions, category-wise analytics, and transaction history.

---

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── db.js              # SQLite database connection
│   ├── models/
│   │   ├── userModel.js       # User DB operations
│   │   └── expenseModel.js    # Expense DB operations
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/* endpoints
│   │   └── expenseRoutes.js   # /api/expenses/* endpoints
│   └── middleware/
│       └── authMiddleware.js  # JWT token verification
│
├── database/
│   └── schema.sql             # Database schema
│
├── frontend/
│   ├── index.html             # Landing / Home page
│   ├── login.html             # Sign In page
│   ├── register.html          # Sign Up page
│   ├── dashboard.html         # Main dashboard (after login)
│   ├── assets/css/
│   │   └── style.css          # Global styles
│   ├── components/
│   │   └── navbar.js          # Shared navbar component
│   └── utils/
│       └── api.js             # Frontend API helper functions
│
├── package.json
└── README.md
```

---

## 🚀 Features

- 🔐 **Authentication** — Register/Login with JWT sessions
- ➕ **Add / Delete Expenses** — With categories, amounts, dates, notes
- 📊 **Dashboard Analytics** — Weekly & Monthly charts (Chart.js)
- 🏷️ **Category Breakdown** — Food, Transport, Health, Shopping, etc.
- 📜 **Transaction History** — Full filterable history
- 💡 **Smart Suggestions** — AI-style savings tips per category
- 📱 **Responsive Design** — Works on mobile & desktop

---

## ⚙️ Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
node backend/server.js
```

### 3. Open Frontend
Open `frontend/index.html` in your browser  
OR serve via Live Server (VS Code extension)

> Backend runs at: `http://localhost:5000`

---

## 🛠️ Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | HTML5, CSS3, Vanilla JS     |
| Charts    | Chart.js                    |
| Backend   | Node.js + Express.js        |
| Database  | SQLite (via better-sqlite3) |
| Auth      | JWT + bcryptjs              |

---

## 📦 API Endpoints

| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| POST   | /api/auth/register         | Register new user        |
| POST   | /api/auth/login            | Login & get token        |
| GET    | /api/expenses              | Get all user expenses    |
| POST   | /api/expenses              | Add new expense          |
| DELETE | /api/expenses/:id          | Delete an expense        |
| GET    | /api/expenses/summary      | Weekly/Monthly summary   |
| GET    | /api/expenses/suggestions  | Savings suggestions      |