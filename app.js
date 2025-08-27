// AM 2 PM Food Service - Application Logic
class FoodServiceApp {
    constructor() {
        this.isAdmin = false;
        this.currentUser = '';
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentView = 'dashboard';

        // Updated users: Abid Hossain and Ahsan Ansari
        this.users = ["Abid Hossain", "Ahsan Ansari"];
        this.monthlyRate = 2700;
        this.dailyRate = 90;
        this.mealRate = 45;

        // Initialize sample meal data for Abid and Ahsan
        this.mealData = {
            "Abid Hossain": {
                "2025-08-27": { lunch: true, dinner: false },
                "2025-08-26": { lunch: true, dinner: true },
                "2025-08-25": { lunch: false, dinner: true },
                "2025-08-24": { lunch: true, dinner: false },
                "2025-08-23": { lunch: false, dinner: false },
                "2025-08-22": { lunch: true, dinner: true },
                "2025-08-21": { lunch: true, dinner: true },
                "2025-08-20": { lunch: false, dinner: true },
                "2025-08-19": { lunch: true, dinner: false },
                "2025-08-18": { lunch: true, dinner: true },
                "2025-08-17": { lunch: false, dinner: false },
                "2025-08-16": { lunch: true, dinner: true },
                "2025-08-15": { lunch: true, dinner: false }
            },
            "Ahsan Ansari": {
                "2025-08-27": { lunch: false, dinner: true },
                "2025-08-26": { lunch: true, dinner: true },
                "2025-08-25": { lunch: true, dinner: false },
                "2025-08-24": { lunch: false, dinner: true },
                "2025-08-23": { lunch: true, dinner: false },
                "2025-08-22": { lunch: true, dinner: true },
                "2025-08-21": { lunch: false, dinner: false },
                "2025-08-20": { lunch: true, dinner: true },
                "2025-08-19": { lunch: false, dinner: true },
                "2025-08-18": { lunch: true, dinner: false },
                "2025-08-17": { lunch: true, dinner: true },
                "2025-08-16": { lunch: false, dinner: false },
                "2025-08-15": { lunch: true, dinner: true }
            }
        };

        // Initialize sample payment data for Abid and Ahsan
        this.paymentData = {
            "Abid Hossain": { amount: 1500, date: "2025-08-01", month: "August 2025" },
            "Ahsan Ansari": { amount: 2200, date: "2025-08-05", month: "August 2025" }
        };

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
            this.updateCurrentUserLabel();
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
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        console.log('Login attempt:', username); // For debugging

        // Support for 2 admin users
        if ((username === 'AbidHossain' && password === 'Abid@786') || 
            (username === 'Ehsan Ansari' && password === 'Ehsan@786')) {
            console.log('Admin login successful');
            this.isAdmin = true;
            this.showApp();
            this.currentUser = this.users[0]; // Set default user to Abid Hossain
            document.getElementById('userSelect').value = this.currentUser;
            this.updateCurrentUserLabel();
            this.renderCurrentView();
        } else {
            console.log('Login failed');
            this.showError('Invalid credentials. Please try again.');
        }
    }

    handleViewOnly() {
        console.log('View-only mode activated');
        this.isAdmin = false;
        this.showApp();
        this.currentUser = this.users[0]; // Set default user to Abid Hossain
        document.getElementById('userSelect').value = this.currentUser;
        this.updateCurrentUserLabel();
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

    updateCurrentUserLabel() {
        const label = document.getElementById('currentUserLabel');
        if (label) {
            label.textContent = this.currentUser;
        }
    }

    updateAdminControls() {
        const adminControls = document.querySelectorAll('.admin-only');
        adminControls.forEach(control => {
            control.style.display = this.isAdmin ? 'block' : 'none';
        });

        // Disable meal toggles for view-only users
        const mealToggles = document.querySelectorAll('input[data-meal]');
        mealToggles.forEach(toggle => {
            toggle.disabled = !this.isAdmin;
        });
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.login-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'login-error';
            errorDiv.style.cssText = `
                color: #e74c3c;
                background: rgba(231, 76, 60, 0.1);
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
                text-align: center;
                font-size: 14px;
            `;
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

        // Update admin controls after rendering
        this.updateAdminControls();
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
            <div class="viewing-info">
                <h2>Dashboard - ${this.currentUser}</h2>
                <p class="viewing-label">Currently viewing data for: <strong>${this.currentUser}</strong></p>
            </div>

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
                <h3>Recent Activity - ${this.currentUser}</h3>
                ${this.renderRecentActivity()}
            </div>
        `;
    }

    renderRecentActivity() {
        const userData = this.mealData[this.currentUser] || {};
        const recent = Object.entries(userData)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .slice(0, 7);

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
            <div class="viewing-info">
                <h2>Meals - ${this.currentUser}</h2>
                <p class="viewing-label">Currently viewing data for: <strong>${this.currentUser}</strong></p>
            </div>

            <div class="meal-view">
                <div class="date-header">
                    <button class="btn btn--outline" id="prevDate">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3>${this.selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</h3>
                    <button class="btn btn--outline" id="nextDate">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div class="meals-container">
                    <div class="meal-card">
                        <div class="meal-header">
                            <h4><i class="fas fa-sun"></i> Lunch</h4>
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
                            ${!this.isAdmin ? '<small class="text-muted">(View Only)</small>' : ''}
                        </div>
                    </div>

                    <div class="meal-card">
                        <div class="meal-header">
                            <h4><i class="fas fa-moon"></i> Dinner</h4>
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
                            ${!this.isAdmin ? '<small class="text-muted">(View Only)</small>' : ''}
                        </div>
                    </div>
                </div>

                <div class="day-summary">
                    <h4>Day Summary for ${this.currentUser}</h4>
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
            <div class="viewing-info">
                <h2>Payments - ${this.currentUser}</h2>
                <p class="viewing-label">Currently viewing data for: <strong>${this.currentUser}</strong></p>
            </div>

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
                    <h4>Record Payment for ${this.currentUser}</h4>
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
                ` : '<p class="text-muted">Payment recording is only available to admins.</p>'}

                <div class="payment-history">
                    <h4>Payment History</h4>
                    ${paymentData.date ? `
                        <div class="payment-record">
                            <div class="payment-date">${new Date(paymentData.date).toLocaleDateString()}</div>
                            <div class="payment-amount">₹${paymentData.amount}</div>
                            <div class="payment-user">Payment by/for: ${this.currentUser}</div>
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
            <div class="viewing-info">
                <h2>Analytics - ${this.currentUser}</h2>
                <p class="viewing-label">Currently viewing data for: <strong>${this.currentUser}</strong></p>
            </div>

            <div class="analytics-view">
                <div class="analytics-grid">
                    <div class="chart-container">
                        <h4>Weekly Meal Pattern</h4>
                        <div class="week-chart">
                            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => `
                                <div class="day-column">
                                    <div class="day-label">${day}</div>
                                    <div class="meal-bars">
                                        <div class="meal-bar lunch-bar" 
                                             style="height: ${Math.max((weeklyStats[index]?.lunch || 0) * 20, 2)}px"
                                             title="Lunch: ${weeklyStats[index]?.lunch || 0}"></div>
                                        <div class="meal-bar dinner-bar" 
                                             style="height: ${Math.max((weeklyStats[index]?.dinner || 0) * 20, 2)}px"
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
                            <span class="stat-percentage">(${Math.round(mealTypeStats.lunch/Math.max(mealTypeStats.totalDays,1)*100)}%)</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Dinner Attendance:</span>
                            <span class="stat-value">${mealTypeStats.dinner}/${mealTypeStats.totalDays}</span>
                            <span class="stat-percentage">(${Math.round(mealTypeStats.dinner/Math.max(mealTypeStats.totalDays,1)*100)}%)</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Overall Attendance:</span>
                            <span class="stat-value">${mealTypeStats.total}/${mealTypeStats.totalDays * 2}</span>
                            <span class="stat-percentage">(${Math.round(mealTypeStats.total/Math.max(mealTypeStats.totalDays*2,1)*100)}%)</span>
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
                <h4>Day Summary for ${this.currentUser}</h4>
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
        this.showSuccessMessage(`Payment of ₹${amount} recorded for ${this.currentUser}!`);

        // Clear form
        document.getElementById('paymentAmount').value = '';

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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
        const element = document.getElementById('currentDateTime');
        if (element) {
            element.textContent = now.toLocaleString();
        }
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

        console.log('User logged out');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FoodServiceApp();
    console.log('AM 2 PM Food Service App initialized');
    console.log('Available users:', window.app.users);
});

// Add some CSS for the viewing info
const additionalCSS = `
    .viewing-info {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        text-align: center;
    }

    .viewing-label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        margin: 10px 0 0 0;
    }

    .viewing-label strong {
        color: #fff;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .text-muted {
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }

    .payment-user {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 5px;
    }
`;

// Add the CSS to the document
if (document.head) {
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}
