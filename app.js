document.addEventListener('DOMContentLoaded', () => {
    class FoodServiceApp {
        constructor() {
            // State
            this.isAdmin = false;
            this.currentUser = ''; // The user whose data is being viewed/edited
            this.loggedInUser = ''; // The user who is logged in
            this.currentDate = new Date();
            this.selectedDate = null;
            this.editingPaymentId = null;

            // Data
            this.users = ["Abid Hossain", "Ahsan Ansari"];
            this.mealRate = 45;
            this.mealData = { "Abid Hossain": { "2025-08-27": { lunch: true, dinner: true } }, "Ahsan Ansari": { "2025-08-26": { lunch: true, dinner: true } } };
            this.paymentData = { "Abid Hossain": [{ id: Date.now(), amount: 1500, date: "2025-08-01" }] };
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.applyTheme(); // Apply saved theme on load
            this.startClock();
            this.initParticles();
        }

        bindEvents() {
            document.getElementById('loginForm').addEventListener('submit', e => { e.preventDefault(); this.handleLogin(); });
            document.getElementById('viewOnlyBtn').addEventListener('click', () => this.handleViewOnly());
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
            document.getElementById('userSelect').addEventListener('change', e => { this.currentUser = e.target.value; this.renderDashboard(); });
            document.getElementById('themeToggle').addEventListener('change', e => this.toggleTheme(e.target.checked));
        }
        
        // --- THEME, CLOCK, & PARTICLE METHODS --- //
        toggleTheme(isDark) {
            document.body.classList.toggle('dark-mode', isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
        applyTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            this.toggleTheme(savedTheme === 'dark');
            document.getElementById('themeToggle').checked = (savedTheme === 'dark');
        }
        startClock() {
            const update = () => {
                const now = new Date();
                document.getElementById('clock-time').textContent = now.toLocaleTimeString();
                document.getElementById('clock-date').textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            };
            update(); setInterval(update, 1000);
        }
        initParticles() {
            particlesJS('particles-js', {"particles":{"number":{"value":60,"density":{"enable":true,"value_area":800}},"color":{"value":"#888888"},"shape":{"type":"circle"},"opacity":{"value":0.5,"random":true},"size":{"value":3,"random":true},"line_linked":{"enable":true,"distance":150,"color":"#888888","opacity":0.4,"width":1},"move":{"enable":true,"speed":4,"direction":"none","random":true,"straight":false,"out_mode":"out","bounce":false}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":true,"mode":"repulse"},"onclick":{"enable":true,"mode":"push"},"resize":true},"modes":{"repulse":{"distance":100,"duration":0.4},"push":{"particles_nb":4}}},"retina_detect":true});
        }
        
        // --- LOGIN & APP SETUP --- //
        handleLogin() {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            if (user === 'AbidHossain' && pass === 'Abid@786') { this.loggedInUser = 'Abid Hossain'; this.showApp(true); }
            else if (user === 'AhsanAnsari' && pass === 'Ahsan@786') { this.loggedInUser = 'Ahsan Ansari'; this.showApp(true); }
            else { /* Handle error */ }
        }
        handleViewOnly() { this.loggedInUser = 'View Only'; this.showApp(false); }
        showApp(isAdmin) {
            this.isAdmin = isAdmin;
            this.currentUser = this.isAdmin ? this.loggedInUser : this.users[0];
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('app').classList.remove('hidden');
            document.getElementById('currentUser').textContent = `Logged in: ${this.loggedInUser}`;
            
            const select = document.getElementById('userSelect');
            select.innerHTML = this.users.map(u => `<option value="${u}" ${u === this.currentUser ? 'selected' : ''}>${u}</option>`).join('');
            select.disabled = !this.isAdmin && !this.loggedInUser === 'View Only';
            
            this.renderDashboard();
        }
        logout() { location.reload(); }

        // --- CALENDAR & VIEW RENDERING --- //
        renderDashboard() {
            const main = document.querySelector('.main-content');
            main.innerHTML = `
                <div class="dashboard-header"><h1>Monthly Overview</h1></div>
                <div class="calendar-section">
                    <div class="calendar-header"><h2>Meal Calendar</h2></div>
                    <div id="calendar" class="calendar-grid"></div>
                </div>`;
            this.renderCalendar();
        }
        renderCalendar() {
            const calEl = document.getElementById('calendar');
            calEl.innerHTML = ''; // Clear
            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            daysOfWeek.forEach(day => calEl.innerHTML += `<div class="calendar-day-header">${day}</div>`);

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
                calEl.innerHTML += `<div class="${classes}" data-date="${dateStr}"><div class="day-number">${day}</div><div class="meal-dots">${dots}</div></div>`;
            }
        }
    }

    window.app = new FoodServiceApp();
});
