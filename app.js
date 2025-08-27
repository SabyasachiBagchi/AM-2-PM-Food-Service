document.addEventListener('DOMContentLoaded', () => {
    class FoodServiceApp {
        constructor() {
            // State
            this.isAdmin = false;
            this.currentUser = '';
            this.loggedInUser = '';
            this.currentDate = new Date();
            this.selectedDate = null;
            this.editingPaymentId = null;

            // Data
            this.users = ["Abid Hossain", "Ahsan Ansari"];
            this.mealRate = 45;
            this.mealData = {
                "Abid Hossain": { "2025-08-27": { lunch: true, dinner: false }, "2025-08-26": { lunch: true, dinner: true } },
                "Ahsan Ansari": { "2025-08-26": { lunch: true, dinner: true } }
            };
            this.paymentData = {
                "Abid Hossain": [{ id: Date.now(), amount: 1500, date: "2025-08-01" }],
                "Ahsan Ansari": [{ id: Date.now() + 1, amount: 2000, date: "2025-08-05" }]
            };
            
            this.init();
        }

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
                    // FIX: Construct date carefully to avoid timezone issues.
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
                if (e.target.closest('#fabBtn')) document.getElementById('fabMenu').classList.toggle('hidden');
                if (e.target.closest('#addPaymentBtn')) this.renderPaymentView();
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
            const stats = this.calculateMonthlyStats();
            this.mainContent.innerHTML = `
                <div id="dashboardView" class="view">
                    <div class="dashboard-header">
                        <h1>Monthly Overview</h1>
                        <div class="month-nav"><button id="prevMonth" class="btn btn--outline"><i class="fas fa-chevron-left"></i></button><span id="currentMonth">${this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span><button id="nextMonth" class="btn btn--outline"><i class="fas fa-chevron-right"></i></button></div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-calendar-check"></i></div><div class="stat-content"><h3>${stats.totalMeals}</h3><p>Meals Eaten</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-rupee-sign"></i></div><div class="stat-content"><h3>₹${stats.totalCost}</h3><p>Total Due</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-credit-card"></i></div><div class="stat-content"><h3>₹${stats.totalPaid}</h3><p>Amount Paid</p></div></div>
                        <div class="stat-card"><div class="stat-icon"><i class="fas fa-balance-scale"></i></div><div class="stat-content"><h3>₹${stats.balance}</h3><p>Balance</p></div></div>
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
                const dateStr = this.getLocalISODate(date); // Use helper function
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
            // FIX: Use helper function to prevent timezone bug
            const dateStr = this.getLocalISODate(this.selectedDate);
            const dayData = this.mealData[this.currentUser]?.[dateStr] || { lunch: false, dinner: false };
            const mealCount = (dayData.lunch ? 1 : 0) + (dayData.dinner ? 1 : 0);
            this.mainContent.innerHTML = `
                <div id="dayDetailView" class="view">
                    <div class="day-detail-header"><button id="backToCalendar" class="btn btn--outline"><i class="fas fa-arrow-left"></i> Back</button><h1>${this.selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h1></div>
                    <div class="meal-cards">
                        <div class="meal-card">
                            <div class="meal-header"><h3><i class="fas fa-sun"></i> Lunch</h3><div class="meal-cost">₹${this.mealRate}</div></div>
                            <div class="meal-toggle">
                                <label class="toggle-switch"><input type="checkbox" id="lunchToggle" ${dayData.lunch ? 'checked' : ''} ${!this.isAdmin ? 'disabled' : ''}><span class="toggle-slider"></span></label>
                                <span class="toggle-label">${dayData.lunch ? 'Eaten' : 'Skipped'}</span>
                            </div>
                        </div>
                        <div class="meal-card">
                            <div class="meal-header"><h3><i class="fas fa-moon"></i> Dinner</h3><div class="meal-cost">₹${this.mealRate}</div></div>
                            <div class="meal-toggle">
                                <label class="toggle-switch"><input type="checkbox" id="dinnerToggle" ${dayData.dinner ? 'checked' : ''} ${!this.isAdmin ? 'disabled' : ''}><span class="toggle-slider"></span></label>
                                <span class="toggle-label">${dayData.dinner ? 'Eaten' : 'Skipped'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="day-summary"><div class="summary-card"><h4>Daily Summary</h4><div class="summary-item"><span>Meals:</span><span>${mealCount}</span></div><div class="summary-item"><span>Cost:</span><span>₹${mealCount * this.mealRate}</span></div></div></div>
                </div>`;
        }
        
        renderPaymentView() { /* ... unchanged ... */ }

        // --- DATA & LOGIC --- //
        navigateMonth(dir) { this.currentDate.setMonth(this.currentDate.getMonth() + dir); this.renderDashboardView(); }
        updateMealStatus(meal, status) {
            // FIX: Use helper function to prevent timezone bug
            const dateStr = this.getLocalISODate(this.selectedDate);
            if (!this.mealData[this.currentUser]) this.mealData[this.currentUser] = {};
            if (!this.mealData[this.currentUser][dateStr]) this.mealData[this.currentUser][dateStr] = { lunch: false, dinner: false };
            this.mealData[this.currentUser][dateStr][meal] = status;
            this.renderDayDetailView(); // Re-render to update labels and summary
        }
        
        // ... The rest of the methods (handlePaymentFormSubmit, calculateMonthlyStats, etc.) are unchanged ...
    }
    window.app = new FoodServiceApp();
});
