document.addEventListener('DOMContentLoaded', () => {
    class FoodServiceApp {
        constructor() {
            // State properties
            this.isAdmin = false;
            this.currentUser = '';
            this.loggedInUser = '';
            this.currentDate = new Date(); // Tracks the month being viewed
            this.selectedDate = null; // Tracks the specific day clicked

            // Hardcoded data
            this.users = ["Abid Hossain", "Ahsan Ansari"];
            this.mealRate = 45;
            this.mealData = {
                "Abid Hossain": {
                    "2025-08-27": { lunch: true, dinner: false },
                    "2025-08-26": { lunch: true, dinner: true },
                    "2025-08-25": { lunch: false, dinner: true },
                    "2025-08-24": { lunch: true, dinner: false },
                    "2025-08-23": { lunch: false, dinner: false },
                    "2025-08-22": { lunch: true, dinner: true },
                    "2025-08-21": { lunch: true, dinner: true },
                },
                "Ahsan Ansari": {
                    "2025-08-27": { lunch: false, dinner: true },
                    "2025-08-26": { lunch: true, dinner: true },
                    "2025-08-25": { lunch: true, dinner: false },
                    "2025-08-24": { lunch: false, dinner: true },
                    "2025-08-23": { lunch: true, dinner: false },
                    "2025-08-22": { lunch: true, dinner: true },
                }
            };
            this.paymentData = {
                "Abid Hossain": [{ amount: 1500, date: "2025-08-01" }],
                "Ahsan Ansari": [{ amount: 2200, date: "2025-08-05" }]
            };

            this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            // Login
            document.getElementById('loginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
            document.getElementById('viewOnlyBtn').addEventListener('click', () => this.handleViewOnly());

            // Main App Controls
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
            document.getElementById('userSelect').addEventListener('change', (e) => {
                this.currentUser = e.target.value;
                this.updateAllViews();
            });

            // Month Navigation
            document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
            document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));

            // Calendar day clicking (Event Delegation)
            document.getElementById('calendar').addEventListener('click', (e) => {
                const dayCell = e.target.closest('.day-cell');
                if (dayCell && dayCell.dataset.date) {
                    this.selectedDate = new Date(dayCell.dataset.date);
                    this.updateDayDetailView();
                    this.switchView('dayDetailView');
                }
            });

            // Day Detail View
            document.getElementById('backToCalendar').addEventListener('click', () => this.switchView('dashboardView'));
            document.getElementById('lunchToggle').addEventListener('change', (e) => this.updateMealStatus('lunch', e.target.checked));
            document.getElementById('dinnerToggle').addEventListener('change', (e) => this.updateMealStatus('dinner', e.target.checked));

            // Payment View
            document.getElementById('backToCalendarFromPayment').addEventListener('click', () => this.switchView('dashboardView'));
            document.getElementById('paymentForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.recordPayment();
            });

            // FAB Menu
            document.getElementById('fabBtn').addEventListener('click', () => {
                 document.getElementById('fabMenu').classList.toggle('hidden');
            });
            document.getElementById('addPaymentBtn').addEventListener('click', () => {
                this.updatePaymentView();
                this.switchView('paymentView');
                document.getElementById('fabMenu').classList.add('hidden');
            });
        }
        
        // --- LOGIN & APP SETUP --- //

        handleLogin() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'AbidHossain' && password === 'Abid@786') {
                this.loggedInUser = 'Abid Hossain';
                this.showApp(true);
            } else if (username === 'AhsanAnsari' && password === 'Ahsan@786') {
                this.loggedInUser = 'Ahsan Ansari';
                this.showApp(true);
            } else {
                this.showError('Invalid credentials. Please try again.');
            }
        }

        handleViewOnly() {
            this.loggedInUser = 'View Only';
            this.showApp(false);
        }

        showApp(isAdmin) {
            this.isAdmin = isAdmin;
            this.currentUser = this.isAdmin ? this.loggedInUser : this.users[0];

            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('app').classList.remove('hidden');
            
            // Configure header
            document.getElementById('currentUser').textContent = this.loggedInUser;
            const userSelector = document.querySelector('.user-selector');
            const fab = document.getElementById('fab');

            if (this.isAdmin) {
                userSelector.classList.add('hidden');
                fab.classList.remove('hidden');
            } else {
                userSelector.classList.remove('hidden');
                fab.classList.add('hidden');
                const select = document.getElementById('userSelect');
                select.innerHTML = this.users.map(u => `<option value="${u}" ${u === this.currentUser ? 'selected' : ''}>${u}</option>`).join('');
            }
            
            this.updateAllViews();
            this.switchView('dashboardView');
        }

        logout() {
            this.isAdmin = false;
            this.currentUser = '';
            this.loggedInUser = '';

            document.getElementById('app').classList.add('hidden');
            document.getElementById('loginModal').style.display = 'flex';
            document.getElementById('loginForm').reset();
            this.showError('', true); // Hide error on logout
        }

        // --- VIEW MANAGEMENT --- //
        
        switchView(viewId) {
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            document.getElementById(viewId).classList.remove('hidden');
        }
        
        updateAllViews() {
            this.updateDashboardView();
            // Other views are updated on demand (when clicked/opened)
        }
        
        // --- DASHBOARD VIEW --- //

        updateDashboardView() {
            const month = this.currentDate.getMonth();
            const year = this.currentDate.getFullYear();
            
            document.getElementById('currentMonth').textContent = this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

            const monthlyData = this.calculateMonthlyStats();
            document.getElementById('mealsEaten').textContent = monthlyData.totalMeals;
            document.getElementById('totalDue').textContent = `₹${monthlyData.totalCost}`;
            document.getElementById('amountPaid').textContent = `₹${monthlyData.totalPaid}`;
            document.getElementById('balance').textContent = `₹${monthlyData.balance}`;
            
            this.renderCalendar();
        }

        renderCalendar() {
            const calendarEl = document.getElementById('calendar');
            calendarEl.innerHTML = ''; // Clear previous calendar

            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const today = new Date();
            
            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Monday

            // Add empty cells for days before the 1st of the month
            for (let i = 0; i < startDayOfWeek; i++) {
                calendarEl.innerHTML += `<div class="day-cell empty"></div>`;
            }

            // Add day cells for the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateString = date.toISOString().split('T')[0];
                const dayData = this.mealData[this.currentUser]?.[dateString];
                
                let classes = 'day-cell';
                let mealDots = '';
                
                if (dayData) {
                    if (dayData.lunch) mealDots += '<div class="meal-dot lunch"></div>';
                    if (dayData.dinner) mealDots += '<div class="meal-dot dinner"></div>';
                }
                
                if (date.toDateString() === today.toDateString()) {
                    classes += ' today';
                }

                calendarEl.innerHTML += `
                    <div class="${classes}" data-date="${date.toISOString()}">
                        <div class="day-number">${day}</div>
                        <div class="meal-dots">${mealDots}</div>
                    </div>`;
            }
        }
        
        navigateMonth(direction) {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
            this.updateDashboardView();
        }

        // --- DAY DETAIL VIEW --- //
        
        updateDayDetailView() {
            if (!this.selectedDate) return;
            
            document.getElementById('selectedDate').textContent = this.selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            const dateString = this.selectedDate.toISOString().split('T')[0];
            const dayData = this.mealData[this.currentUser]?.[dateString] || { lunch: false, dinner: false };
            
            const lunchToggle = document.getElementById('lunchToggle');
            const dinnerToggle = document.getElementById('dinnerToggle');

            lunchToggle.checked = dayData.lunch;
            dinnerToggle.checked = dayData.dinner;
            
            // Disable toggles if not admin or if date is in the future
            const isFutureDate = this.selectedDate > new Date();
            lunchToggle.disabled = !this.isAdmin || isFutureDate;
            dinnerToggle.disabled = !this.isAdmin || isFutureDate;

            document.getElementById('lunchToggleLabel').textContent = dayData.lunch ? "Eaten" : "Skipped";
            document.getElementById('dinnerToggleLabel').textContent = dayData.dinner ? "Eaten" : "Skipped";

            this.updateDaySummary();
        }

        updateMealStatus(mealType, status) {
            const dateString = this.selectedDate.toISOString().split('T')[0];

            if (!this.mealData[this.currentUser]) this.mealData[this.currentUser] = {};
            if (!this.mealData[this.currentUser][dateString]) this.mealData[this.currentUser][dateString] = { lunch: false, dinner: false };
            
            this.mealData[this.currentUser][dateString][mealType] = status;
            
            this.updateDayDetailView();
            this.updateDashboardView(); // Recalculate stats and re-render calendar
        }

        updateDaySummary() {
            const dateString = this.selectedDate.toISOString().split('T')[0];
            const dayData = this.mealData[this.currentUser]?.[dateString] || { lunch: false, dinner: false };
            const mealCount = (dayData.lunch ? 1 : 0) + (dayData.dinner ? 1 : 0);
            const cost = mealCount * this.mealRate;

            document.getElementById('dayMealCount').textContent = mealCount;
            document.getElementById('dayCost').textContent = `₹${cost}`;
        }

        // --- PAYMENT VIEW --- //

        updatePaymentView() {
            const paymentHistory = this.paymentData[this.currentUser] || [];
            const paymentListEl = document.getElementById('paymentList');
            
            paymentListEl.innerHTML = ''; // Clear list
            
            if (paymentHistory.length === 0) {
                paymentListEl.innerHTML = '<p class="no-payments">No payments recorded for this month.</p>';
                return;
            }

            paymentHistory.forEach(p => {
                paymentListEl.innerHTML += `
                    <div class="payment-item">
                        <span>${new Date(p.date).toLocaleDateString()}</span>
                        <strong>₹${p.amount}</strong>
                    </div>`;
            });

            // Set default date for new payment to today
            document.getElementById('paymentDate').valueAsDate = new Date();
        }

        recordPayment() {
            const amountInput = document.getElementById('paymentAmount');
            const dateInput = document.getElementById('paymentDate');
            const amount = parseInt(amountInput.value);
            const date = dateInput.value;

            if (!this.paymentData[this.currentUser]) this.paymentData[this.currentUser] = [];
            
            this.paymentData[this.currentUser].push({ amount, date });
            
            alert(`Payment of ₹${amount} recorded successfully!`);
            
            document.getElementById('paymentForm').reset();
            this.updatePaymentView();
            this.updateDashboardView(); // Update balance
        }

        // --- UTILITY FUNCTIONS --- //
        
        calculateMonthlyStats() {
            const userData = this.mealData[this.currentUser] || {};
            const userPayments = this.paymentData[this.currentUser] || [];
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            
            let totalMeals = 0;
            
            for (const date in userData) {
                const d = new Date(date);
                if (d.getFullYear() === year && d.getMonth() === month) {
                    if (userData[date].lunch) totalMeals++;
                    if (userData[date].dinner) totalMeals++;
                }
            }
            
            const totalPaid = userPayments.reduce((sum, p) => {
                 const d = new Date(p.date);
                 if (d.getFullYear() === year && d.getMonth() === month) {
                     return sum + p.amount;
                 }
                 return sum;
            }, 0);

            const totalCost = totalMeals * this.mealRate;
            const balance = totalCost - totalPaid;

            return { totalMeals, totalCost, totalPaid, balance };
        }

        showError(message, clear = false) {
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = message;
            if (clear || !message) {
                errorDiv.classList.add('hidden');
            } else {
                errorDiv.classList.remove('hidden');
            }
        }
    }

    window.app = new FoodServiceApp();
});
