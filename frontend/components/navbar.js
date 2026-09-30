// frontend/components/navbar.js
// Injects the navbar and manages active state + logout

function renderNavbar(activePage = '') {
    const user = getUser();
    const loggedIn = isLoggedIn();

    const nav = document.createElement('nav');
    nav.className = 'navbar';

    nav.innerHTML = `
        <a href="/index.html" class="navbar-brand">Expense<span>IQ</span></a>
        <ul class="navbar-links" id="nav-links">
            ${loggedIn ? `
                <li><a href="/dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">📊 Dashboard</a></li>
                <li><a href="/history.html"   class="${activePage === 'history'   ? 'active' : ''}">📜 History</a></li>
                <li><a href="/insights.html"  class="${activePage === 'insights'  ? 'active' : ''}">💡 Insights</a></li>
                <li>
                    <span style="color:var(--text3);font-size:0.85rem;padding:0 8px;">
                        👋 ${user?.name?.split(' ')[0] || 'User'}
                    </span>
                </li>
                <li>
                    <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">Logout</button>
                </li>
            ` : `
                <li><a href="/index.html"    class="${activePage === 'home'     ? 'active' : ''}">Home</a></li>
                <li><a href="/login.html"    class="${activePage === 'login'    ? 'active' : ''}">Sign In</a></li>
                <li><a href="/register.html" class="${activePage === 'register' ? 'active' : ''}">
                    <button class="btn btn-primary btn-sm">Get Started</button>
                </a></li>
            `}
        </ul>
    `;

    document.body.insertBefore(nav, document.body.firstChild);
}

// ── Toast notification system ─────────────────────────────────

function initToasts() {
    if (!document.getElementById('toast-container')) {
        const tc = document.createElement('div');
        tc.id = 'toast-container';
        tc.className = 'toast-container';
        document.body.appendChild(tc);
    }
}

function showToast(message, type = 'info', duration = 3000) {
    initToasts();
    const tc    = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    tc.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}