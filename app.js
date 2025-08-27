// AM 2 PM Food Service - Application Logic
class FoodServiceApp {
    constructor() {
        this.isAdmin = false;
        this.currentUser = '';
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentView = 'dashboard';

        // Sample data from provided JSON
        this.users = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"];
        this.monthlyRate = 2700;
        this.dailyRate = 90;
        this.mealRate = 45;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // View only button
        document.getElementById('viewOnlyBtn').addEventListener('click', () => {
            this.handleViewOnly();
        });

        // User selector
        document.getElementById('userSelect').addEventListener('change', (e) => {
            this.currentUser = e.target.value;
            this.renderCurrentView();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Date navigation
        document.getElementById('prevDate').addEventListener('click', () => {
            this.navigateDate(-1);
        });

        document.getElementById('nextDate').addEventListener('click', () => {
            this.navigateDate(1);
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Support for 2 users
        if ((username === 'admin1' && password === 'yourpassword1') || 
            (username === 'admin2' && password === 'yourpassword2')) {
            this.isAdmin = true;
            this.showApp();
            this.currentUser = this.users[0]; // Set default user
            document.getElementById('userSelect').value = this.currentUser;
            this.renderCurrentView();
        } else {
            this.showError('Invalid credentials. Please try again.');
        }
    }

    handleViewOnly() {
        this.isAdmin = false;
        this.showApp();
        this.currentUser = this.users[0]; // Set default user
        document.getElementById('userSelect').value = this.currentUser;
        this.renderCurrentView();
    }

    showApp() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        document.querySelector('.user-role').textContent = this.isAdmin ? 'Admin' : 'View Only';
        this.populateUserSelector();
        this.updateAdminControls();
    }

    populateUserSelector() {
        const select = document.getElementById('userSelect');
        select.innerHTML = this.users.map(user => 
            `<option value="${user}">${user}</option>`
        ).join('');
    }

    updateAdminControls() {
        const adminControls = document.querySelectorAll('.admin-only');
        adminControls.forEach(control => {
            control.style.display = this.isAdmin ? 'block' : 'none';
        });
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.login-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'login-error';
            document.querySelector('.login-form').appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }

    switchView(view) {
        this.currentView = view;

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        this.renderCurrentView();
    }

    renderCurrentView() {
        const content = document.getElementById('mainContent');

        switch(this.currentView) {
            case 'dashboard':
                content.innerHTML = this.renderDashboard();
                break;
            case 'meals':
                content.innerHTML = this.renderMealView();
                this.bindMealToggles();
                break;
            case 'payments':
                content.innerHTML = this.renderPaymentView();
                this.bindPaymentControls();
                break;
            case 'analytics':
                content.innerHTML = this.renderAnalytics();
                break;
        }
    }

    renderDashboard() {
        const userData = this.mealData[this.currentUser] || {};
        const paymentData = this.paymentData[this.currentUser] || { amount: 0 };

        // Calculate monthly statistics
        const currentMonth = new Date().toISOString().slice(0, 7); // "2025-08"
        const monthlyMeals = Object.entries(userData)
            .filter(([date]) => date.startsWith(currentMonth))
            .reduce((acc, [date, meals]) => {
                if (meals.lunch) acc.lunch++;
                if (meals.dinner) acc.dinner++;
                acc.total += (meals.lunch ? 1 : 0) + (meals.dinner ? 1 : 0);
                return acc;
            }, { lunch: 0, dinner: 0, total: 0 });

        const totalCost = monthlyMeals.total * this.mealRate;
        const paid = paymentData.amount || 0;
        const balance = totalCost - paid;

        return `
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-icon">🍽️</div>
                    <div class="stat-content">
                        <h3>Total Meals</h3>
                        <div class="stat-value">${monthlyMeals.total}</div>
                        <div class="stat-detail">Lunch: ${monthlyMeals.lunch} | Dinner: ${monthlyMeals.dinner}</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h3>Monthly Cost</h3>
                        <div class="stat-value">₹${totalCost}</div>
                        <div class="stat-detail">@ ₹45 per meal</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <h3>Amount Paid</h3>
                        <div class="stat-value">₹${paid}</div>
                        <div class="stat-detail">${paymentData.date || 'No payment date'}</div>
                    </div>
                </div>

                <div class="stat-card ${balance > 0 ? 'stat-card--warning' : 'stat-card--success'}">
                    <div class="stat-icon">${balance > 0 ? '⚠️' : '🎉'}</div>
                    <div class="stat-content">
                        <h3>Balance</h3>
                        <div class="stat-value">₹${balance}</div>
                        <div class="stat-detail">${balance > 0 ? 'Amount Due' : 'Fully Paid'}</div>
                    </div>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Recent Activity</h3>
                ${this.renderRecentActivity()}
            </div>
        `;
    }

    renderRecentActivity() {
        const userData = this.mealData[this.currentUser] || {};
        const recent = Object.entries(userData)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .slice(0, 5);

        return `
            <div class="activity-list">
                ${recent.map(([date, meals]) => `
                    <div class="activity-item">
                        <div class="activity-date">${new Date(date).toLocaleDateString()}</div>
                        <div class="activity-details">
                            <span class="meal-badge ${meals.lunch ? 'meal-badge--taken' : 'meal-badge--skipped'}">
                                Lunch ${meals.lunch ? '✓' : '✗'}
                            </span>
                            <span class="meal-badge ${meals.dinner ? 'meal-badge--taken' : 'meal-badge--skipped'}">
                                Dinner ${meals.dinner ? '✓' : '✗'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMealView() {
        const dateStr = this.selectedDate.toISOString().split('T')[0];
        const userData = this.mealData[this.currentUser] || {};
        const dayData = userData[dateStr] || { lunch: false, dinner: false };

        return `
            <div class="meal-view">
                <div class="date-header">
                    <button class="btn btn--outline" id="prevDate">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h2>${this.selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</h2>
                    <button class="btn btn--outline" id="nextDate">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="meals-container">
                    <div class="meal-card">
                        <div class="meal-header">
                            <h3><i class="fas fa-sun"></i> Lunch</h3>
                            <span class="meal-cost">₹45</span>
                        </div>
                        <div class="meal-toggle">
                            <label class="toggle-switch">
                                <input type="checkbox" ${dayData.lunch ? 'checked' : ''} 
                                       ${!this.isAdmin ? 'disabled' : ''} 
                                       data-meal="lunch" data-date="${dateStr}">
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="toggle-label">${dayData.lunch ? 'Eaten' : 'Not Eaten'}</span>
                        </div>
                    </div>

                    <div class="meal-card">
                        <div class="meal-header">
                            <h3><i class="fas fa-moon"></i> Dinner</h3>
                            <span class="meal-cost">₹45</span>
                        </div>
                        <div class="meal-toggle">
                            <label class="toggle-switch">
                                <input type="checkbox" ${dayData.dinner ? 'checked' : ''} 
                                       ${!this.isAdmin ? 'disabled' : ''} 
                                       data-meal="dinner" data-date="${dateStr}">
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="toggle-label">${dayData.dinner ? 'Eaten' : 'Not Eaten'}</span>
                        </div>
                    </div>
                </div>

                <div class="day-summary">
                    <h4>Day Summary</h4>
                    <p>Meals taken: ${(dayData.lunch ? 1 : 0) + (dayData.dinner ? 1 : 0)}/2</p>
                    <p>Daily cost: ₹${((dayData.lunch ? 1 : 0) + (dayData.dinner ? 1 : 0)) * this.mealRate}</p>
                </div>
            </div>
        `;
    }

    renderPaymentView() {
        const paymentData = this.paymentData[this.currentUser] || { amount: 0, date: '', month: 'August 2025' };
        const userData = this.mealData[this.currentUser] || {};

        // Calculate total meals and cost for current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyMeals = Object.entries(userData)
            .filter(([date]) => date.startsWith(currentMonth))
            .reduce((total, [date, meals]) => {
                return total + (meals.lunch ? 1 : 0) + (meals.dinner ? 1 : 0);
            }, 0);

        const totalCost = monthlyMeals * this.mealRate;
        const balance = totalCost - paymentData.amount;

        return `
            <div class="payment-view">
                <div class="payment-summary">
                    <h3>August 2025 - Payment Summary</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <label>Total Meals Taken:</label>
                            <span>${monthlyMeals}</span>
                        </div>
                        <div class="summary-item">
                            <label>Total Amount Due:</label>
                            <span>₹${totalCost}</span>
                        </div>
                        <div class="summary-item">
                            <label>Amount Paid:</label>
                            <span>₹${paymentData.amount}</span>
                        </div>
                        <div class="summary-item ${balance > 0 ? 'text-warning' : 'text-success'}">
                            <label>Balance:</label>
                            <span>₹${balance}</span>
                        </div>
                    </div>
                </div>

                ${this.isAdmin ? `
                <div class="payment-form admin-only">
                    <h4>Record Payment</h4>
                    <form id="paymentForm">
                        <div class="form-group">
                            <label for="paymentAmount">Payment Amount (₹)</label>
                            <input type="number" id="paymentAmount" class="form-control" 
                                   placeholder="Enter amount" min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label for="paymentDate">Payment Date</label>
                            <input type="date" id="paymentDate" class="form-control" 
                                   value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <button type="submit" class="btn btn--primary">
                            <i class="fas fa-save"></i> Record Payment
                        </button>
                    </form>
                </div>
                ` : ''}

                <div class="payment-history">
                    <h4>Payment History</h4>
                    ${paymentData.date ? `
                        <div class="payment-record">
                            <div class="payment-date">${new Date(paymentData.date).toLocaleDateString()}</div>
                            <div class="payment-amount">₹${paymentData.amount}</div>
                        </div>
                    ` : '<p class="text-muted">No payments recorded</p>'}
                </div>
            </div>
        `;
    }

    renderAnalytics() {
        const userData = this.mealData[this.currentUser] || {};
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Calculate weekly statistics
        const weeklyStats = this.calculateWeeklyStats(userData, currentMonth);
        const mealTypeStats = this.calculateMealTypeStats(userData, currentMonth);

        return `
            <div class="analytics-view">
                <h3>Analytics for ${this.currentUser}</h3>

                <div class="analytics-grid">
                    <div class="chart-container">
                        <h4>Weekly Meal Pattern</h4>
                        <div class="week-chart">
                            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => `
                                <div class="day-column">
                                    <div class="day-label">${day}</div>
                                    <div class="meal-bars">
                                        <div class="meal-bar lunch-bar" 
                                             style="height: ${(weeklyStats[index]?.lunch || 0) * 20}px"
                                             title="Lunch: ${weeklyStats[index]?.lunch || 0}"></div>
                                        <div class="meal-bar dinner-bar" 
                                             style="height: ${(weeklyStats[index]?.dinner || 0) * 20}px"
                                             title="Dinner: ${weeklyStats[index]?.dinner || 0}"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="chart-legend">
                            <span class="legend-item"><span class="legend-color lunch-color"></span> Lunch</span>
                            <span class="legend-item"><span class="legend-color dinner-color"></span> Dinner</span>
                        </div>
                    </div>

                    <div class="stats-container">
                        <h4>Monthly Statistics</h4>
                        <div class="stat-item">
                            <span class="stat-label">Lunch Attendance:</span>
                            <span class="stat-value">${mealTypeStats.lunch}/${mealTypeStats.totalDays}</span>
                            <span class="stat-percentage">(${Math.round(mealTypeStats.lunch/mealTypeStats.totalDays*100)}%)</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Dinner Attendance:</span>
                            <span class="stat-value">${mealTypeStats.dinner}/${mealTypeStats.totalDays}</span>
                            <span class="stat-percentage">(${Math.round(mealTypeStats.dinner/mealTypeStats.totalDays*100)}%)</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Overall Attendance:</span>
                            <span class="stat-value">${mealTypeStats.total}/${mealTypeStats.totalDays * 2}</span>
                            <span class="stat-percentage">(${Math.round(mealTypeStats.total/(mealTypeStats.totalDays*2)*100)}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateWeeklyStats(userData, month) {
        const weeklyStats = Array(7).fill(0).map(() => ({ lunch: 0, dinner: 0 }));

        Object.entries(userData)
            .filter(([date]) => date.startsWith(month))
            .forEach(([date, meals]) => {
                const dayOfWeek = new Date(date).getDay();
                const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to index 6
                if (meals.lunch) weeklyStats[index].lunch++;
                if (meals.dinner) weeklyStats[index].dinner++;
            });

        return weeklyStats;
    }

    calculateMealTypeStats(userData, month) {
        const monthData = Object.entries(userData)
            .filter(([date]) => date.startsWith(month));

        const totalDays = monthData.length;
        const lunch = monthData.filter(([date, meals]) => meals.lunch).length;
        const dinner = monthData.filter(([date, meals]) => meals.dinner).length;
        const total = lunch + dinner;

        return { totalDays, lunch, dinner, total };
    }

    bindMealToggles() {
        document.querySelectorAll('input[data-meal]').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                if (!this.isAdmin) return;

                const meal = e.target.dataset.meal;
                const date = e.target.dataset.date;
                const isChecked = e.target.checked;

                this.updateMealStatus(date, meal, isChecked);
                this.updateToggleLabel(e.target);
            });
        });
    }

    updateMealStatus(date, meal, status) {
        if (!this.mealData[this.currentUser]) {
            this.mealData[this.currentUser] = {};
        }
        if (!this.mealData[this.currentUser][date]) {
            this.mealData[this.currentUser][date] = { lunch: false, dinner: false };
        }

        this.mealData[this.currentUser][date][meal] = status;

        // Update day summary
        const dayData = this.mealData[this.currentUser][date];
        const mealsCount = (dayData.lunch ? 1 : 0) + (dayData.dinner ? 1 : 0);
        const summaryElement = document.querySelector('.day-summary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                <h4>Day Summary</h4>
                <p>Meals taken: ${mealsCount}/2</p>
                <p>Daily cost: ₹${mealsCount * this.mealRate}</p>
            `;
        }
    }

    updateToggleLabel(toggle) {
        const label = toggle.closest('.meal-toggle').querySelector('.toggle-label');
        label.textContent = toggle.checked ? 'Eaten' : 'Not Eaten';
    }

    bindPaymentControls() {
        const form = document.getElementById('paymentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.recordPayment();
            });
        }
    }

    recordPayment() {
        const amount = parseInt(document.getElementById('paymentAmount').value);
        const date = document.getElementById('paymentDate').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        if (!this.paymentData[this.currentUser]) {
            this.paymentData[this.currentUser] = { amount: 0, date: '', month: 'August 2025' };
        }

        this.paymentData[this.currentUser].amount += amount;
        this.paymentData[this.currentUser].date = date;

        // Show success message
        this.showSuccessMessage('Payment recorded successfully!');

        // Refresh payment view
        setTimeout(() => {
            this.renderCurrentView();
        }, 1000);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    navigateDate(direction) {
        this.selectedDate.setDate(this.selectedDate.getDate() + direction);
        this.renderCurrentView();
    }

    updateDateTime() {
        const now = new Date();
        document.getElementById('currentDateTime').textContent = now.toLocaleString();
    }

    logout() {
        this.isAdmin = false;
        this.currentUser = '';
        this.currentView = 'dashboard';
        document.getElementById('app').classList.add('hidden');
        document.getElementById('loginModal').style.display = 'flex';

        // Clear login form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';

        // Hide any error messages
        const errorDiv = document.querySelector('.login-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FoodServiceApp();
});

// Support for 2 users - Enhanced Authentication System
// This section provides additional authentication methods and user management

class AuthManager {
    constructor() {
        this.users = {
            'admin1': {
                password: 'yourpassword1',
                name: 'Admin User 1',
                role: 'admin',
                permissions: ['view', 'edit', 'delete', 'manage_payments']
            },
            'admin2': {
                password: 'yourpassword2', 
                name: 'Admin User 2',
                role: 'admin',
                permissions: ['view', 'edit', 'delete', 'manage_payments']
            }
        };
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
    }

    authenticate(username, password) {
        const user = this.users[username];
        if (user && user.password === password) {
            this.currentUser = {
                username: username,
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                loginTime: new Date()
            };
            this.startSessionTimer();
            return true;
        }
        return false;
    }

    hasPermission(permission) {
        return this.currentUser && this.currentUser.permissions.includes(permission);
    }

    startSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        this.sessionTimer = setTimeout(() => {
            this.logout();
            alert('Session expired. Please login again.');
        }, this.sessionTimeout);
    }

    refreshSession() {
        if (this.currentUser) {
            this.startSessionTimer();
        }
    }

    logout() {
        this.currentUser = null;
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        // Trigger app logout
        if (window.app) {
            window.app.logout();
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Method to change password (admin function)
    changePassword(username, oldPassword, newPassword) {
        const user = this.users[username];
        if (user && user.password === oldPassword) {
            user.password = newPassword;
            return true;
        }
        return false;
    }

    // Method to add new user (if needed in future)
    addUser(username, password, name, role = 'admin') {
        if (this.users[username]) {
            return false; // User already exists
        }

        this.users[username] = {
            password: password,
            name: name,
            role: role,
            permissions: role === 'admin' ? ['view', 'edit', 'delete', 'manage_payments'] : ['view']
        };
        return true;
    }
}

// Initialize Auth Manager
window.authManager = new AuthManager();

// Auto-refresh session on user activity
document.addEventListener('click', () => {
    if (window.authManager.isLoggedIn()) {
        window.authManager.refreshSession();
    }
});

document.addEventListener('keypress', () => {
    if (window.authManager.isLoggedIn()) {
        window.authManager.refreshSession();
    }
});
