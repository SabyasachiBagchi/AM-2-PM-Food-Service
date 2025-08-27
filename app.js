document.addEventListener('DOMContentLoaded', () => {
    class FoodServiceApp {
        constructor() {
            // State
            this.isAdmin = false;
            this.currentUser = '';
            this.loggedInUser = '';
            this.currentDate = new new Date();
            this.selectedDate = null;
            this.editingPaymentId = null;

            // Data
            this.users = ["Abid Hossain", "Ahsan Ansari"];
            this.mealRate = 45;
            
            // MODIFICATION: Load saved data instead of using fixed data
            this._loadData();
            
            this.init();
        }

        // --- NEW: DATA PERSISTENCE (SAVE & LOAD) --- //
        _saveData() {
            localStorage.setItem('mealData', JSON.stringify(this.mealData));
            localStorage.setItem('paymentData', JSON.stringify(this.paymentData));
        }

        _loadData() {
            const savedMealData = localStorage.getItem('mealData');
            const savedPaymentData = localStorage.getItem('paymentData');

            // Load saved meal data, or set default data if none exists
            if (savedMealData) {
                this.mealData = JSON.parse(savedMealData);
            } else {
                this.mealData = {
                    "Abid Hossain": { 
                        "2025-07-25": { lunch: true, dinner: true },
                        "2025-08-27": { lunch: true, dinner: false }, 
                        "2025-08-26": { lunch: true, dinner: true } 
                    },
                    "Ahsan Ansari": { "2025-08-26": { lunch: true, dinner: true } }
                };
            }

            // Load saved payment data, or set default data if none exists
            if (savedPaymentData) {
                this.paymentData = JSON.parse(savedPaymentData);
            } else {
                this.paymentData = {
                    "Abid Hossain": [
                        { id: Date.now() - 1000, amount: 500, date: "2025-07-15" },
                        { id: Date.now(), amount: 1500, date: "2025-08-01" }
                    ],
                    "Ahsan Ansari": [{ id: Date.now() + 1, amount: 2000, date: "2025-08-05" }]
                };
            }
        }
        // --- END OF NEW CODE --- //

        init() {
            this.mainContent = document.getElementById('main-content');
            this.bindEvents();
            this.applyTheme();
            this.startClock();
            this.initParticles();
        }

        bindEvents() {
            document.getElementById('loginForm').addEventListener('submit', e => { e.preventDefault(); this.handleLogin(); });
            document.getElementById('viewOnlyBtn').addEventListener('click', () => this.handleViewOnly());
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
            document.getElementById('userSelect').addEventListener('change', e => { this.currentUser = e.target.value; this.renderDashboardView(); });
            document.getElementById('themeToggle').addEventListener('change', e => this.toggleTheme(e.target.checked));
            
            this.mainContent.addEventListener('click', e => {
                if (e.target.closest('#prevMonth')) this.navigateMonth(-1);
                if (e.target.closest('#nextMonth')) this.navigateMonth(1);
                const dayCell = e.target.closest('.day-cell:not(.empty)');
                if (dayCell) {
                    const [year, month, day] = dayCell.dataset.date.split('-').map(Number);
                    this.selectedDate = new Date(year, month - 1, day); 
                    this.renderDayDetailView();
                }
                if (e.target.closest('#backToCalendar')) this.renderDashboardView();
                if (e.target.closest('.edit-btn')) this.handleEditPayment(e.target.closest('.edit-btn').dataset.paymentId);
                if (e.target.closest('.delete-btn')) this.handleDeletePayment(e.target.closest('.delete-btn').dataset.paymentId);
            });

            this.mainContent.addEventListener('change', e => {
                if (e.target.id === 'lunchToggle') this.updateMealStatus('lunch', e.target.checked);
                if (e.target.id === 'dinnerToggle') this.updateMealStatus('dinner', e.target.checked);
            });
            
            this.mainContent.addEventListener('submit', e => {
                if (e.target.id === 'paymentForm') { e.preventDefault(); this.handlePaymentFormSubmit(); }
            });

            const fab = document.getElementById('fab');
            fab.addEventListener('click', e => {
                const fabMenu = document.getElementById('fabMenu');
                if (e.target.closest('#fabBtn')) {
                    fabMenu.classList.toggle('hidden');
                }
                if (e.target.closest('#addPaymentBtn')) {
                    this.renderPaymentView();
                    fabMenu.classList.add('hidden');
                }
            });
        }

        // --- THEME, CLOCK, & PARTICLE METHODS --- //
        toggleTheme(isDark) { document.body.classList.toggle('dark-mode', isDark); localStorage.setItem('theme', isDark ? 'dark' : 'light'); }
        applyTheme() { const theme = localStorage.getItem('theme') || 'light'; this.toggleTheme(theme === 'dark'); document.getElementById('themeToggle').checked = (theme === 'dark'); }
        startClock() { const update = () => { const now = new Date(); document.getElementById('clock-time').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }; update(); setInterval(update, 1000); }
        initParticles() { particlesJS('particles-js', {"particles":{"number":{"value":60,"density":{"enable":true,"value_area":800}},"color":{"value":"#888888"},"shape":{"type":"circle"},"opacity":{"value":0.5,"random":true},"size":{"value":3,"random":true},"line_linked":{"enable":true,"distance":150,"color":"#888888","opacity":0.4,"width":1},"move":{"enable":true,"speed":4,"direction":"none","random":true,"straight":false,"out_mode":"out","bounce":false}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"repulse"},"onclick":{"enable":true,"mode":"push"},"resize":true},"modes":{"repulse":{"distance":100,"duration":0.4},"push":{"particles_nb":4}}},"retina_detect":true}); }

        // --- LOGIN & APP SETUP --- //
        handleLogin() {
            const user = document.getElementById('username').value; const pass = document.getElementById('password').value; const errDiv = document.getElementById('loginError');
            if ((user === 'AbidHossain' && pass === 'Abid@786') || (user === 'AhsanAnsari' && pass === 'Ahsan@786')) {
                this.loggedInUser = this.users.find(u => u.startsWith(user.replace('Hossain', '').replace('Ansari', '')));
                this.showApp(true);
            } else { errDiv.textContent = 'Invalid credentials.'; errDiv.classList.remove('hidden'); }
        }
        handleViewOnly() { this.loggedInUser = 'View Only'; this.showApp(false); }
        showApp(isAdmin) {
            this.isAdmin = isAdmin; this.currentUser = this.isAdmin ? this.loggedInUser : this.users[0];
            document.getElementById('loginModal').style.display = 'none'; document.getElementById('app').classList.remove('hidden');
            document.getElementById('currentUser').textContent = `Logged in: ${this.loggedInUser}`;
            document.getElementById('fab').classList.toggle('hidden', !this.isAdmin);
            const select = document.getElementById('userSelect');
            select.innerHTML = this.users.map(u => `<option value="${u}" ${u === this.currentUser ? 'selected' : ''}>${u}</option>`).join('');
            select.disabled = !this.isAdmin && this.loggedInUser !== 'View Only';
            this.renderDashboardView();
        }
        logout() { location.reload(); }

        // --- UTILITY --- //
        getLocalISODate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // --- VIEW RENDERING --- //
        renderDashboardView() {
            const stats = this.calculateStats();
            this.mainContent.innerHTML = `
                <div id="dashboardView" class="view">
                    <div class="dashboard-header">
                        <h1>Monthly Overview</h1>
                        <div class="month-nav"><button id="prevMonth" class="btn btn--outline"><i class="fas fa-chevron-left"></i></button><span id="currentMonth">${this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><button id="nextMonth" class="btn btn--outline"><i class="fas fa-chevron-right"></i></button></div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-wallet"></i></div><div class="stat-content"><h3>₹${stats.balanceRemaining}</h3><p>Balance Remaining</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-rupee-sign"></i></div><div class="stat-content"><h3>₹${stats.spentThisMonth}</h3><p>Spent This Month</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-credit-card"></i></div><div class="stat-content"><h3>₹${stats.paidThisMonth}</h3><p>Paid This Month</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-utensils"></i></div><div class="stat-content"><h3>${stats.mealsThisMonth}</h3><p>Meals This Month</p></div></div>
                    </div>
                    <div class="calendar-section"><div class="calendar-header"><h2>Meal Calendar</h2></div><div id="calendar" class="calendar-grid"></div></div>
                </div>`;
            this.renderCalendar();
        }

        renderCalendar() {
            const calEl = document.getElementById('calendar'); calEl.innerHTML = '';
            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            daysOfWeek.forEach(day => calEl.innerHTML += `<div class="calendar-day-header">${day}</div>`);
            const year = this.currentDate.getFullYear(), month = this.currentDate.getMonth();
            const firstDay = new Date(year, month, 1), daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDay = (firstDay.getDay() + 6) % 7;
            for (let i = 0; i < startDay; i++) calEl.innerHTML += `<div class="day-cell empty"></div>`;
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateStr = this.getLocalISODate(date);
                const dayData = this.mealData[this.currentUser]?.[dateStr];
                let classes = 'day-cell', dots = '';
                if (dayData) {
                    if (dayData.lunch) dots += '<div class="meal-dot lunch"></div>';
                    if (dayData.dinner) dots += '<div class="meal-dot dinner"></div>';
                }
                if (date.toDateString() === new Date().toDateString()) classes += ' today';
                calEl.innerHTML += `<div class="${classes}" data-date="${dateStr}"><div class="day-number">${day}</div><div class="meal-dots">${dots}</div></div>`;
            }
        }

        renderDayDetailView() {
            const dateStr = this.getLocalISODate(this.selectedDate);
            const dayData = this.mealData[this.currentUser]?.[dateStr] || { lunch: false, dinner: false };
            const mealCount = (dayData.lunch ? 1 : 0) + (dayData.dinner ? 1 : 0);
            this.mainContent.innerHTML = `
                <div id="dayDetailView" class="view">
                    <div class="day-detail-header"><button id="backToCalendar" class="btn btn--outline"><i class="fas fa-arrow-left"></i> Back</button><h1>${this.selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h1></div>
                    <div class="meal-cards">
                        <div class="meal-card">
                            <div class="meal-header"><h3><i class="fas fa-sun"></i> Lunch</h3><div class="meal-cost">₹${this.mealRate}</div></div>
                            <div class="meal-toggle"><label class="toggle-switch"><input type="checkbox" id="lunchToggle" ${dayData.lunch ? 'checked' : ''} ${!this.isAdmin ? 'disabled' : ''}><span class="toggle-slider"></span></label><span class="toggle-label">${dayData.lunch ? 'Eaten' : 'Skipped'}</span></div>
                        </div>
                        <div class="meal-card">
                            <div class="meal-header"><h3><i class="fas fa-moon"></i> Dinner</h3><div class="meal-cost">₹${this.mealRate}</div></div>
                            <div class="meal-toggle"><label class="toggle-switch"><input type="checkbox" id="dinnerToggle" ${dayData.dinner ? 'checked' : ''} ${!this.isAdmin ? 'disabled' : ''}><span class="toggle-slider"></span></label><span class="toggle-label">${dayData.dinner ? 'Eaten' : 'Skipped'}</span></div>
                        </div>
                    </div>
                    <div class="day-summary"><div class="summary-card"><h4>Daily Summary</h4><div class="summary-item"><span>Meals:</span><span>${mealCount}</span></div><div class="summary-item"><span>Cost:</span><span>₹${mealCount * this.mealRate}</span></div></div></div>
                </div>`;
        }
        
        renderPaymentView() {
            this.mainContent.innerHTML = `
                <div id="paymentView" class="view">
                    <div class="payment-header"><button id="backToCalendar" class="btn btn--outline"><i class="fas fa-arrow-left"></i> Back</button><h1>Payment Tracking</h1></div>
                    <div class="payment-form-card"></div>
                    <div class="payment-history"><h3>Payment History</h3><div id="paymentList" class="payment-list"></div></div>
                </div>`;
            this.resetPaymentForm();
            this.updatePaymentList();
        }

        // --- DATA & LOGIC --- //
        navigateMonth(dir) { this.currentDate.setMonth(this.currentDate.getMonth() + dir); this.renderDashboardView(); }
        
        updateMealStatus(meal, status) {
            const dateStr = this.getLocalISODate(this.selectedDate);
            if (!this.mealData[this.currentUser]) this.mealData[this.currentUser] = {};
            if (!this.mealData[this.currentUser][dateStr]) this.mealData[this.currentUser][dateStr] = { lunch: false, dinner: false };
            this.mealData[this.currentUser][dateStr][meal] = status;
            this._saveData(); // MODIFICATION: Save changes
            this.renderDayDetailView();
        }
        
        // --- PAYMENT & CALCULATION LOGIC --- //
        
        calculateStats() {
            const meals = this.mealData[this.currentUser] || {};
            const payments = this.paymentData[this.currentUser] || [];
            
            let totalSpentAllTime = 0;
            for (const dateStr in meals) {
                if (meals[dateStr].lunch) totalSpentAllTime += this.mealRate;
                if (meals[dateStr].dinner) totalSpentAllTime += this.mealRate;
            }
            const totalPaidAllTime = payments.reduce((sum, p) => sum + p.amount, 0);
            
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            let mealsThisMonth = 0;
            let spentThisMonth = 0;
            for (const dateStr in meals) {
                const d = new Date(dateStr);
                if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
                    if (meals[dateStr].lunch) { mealsThisMonth++; spentThisMonth += this.mealRate; }
                    if (meals[dateStr].dinner) { mealsThisMonth++; spentThisMonth += this.mealRate; }
                }
            }
            const paidThisMonth = payments.reduce((sum, p) => {
                const d = new Date(p.date);
                return (d.getUTCFullYear() === year && d.getUTCMonth() === month) ? sum + p.amount : sum;
            }, 0);

            const balanceRemaining = totalPaidAllTime - totalSpentAllTime;

            return { balanceRemaining, spentThisMonth, paidThisMonth, mealsThisMonth };
        }

        handlePaymentFormSubmit() {
            const amount = parseInt(document.getElementById('paymentAmount').value);
            const date = document.getElementById('paymentDate').value;
            if (!amount || !date) return;
            if (!this.paymentData[this.currentUser]) this.paymentData[this.currentUser] = [];
            
            if (this.editingPaymentId) {
                const payment = this.paymentData[this.currentUser].find(p => p.id == this.editingPaymentId);
                payment.amount = amount;
                payment.date = date;
            } else {
                this.paymentData[this.currentUser].push({ id: Date.now(), amount, date });
            }
            this._saveData(); // MODIFICATION: Save changes
            this.resetPaymentForm();
            this.updatePaymentList();
        }
        handleEditPayment(id) {
            this.editingPaymentId = id;
            const payment = this.paymentData[this.currentUser].find(p => p.id == id);
            document.getElementById('paymentFormTitle').textContent = 'Edit Payment';
            document.getElementById('paymentAmount').value = payment.amount;
            document.getElementById('paymentDate').value = payment.date;
        }
        handleDeletePayment(id) {
            if (confirm('Delete this payment?')) {
                this.paymentData[this.currentUser] = this.paymentData[this.currentUser].filter(p => p.id != id);
                this._saveData(); // MODIFICATION: Save changes
                this.updatePaymentList();
            }
        }
        resetPaymentForm() {
            this.editingPaymentId = null;
            const formContainer = this.mainContent.querySelector('.payment-form-card');
            formContainer.innerHTML = `<h3 id="paymentFormTitle">Record Payment</h3><form id="paymentForm"><div class="form-group"><label>Amount</label><input type="number" id="paymentAmount" class.form-control" required></div><div class="form-group"><label>Date</label><input type="date" id="paymentDate" class="form-control" required></div><button type="submit" class="btn btn--primary">Save</button></form>`;
            document.getElementById('paymentDate').valueAsDate = new Date();
        }
        updatePaymentList() {
            const listEl = document.getElementById('paymentList');
            if (!listEl) return;
            listEl.innerHTML = '';
            const payments = this.paymentData[this.currentUser] || [];
            if (payments.length === 0) { listEl.innerHTML = '<p>No payments recorded.</p>'; return; }
            payments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(p => {
                listEl.innerHTML += `<div class="payment-item"><div><strong>₹${p.amount}</strong><span> on ${new Date(p.date).toLocaleDateString()}</span></div><div class="payment-actions">${this.isAdmin ? `<button class="btn--icon edit-btn" data-payment-id="${p.id}"><i class="fas fa-edit"></i></button><button class="btn--icon delete-btn" data-payment-id="${p.id}"><i class="fas fa-trash"></i></button>` : ''}</div></div>`;
            });
        }
    }

    window.app = new FoodServiceApp();
});
