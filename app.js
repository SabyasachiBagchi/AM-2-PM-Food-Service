document.addEventListener('DOMContentLoaded', () => {
    class FoodServiceApp {
        constructor() {
            // State
            this.isAdmin = false;
            this.currentUser = ''; // The user whose data is being viewed/edited
            this.loggedInUser = ''; // The user who is logged in
            this.currentDate = new Date();
            this.selectedDate = null;
            this.editingPaymentId = null; // Track which payment is being edited

            // Data
            this.users = ["Abid Hossain", "Ahsan Ansari"];
            this.mealRate = 45;
            this.mealData = {
                "Abid Hossain": {
                    "2025-08-27": { lunch: true, dinner: false }, "2025-08-26": { lunch: true, dinner: true }, "2025-08-25": { lunch: false, dinner: true }
                },
                "Ahsan Ansari": {
                    "2025-08-27": { lunch: false, dinner: true }, "2025-08-26": { lunch: true, dinner: true }, "2025-08-25": { lunch: true, dinner: false }
                }
            };
            this.paymentData = { // Added unique IDs to each payment
                "Abid Hossain": [{ id: 1722510000000, amount: 1500, date: "2025-08-01" }],
                "Ahsan Ansari": [{ id: 1722855600000, amount: 2200, date: "2025-08-05" }]
            };
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.startClock();
        }

        bindEvents() {
            document.getElementById('loginForm').addEventListener('submit', e => { e.preventDefault(); this.handleLogin(); });
            document.getElementById('viewOnlyBtn').addEventListener('click', () => this.handleViewOnly());
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
            document.getElementById('userSelect').addEventListener('change', e => { this.currentUser = e.target.value; this.updateAllViews(); });
            document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
            document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
            document.getElementById('calendar').addEventListener('click', e => {
                const dayCell = e.target.closest('.day-cell');
                if (dayCell && dayCell.dataset.date) {
                    this.selectedDate = new Date(dayCell.dataset.date);
                    this.updateDayDetailView(); this.switchView('dayDetailView');
                }
            });
            document.getElementById('backToCalendar').addEventListener('click', () => this.switchView('dashboardView'));
            document.getElementById('lunchToggle').addEventListener('change', e => this.updateMealStatus('lunch', e.target.checked));
            document.getElementById('dinnerToggle').addEventListener('change', e => this.updateMealStatus('dinner', e.target.checked));
            document.getElementById('backToCalendarFromPayment').addEventListener('click', () => this.switchView('dashboardView'));
            document.getElementById('paymentForm').addEventListener('submit', e => { e.preventDefault(); this.handlePaymentFormSubmit(); });
            document.getElementById('cancelEditBtn').addEventListener('click', () => this.resetPaymentForm());
            document.getElementById('paymentList').addEventListener('click', e => { // Event delegation for payment actions
                if (e.target.closest('.edit-btn')) this.handleEditPayment(e.target.closest('.edit-btn').dataset.paymentId);
                if (e.target.closest('.delete-btn')) this.handleDeletePayment(e.target.closest('.delete-btn').dataset.paymentId);
            });
            document.getElementById('fabBtn').addEventListener('click', () => document.getElementById('fabMenu').classList.toggle('hidden'));
            document.getElementById('addPaymentBtn').addEventListener('click', () => {
                this.resetPaymentForm(); this.updatePaymentView(); this.switchView('paymentView');
                document.getElementById('fabMenu').classList.add('hidden');
            });
        }
        
        startClock() {
            const update = () => {
                const now = new Date();
                document.getElementById('clock-time').textContent = now.toLocaleTimeString();
                document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            };
            update();
            setInterval(update, 1000);
        }

        handleLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username === 'AbidHossain' && password === 'Abid@786') { this.loggedInUser = 'Abid Hossain'; this.showApp(true); }
            else if (username === 'AhsanAnsari' && password === 'Ahsan@786') { this.loggedInUser = 'Ahsan Ansari'; this.showApp(true); }
            else { this.showError('Invalid credentials. Please try again.'); }
        }

        handleViewOnly() { this.loggedInUser = 'View Only'; this.showApp(false); }

        showApp(isAdmin) {
            this.isAdmin = isAdmin;
            this.currentUser = this.isAdmin ? this.loggedInUser : this.users[0];
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('app').classList.remove('hidden');
            document.getElementById('currentUser').textContent = `Logged in as: ${this.loggedInUser}`;

            const userSelector = document.querySelector('.user-selector');
            const fab = document.getElementById('fab');
            userSelector.classList.remove('hidden'); // Always show selector
            const select = document.getElementById('userSelect');
            select.innerHTML = this.users.map(u => `<option value="${u}" ${u === this.currentUser ? 'selected' : ''}>${u}</option>`).join('');
            select.disabled = !this.isAdmin && this.loggedInUser !== 'View Only'; // Allow changing in View Only or Admin modes

            fab.classList.toggle('hidden', !this.isAdmin);
            this.updateAllViews(); this.switchView('dashboardView');
        }

        logout() {
            document.getElementById('app').classList.add('hidden');
            document.getElementById('loginModal').style.display = 'flex';
            document.getElementById('loginForm').reset(); this.showError('', true);
        }
        
        switchView(viewId) {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.getElementById(viewId).classList.remove('hidden');
        }
        
        updateAllViews() { this.updateDashboardView(); }

        updateDashboardView() {
            document.getElementById('currentMonth').textContent = this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            const stats = this.calculateMonthlyStats();
            document.getElementById('mealsEaten').textContent = stats.totalMeals;
            document.getElementById('totalDue').textContent = `₹${stats.totalCost}`;
            document.getElementById('amountPaid').textContent = `₹${stats.totalPaid}`;
            document.getElementById('balance').textContent = `₹${stats.balance}`;
            this.renderCalendar();
        }

        renderCalendar() {
            const calEl = document.getElementById('calendar'); calEl.innerHTML = '';
            const year = this.currentDate.getFullYear(), month = this.currentDate.getMonth();
            const firstDay = new Date(year, month, 1), daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDay = (firstDay.getDay() + 6) % 7;
            for (let i = 0; i < startDay; i++) calEl.innerHTML += `<div class="day-cell empty"></div>`;
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day), dateStr = date.toISOString().split('T')[0];
                const dayData = this.mealData[this.currentUser]?.[dateStr];
                let classes = 'day-cell', dots = '';
                if (dayData) {
                    if (dayData.lunch) dots += '<div class="meal-dot lunch"></div>';
                    if (dayData.dinner) dots += '<div class="meal-dot dinner"></div>';
                }
                if (date.toDateString() === new Date().toDateString()) classes += ' today';
                calEl.innerHTML += `<div class="${classes}" data-date="${date.toISOString()}"><div class="day-number">${day}</div><div class="meal-dots">${dots}</div></div>`;
            }
        }
        
        navigateMonth(dir) { this.currentDate.setMonth(this.currentDate.getMonth() + dir); this.updateDashboardView(); }
        
        updateDayDetailView() {
            if (!this.selectedDate) return;
            document.getElementById('selectedDate').textContent = this.selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const dateStr = this.selectedDate.toISOString().split('T')[0];
            const dayData = this.mealData[this.currentUser]?.[dateStr] || { lunch: false, dinner: false };
            const lunchToggle = document.getElementById('lunchToggle'), dinnerToggle = document.getElementById('dinnerToggle');
            lunchToggle.checked = dayData.lunch; dinnerToggle.checked = dayData.dinner;
            lunchToggle.disabled = !this.isAdmin; dinnerToggle.disabled = !this.isAdmin;
            document.getElementById('lunchToggleLabel').textContent = dayData.lunch ? "Eaten" : "Skipped";
            document.getElementById('dinnerToggleLabel').textContent = dayData.dinner ? "Eaten" : "Skipped";
            this.updateDaySummary();
        }

        updateMealStatus(meal, status) {
            const dateStr = this.selectedDate.toISOString().split('T')[0];
            if (!this.mealData[this.currentUser]) this.mealData[this.currentUser] = {};
            if (!this.mealData[this.currentUser][dateStr]) this.mealData[this.currentUser][dateStr] = { lunch: false, dinner: false };
            this.mealData[this.currentUser][dateStr][meal] = status;
            this.updateDayDetailView(); this.updateDashboardView();
        }

        updateDaySummary() {
            const dateStr = this.selectedDate.toISOString().split('T')[0];
            const dayData = this.mealData[this.currentUser]?.[dateStr] || { lunch: false, dinner: false };
            const mealCount = (dayData.lunch ? 1 : 0) + (dayData.dinner ? 1 : 0);
            document.getElementById('dayMealCount').textContent = mealCount;
            document.getElementById('dayCost').textContent = `₹${mealCount * this.mealRate}`;
        }

        updatePaymentView() {
            const payments = this.paymentData[this.currentUser] || [];
            const listEl = document.getElementById('paymentList'); listEl.innerHTML = '';
            if (payments.length === 0) { listEl.innerHTML = '<p class="no-payments">No payments recorded.</p>'; return; }
            payments.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(p => {
                listEl.innerHTML += `
                    <div class="payment-item">
                        <div class="payment-details">
                            <strong>₹${p.amount}</strong>
                            <span>${new Date(p.date).toLocaleDateString()}</span>
                        </div>
                        ${this.isAdmin ? `
                        <div class="payment-actions">
                            <button class="btn btn--icon edit-btn" data-payment-id="${p.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn btn--icon delete-btn" data-payment-id="${p.id}"><i class="fas fa-trash"></i></button>
                        </div>` : ''}
                    </div>`;
            });
        }
        
        handlePaymentFormSubmit() {
            const amount = parseInt(document.getElementById('paymentAmount').value);
            const date = document.getElementById('paymentDate').value;
            if (!this.paymentData[this.currentUser]) this.paymentData[this.currentUser] = [];
            
            if (this.editingPaymentId) { // Update existing payment
                const payment = this.paymentData[this.currentUser].find(p => p.id == this.editingPaymentId);
                payment.amount = amount; payment.date = date;
                alert('Payment updated successfully!');
            } else { // Add new payment
                const newPayment = { id: Date.now(), amount, date };
                this.paymentData[this.currentUser].push(newPayment);
                alert('Payment recorded successfully!');
            }
            this.resetPaymentForm(); this.updatePaymentView(); this.updateDashboardView();
        }

        handleEditPayment(paymentId) {
            this.editingPaymentId = paymentId;
            const payment = this.paymentData[this.currentUser].find(p => p.id == paymentId);
            document.getElementById('paymentFormTitle').textContent = 'Edit Payment';
            document.getElementById('paymentAmount').value = payment.amount;
            document.getElementById('paymentDate').value = payment.date;
            document.getElementById('savePaymentBtn').innerHTML = '<i class="fas fa-save"></i> Update Payment';
            document.getElementById('cancelEditBtn').classList.remove('hidden');
        }

        handleDeletePayment(paymentId) {
            if (confirm('Are you sure you want to delete this payment record?')) {
                this.paymentData[this.currentUser] = this.paymentData[this.currentUser].filter(p => p.id != paymentId);
                this.updatePaymentView(); this.updateDashboardView();
            }
        }

        resetPaymentForm() {
            this.editingPaymentId = null;
            document.getElementById('paymentForm').reset();
            document.getElementById('paymentFormTitle').textContent = 'Record Payment';
            document.getElementById('savePaymentBtn').innerHTML = '<i class="fas fa-save"></i> Save Payment';
            document.getElementById('cancelEditBtn').classList.add('hidden');
        }

        calculateMonthlyStats() {
            const meals = this.mealData[this.currentUser] || {};
            const payments = this.paymentData[this.currentUser] || [];
            const year = this.currentDate.getFullYear(), month = this.currentDate.getMonth();
            let totalMeals = 0;
            for (const date in meals) {
                const d = new Date(date);
                if (d.getFullYear() === year && d.getMonth() === month) {
                    if (meals[date].lunch) totalMeals++; if (meals[date].dinner) totalMeals++;
                }
            }
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            const totalCost = totalMeals * this.mealRate;
            return { totalMeals, totalCost, totalPaid, balance: totalCost - totalPaid };
        }

        showError(msg, clear = false) {
            const errDiv = document.getElementById('loginError');
            errDiv.textContent = msg; errDiv.classList.toggle('hidden', clear || !msg);
        }
    }
    window.app = new FoodServiceApp();
});
