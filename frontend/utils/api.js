// frontend/utils/api.js
// Centralised API helper for all frontend HTTP calls

const API_BASE = 'http://localhost:5000/api';

// ── Auth helpers ──────────────────────────────────────────────

function getToken() {
    return localStorage.getItem('token');
}

function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
    }
}

function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = '/dashboard.html';
    }
}

// ── Core fetch wrapper ────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
    }
    return data;
}

// ── Auth API ──────────────────────────────────────────────────

const Auth = {
    async register(payload) {
        const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
        saveAuth(data.token, data.user);
        return data;
    },

    async login(email, password) {
        const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
        saveAuth(data.token, data.user);
        return data;
    },

    logout() {
        clearAuth();
        window.location.href = '/index.html';
    },

    async me() {
        return apiFetch('/auth/me');
    }
};

// ── Expenses API ──────────────────────────────────────────────

const Expenses = {
    async getAll(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return apiFetch(`/expenses${qs ? '?' + qs : ''}`);
    },

    async add(payload) {
        return apiFetch('/expenses', { method: 'POST', body: JSON.stringify(payload) });
    },

    async remove(id) {
        return apiFetch(`/expenses/${id}`, { method: 'DELETE' });
    },

    async getCategories() {
        return apiFetch('/expenses/categories');
    },

    async getSummary() {
        return apiFetch('/expenses/summary');
    },

    async getSuggestions() {
        return apiFetch('/expenses/suggestions');
    }
};

// ── Formatting helpers ────────────────────────────────────────

function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now - date) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return `${diff} days ago`;
    return formatDate(dateStr);
}