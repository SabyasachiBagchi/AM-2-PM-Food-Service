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
        
        // Initialize sample meal data
        this.mealData = {
            "John Doe": {
                "2025-08-27": { lunch: true, dinner: false },
                "2025-08-26": { lunch: true, dinner: true },
                "2025-08-25": { lunch: false, dinner: true },
                "2025-08-24": { lunch: true, dinner: false },
                "2025-08-23": { lunch: false, dinner: false },
                "2025-08-22": { lunch: true, dinner: true },
                "2025-08-21": { lunch: true, dinner: true }
            },
            "Jane Smith": {
                "2025-08-27": { lunch: false, dinner: true },
                "2025-08-26": { lunch: true, dinner: true },
                "2025-08-25": { lunch: true, dinner: false },
                "2025-08-24": { lunch: false, dinner: true },
                "2025-08-23": { lunch: true, dinner: false },
                "2025-08-22": { lunch: true, dinner: true },
                "2025-08-21": { lunch: false, dinner: false }
            },
            "Mike Johnson": {
                "2025-08-27": { lunch: true, dinner: true },
                "2025-08-26": { lunch: false, dinner: true },
                "2025-08-25": { lunch: true, dinner: true },
                "2025-08-24": { lunch: true, dinner: false },
                "2025-08-23": { lunch: true, dinner: true }
            },
            "Sarah Wilson": {
                "2025-08-27": { lunch: false, dinner: false },
                "2025-08-26": { lunch: true, dinner: false },
                "2025-08-25": { lunch: false, dinner: true },
                "2025-08-24": { lunch: true, dinner: true },
                "2025-08-23": { lunch: false, dinner: false }
            }
        };
        
        // Initialize sample payment data
        this.paymentData = {
            "John Doe": [
                { amount: 1500, date: "2025-08-01", month: "August 2025" }
            ],
            "Jane Smith": [
                { amount: 2700, date: "2025-08-01", month: "August 2025" }
            ],
            "Mike Johnson": [
                { amount: 1000, date: "2025-08-05", month: "August 2025" }
            ],
            "Sarah Wilson": [
                { amount: 800, date: "2025-08-10", month: "August 2025" }
            ]
        };
    }
    
    init() {
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
    }
    
    setupApp() {
        console.log('Setting up app...');
        this.bindEvents();
        this.showLoginModal();
    }
    
    bindEvents() {
        console.log('Binding events...');
        
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('Login form found, binding submit event');
            loginForm.addEventListener('submit', (e) => {
                console.log('Login form submitted');
                this.handleLogin(e);
            });
        } else {
            console.error('Login form not found!');
        }
        
        // View Only button
        const viewOnlyBtn = document.getElementById('viewOnlyBtn');
        if (viewOnlyBtn) {
            console.log('View Only button found, binding click event');
            viewOnlyBtn.addEventListener('click', (e) => {
                console.log('View Only button clicked');
                e.preventDefault();
                this.handleViewOnly();
            });
        } else {
            console.error('View Only button not found!');
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // User selection
        const userSelect = document.getElementById('userSelect');
        if (userSelect) {
            userSelect.addEventListener('change', (e) => this.handleUserChange(e));
        }
        
        // Navigation events
        const backToCalendar = document.getElementById('backToCalendar');
        if (backToCalendar) {
            backToCalendar.addEventListener('click', () => this.showDashboard());
        }
        
        const backToCalendarFromPayment = document.getElementById('backToCalendarFromPayment');
        if (backToCalendarFromPayment) {
            backToCalendarFromPayment.addEventListener('click', () => this.showDashboard());
        }
        
        // Month navigation
        const prevMonth = document.getElementById('prevMonth');
        if (prevMonth) {
            prevMonth.addEventListener('click', () => this.changeMonth(-1));
        }
        
        const nextMonth = document.getElementById('nextMonth');
        if (nextMonth) {
            nextMonth.addEventListener('click', () => this.changeMonth(1));
        }
        
        // Meal toggles
        const lunchToggle = document.getElementById('lunchToggle');
        if (lunchToggle) {
            lunchToggle.addEventListener('change', (e) => this.handleMealToggle(e, 'lunch'));
        }
        
        const dinnerToggle = document.getElementById('dinnerToggle');
        if (dinnerToggle) {
            dinnerToggle.addEventListener('change', (e) => this.handleMealToggle(e, 'dinner'));
        }
        
        // Payment form
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handlePaymentSubmit(e));
        }
        
        // FAB events
        const fabBtn = document.getElementById('fabBtn');
        if (fabBtn) {
            fabBtn.addEventListener('click', () => this.toggleFabMenu());
        }
        
        const addPaymentBtn = document.getElementById('addPaymentBtn');
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => this.showPaymentView());
        }
        
        // Global click handler for FAB menu
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fab')) {
                this.closeFabMenu();
            }
        });
    }
    
    showLoginModal() {
        console.log('Showing login modal...');
        const loginModal = document.getElementById('loginModal');
        const app = document.getElementById('app');
        
        if (loginModal) {
            loginModal.classList.remove('hidden');
            console.log('Login modal shown');
        } else {
            console.error('Login modal not found!');
        }
        
        if (app) {
            app.classList.add('hidden');
        }
    }
    
    hideLoginModal() {
        console.log('Hiding login modal...');
        const loginModal = document.getElementById('loginModal');
        const app = document.getElementById('app');
        
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        
        if (app) {
            app.classList.remove('hidden');
        }
        
        this.showLoadingSpinner();
        setTimeout(() => {
            this.hideLoadingSpinner();
            this.initializeApp();
        }, 1000);
    }
    
    handleLogin(e) {
        console.log('Handle login called');
        e.preventDefault();
        
        const usernameEl = document.getElementById('username');
        const passwordEl = document.getElementById('password');
        
        if (!usernameEl || !passwordEl) {
            console.error('Username or password field not found!');
            return;
        }
        
        const username = usernameEl.value.trim();
        const password = passwordEl.value.trim();
        
        console.log('Login attempt with:', username, password.length > 0 ? '[password entered]' : '[no password]');
        
        if (username === 'admin' && password === 'admin123') {
            console.log('Valid admin credentials, logging in...');
            this.isAdmin = true;
            const currentUserElement = document.getElementById('currentUser');
            if (currentUserElement) {
                currentUserElement.textContent = 'Admin';
            }
            this.hideLoginModal();
            this.showSuccess('Welcome Admin!');
        } else if (username === '' || password === '') {
            console.log('Empty credentials');
            this.showError('Please enter username and password');
        } else {
            console.log('Invalid credentials');
            this.showError('Invalid credentials. Use admin/admin123 for admin access.');
        }
    }
    
    handleViewOnly() {
        console.log('Handle view only called');
        this.isAdmin = false;
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement) {
            currentUserElement.textContent = 'View Only';
        }
        this.hideLoginModal();
        this.showSuccess('Entered view-only mode');
    }
    
    logout() {
        console.log('Logging out...');
        this.isAdmin = false;
        this.currentUser = '';
        
        // Clear form fields
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        const userSelect = document.getElementById('userSelect');
        
        if (username) username.value = '';
        if (password) password.value = '';
        if (userSelect) userSelect.value = '';
        
        this.showLoginModal();
    }
    
    initializeApp() {
        console.log('Initializing app components...');
        this.populateUserSelector();
        this.updateCurrentMonth();
        this.updateFABVisibility();
        this.showDashboard();
        this.showSuccess('Application initialized successfully!');
    }
    
    populateUserSelector() {
        const select = document.getElementById('userSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select User</option>';
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            select.appendChild(option);
        });
        console.log('User selector populated with', this.users.length, 'users');
    }
    
    handleUserChange(e) {
        this.currentUser = e.target.value;
        console.log('User changed to:', this.currentUser);
        if (this.currentUser) {
            this.updateDashboard();
            this.generateCalendar();
            this.updateFABVisibility();
            this.showSuccess(`Switched to ${this.currentUser}'s data`);
        }
    }
    
    showDashboard() {
        console.log('Showing dashboard...');
        this.currentView = 'dashboard';
        this.hideAllViews();
        const dashboardView = document.getElementById('dashboardView');
        if (dashboardView) {
            dashboardView.classList.remove('hidden');
        }
        this.updateDashboard();
        this.generateCalendar();
        this.updateFABVisibility();
    }
    
    showDayDetail(date) {
        console.log('Showing day detail for:', date);
        this.currentView = 'dayDetail';
        this.selectedDate = new Date(date);
        this.hideAllViews();
        const dayDetailView = document.getElementById('dayDetailView');
        if (dayDetailView) {
            dayDetailView.classList.remove('hidden');
        }
        this.updateDayDetail();
        this.updateFABVisibility();
    }
    
    showPaymentView() {
        if (!this.isAdmin) {
            this.showError('Admin access required for payment management.');
            return;
        }
        console.log('Showing payment view...');
        this.currentView = 'payment';
        this.hideAllViews();
        const paymentView = document.getElementById('paymentView');
        if (paymentView) {
            paymentView.classList.remove('hidden');
        }
        this.updatePaymentView();
        this.closeFabMenu();
        this.updateFABVisibility();
    }
    
    hideAllViews() {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });
    }
    
    updateCurrentMonth() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthText = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        const currentMonthElement = document.getElementById('currentMonth');
        if (currentMonthElement) {
            currentMonthElement.textContent = monthText;
        }
    }
    
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateCurrentMonth();
        this.updateDashboard();
        this.generateCalendar();
    }
    
    updateDashboard() {
        if (!this.currentUser) {
            this.resetStats();
            return;
        }
        
        const stats = this.calculateMonthlyStats();
        console.log('Dashboard stats:', stats);
        
        const mealsEatenElement = document.getElementById('mealsEaten');
        const totalDueElement = document.getElementById('totalDue');
        const amountPaidElement = document.getElementById('amountPaid');
        const balanceElement = document.getElementById('balance');
        
        if (mealsEatenElement) mealsEatenElement.textContent = stats.mealsEaten;
        if (totalDueElement) totalDueElement.textContent = `₹${stats.totalDue}`;
        if (amountPaidElement) amountPaidElement.textContent = `₹${stats.amountPaid}`;
        if (balanceElement) {
            balanceElement.textContent = `₹${stats.balance}`;
            balanceElement.style.color = stats.balance >= 0 ? 'var(--color-success)' : 'var(--color-error)';
        }
    }
    
    calculateMonthlyStats() {
        const userData = this.mealData[this.currentUser] || {};
        const payments = this.paymentData[this.currentUser] || [];
        
        let mealsEaten = 0;
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        // Count meals for current month
        Object.keys(userData).forEach(dateStr => {
            const date = new Date(dateStr);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                const meals = userData[dateStr];
                if (meals.lunch) mealsEaten++;
                if (meals.dinner) mealsEaten++;
            }
        });
        
        const totalDue = mealsEaten * this.mealRate;
        
        // Calculate total payments for current month
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthStr = `${monthNames[currentMonth]} ${currentYear}`;
        
        const amountPaid = payments
            .filter(payment => payment.month === currentMonthStr)
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        const balance = amountPaid - totalDue;
        
        return { mealsEaten, totalDue, amountPaid, balance };
    }
    
    resetStats() {
        const elements = {
            mealsEaten: document.getElementById('mealsEaten'),
            totalDue: document.getElementById('totalDue'),
            amountPaid: document.getElementById('amountPaid'),
            balance: document.getElementById('balance')
        };
        
        if (elements.mealsEaten) elements.mealsEaten.textContent = '0';
        if (elements.totalDue) elements.totalDue.textContent = '₹0';
        if (elements.amountPaid) elements.amountPaid.textContent = '₹0';
        if (elements.balance) elements.balance.textContent = '₹0';
    }
    
    generateCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;
        
        calendar.innerHTML = '';
        
        if (!this.currentUser) {
            const noUserMsg = document.createElement('div');
            noUserMsg.textContent = 'Please select a user to view calendar';
            noUserMsg.style.gridColumn = '1 / -1';
            noUserMsg.style.textAlign = 'center';
            noUserMsg.style.padding = 'var(--space-24)';
            noUserMsg.style.color = 'var(--color-text-secondary)';
            calendar.appendChild(noUserMsg);
            return;
        }
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.style.textAlign = 'center';
            header.style.fontWeight = 'var(--font-weight-medium)';
            header.style.padding = 'var(--space-8)';
            header.style.color = 'var(--color-text-secondary)';
            calendar.appendChild(header);
        });
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const today = new Date();
        const userData = this.mealData[this.currentUser] || {};
        
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.setAttribute('tabindex', '0');
            dayCell.setAttribute('role', 'button');
            dayCell.setAttribute('aria-label', `View meals for ${cellDate.toLocaleDateString()}`);
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = cellDate.getDate();
            
            // Check if it's today
            if (cellDate.toDateString() === today.toDateString()) {
                dayCell.classList.add('today');
            }
            
            // Check if it's in current month
            if (cellDate.getMonth() !== month) {
                dayCell.style.opacity = '0.3';
            }
            
            // Add meal indicators
            const dateStr = this.formatDate(cellDate);
            const meals = userData[dateStr];
            if (meals) {
                const mealsDiv = document.createElement('div');
                mealsDiv.className = 'calendar-day-meals';
                
                if (meals.lunch) {
                    const lunchIndicator = document.createElement('div');
                    lunchIndicator.className = 'meal-indicator lunch';
                    mealsDiv.appendChild(lunchIndicator);
                }
                
                if (meals.dinner) {
                    const dinnerIndicator = document.createElement('div');
                    dinnerIndicator.className = 'meal-indicator dinner';
                    mealsDiv.appendChild(dinnerIndicator);
                }
                
                dayCell.appendChild(dayNumber);
                dayCell.appendChild(mealsDiv);
                dayCell.classList.add('has-meals');
            } else {
                dayCell.appendChild(dayNumber);
            }
            
            // Add click handler
            dayCell.addEventListener('click', () => {
                if (cellDate.getMonth() === month) {
                    this.showDayDetail(cellDate);
                }
            });
            
            // Add keyboard handler
            dayCell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (cellDate.getMonth() === month) {
                        this.showDayDetail(cellDate);
                    }
                }
            });
            
            calendar.appendChild(dayCell);
        }
        
        console.log('Calendar generated for', this.currentUser);
    }
    
    updateDayDetail() {
        const dateStr = this.formatDate(this.selectedDate);
        const selectedDateElement = document.getElementById('selectedDate');
        if (selectedDateElement) {
            selectedDateElement.textContent = this.selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        const userData = this.mealData[this.currentUser] || {};
        const meals = userData[dateStr] || { lunch: false, dinner: false };
        
        const lunchToggle = document.getElementById('lunchToggle');
        const dinnerToggle = document.getElementById('dinnerToggle');
        
        if (lunchToggle) {
            lunchToggle.checked = meals.lunch;
            lunchToggle.disabled = !this.isAdmin;
        }
        
        if (dinnerToggle) {
            dinnerToggle.checked = meals.dinner;
            dinnerToggle.disabled = !this.isAdmin;
        }
        
        this.updateDaySummary();
    }
    
    handleMealToggle(e, mealType) {
        if (!this.isAdmin) {
            e.preventDefault();
            this.showError('Admin access required to modify meal data.');
            return;
        }
        
        const dateStr = this.formatDate(this.selectedDate);
        
        if (!this.mealData[this.currentUser]) {
            this.mealData[this.currentUser] = {};
        }
        
        if (!this.mealData[this.currentUser][dateStr]) {
            this.mealData[this.currentUser][dateStr] = { lunch: false, dinner: false };
        }
        
        this.mealData[this.currentUser][dateStr][mealType] = e.target.checked;
        this.updateDaySummary();
        
        // Update dashboard stats if viewing current month
        if (this.selectedDate.getMonth() === this.currentDate.getMonth() && 
            this.selectedDate.getFullYear() === this.currentDate.getFullYear()) {
            this.updateDashboard();
        }
        
        // Show success message
        const mealName = mealType.charAt(0).toUpperCase() + mealType.slice(1);
        const action = e.target.checked ? 'marked as eaten' : 'unmarked';
        this.showSuccess(`${mealName} ${action} successfully!`);
    }
    
    updateDaySummary() {
        const dateStr = this.formatDate(this.selectedDate);
        const userData = this.mealData[this.currentUser] || {};
        const meals = userData[dateStr] || { lunch: false, dinner: false };
        
        let mealCount = 0;
        if (meals.lunch) mealCount++;
        if (meals.dinner) mealCount++;
        
        const dayCost = mealCount * this.mealRate;
        
        const dayMealCountElement = document.getElementById('dayMealCount');
        const dayCostElement = document.getElementById('dayCost');
        
        if (dayMealCountElement) dayMealCountElement.textContent = mealCount;
        if (dayCostElement) dayCostElement.textContent = `₹${dayCost}`;
    }
    
    updatePaymentView() {
        const form = document.getElementById('paymentForm');
        if (form) form.reset();
        
        // Set default date to today
        const paymentDate = document.getElementById('paymentDate');
        if (paymentDate) {
            paymentDate.value = new Date().toISOString().split('T')[0];
        }
        
        this.updatePaymentList();
    }
    
    handlePaymentSubmit(e) {
        e.preventDefault();
        
        if (!this.isAdmin) {
            this.showError('Admin access required for payment management.');
            return;
        }
        
        if (!this.currentUser) {
            this.showError('Please select a user first.');
            return;
        }
        
        const amountElement = document.getElementById('paymentAmount');
        const dateElement = document.getElementById('paymentDate');
        
        if (!amountElement || !dateElement) return;
        
        const amount = parseInt(amountElement.value);
        const date = dateElement.value;
        
        if (!amount || !date) {
            this.showError('Please fill in all fields.');
            return;
        }
        
        const paymentDate = new Date(date);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const month = `${monthNames[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
        
        if (!this.paymentData[this.currentUser]) {
            this.paymentData[this.currentUser] = [];
        }
        
        this.paymentData[this.currentUser].push({
            amount: amount,
            date: date,
            month: month
        });
        
        this.showSuccess('Payment recorded successfully!');
        this.updatePaymentList();
        this.updateDashboard();
        
        // Reset form
        const form = document.getElementById('paymentForm');
        if (form) form.reset();
        if (dateElement) dateElement.value = new Date().toISOString().split('T')[0];
    }
    
    updatePaymentList() {
        const list = document.getElementById('paymentList');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (!this.currentUser) {
            const noUserMsg = document.createElement('div');
            noUserMsg.textContent = 'Please select a user to view payments';
            noUserMsg.style.textAlign = 'center';
            noUserMsg.style.padding = 'var(--space-24)';
            noUserMsg.style.color = 'var(--color-text-secondary)';
            list.appendChild(noUserMsg);
            return;
        }
        
        const payments = this.paymentData[this.currentUser] || [];
        
        if (payments.length === 0) {
            const noPayments = document.createElement('div');
            noPayments.textContent = 'No payments recorded yet';
            noPayments.style.textAlign = 'center';
            noPayments.style.padding = 'var(--space-24)';
            noPayments.style.color = 'var(--color-text-secondary)';
            list.appendChild(noPayments);
            return;
        }
        
        // Sort payments by date (most recent first)
        payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        payments.forEach(payment => {
            const item = document.createElement('div');
            item.className = 'payment-item';
            
            const info = document.createElement('div');
            info.className = 'payment-item-info';
            
            const date = document.createElement('div');
            date.className = 'payment-item-date';
            date.textContent = new Date(payment.date).toLocaleDateString();
            
            const month = document.createElement('div');
            month.textContent = `For ${payment.month}`;
            month.style.fontSize = 'var(--font-size-xs)';
            month.style.color = 'var(--color-text-secondary)';
            
            info.appendChild(date);
            info.appendChild(month);
            
            const amount = document.createElement('div');
            amount.className = 'payment-item-amount';
            amount.textContent = `₹${payment.amount}`;
            
            item.appendChild(info);
            item.appendChild(amount);
            list.appendChild(item);
        });
    }
    
    updateFABVisibility() {
        const fab = document.getElementById('fab');
        if (!fab) return;
        
        if (this.isAdmin && this.currentView !== 'payment' && this.currentUser) {
            fab.classList.remove('hidden');
        } else {
            fab.classList.add('hidden');
        }
    }
    
    toggleFabMenu() {
        const menu = document.getElementById('fabMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }
    
    closeFabMenu() {
        const menu = document.getElementById('fabMenu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    showLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.remove('hidden');
    }
    
    hideLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.add('hidden');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = type === 'error' ? 'var(--color-error)' : 'var(--color-success)';
        notification.style.color = 'white';
        notification.style.padding = 'var(--space-16)';
        notification.style.borderRadius = 'var(--radius-base)';
        notification.style.boxShadow = 'var(--shadow-lg)';
        notification.style.zIndex = '3000';
        notification.style.animation = 'slideInDown 0.3s var(--ease-standard)';
        notification.style.maxWidth = '300px';
        notification.style.wordWrap = 'break-word';
        
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        notification.innerHTML = `<i class="${icon}"></i> ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInUp 0.3s var(--ease-standard) reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    const app = new FoodServiceApp();
    app.init();
    
    // Make app globally accessible for debugging
    window.foodServiceApp = app;
});