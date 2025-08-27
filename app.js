document.addEventListener('DOMContentLoaded', () => {
    class FoodServiceApp {
        // ... (constructor and other methods from the previous version) ...
        
        init() {
            this.bindEvents();
            this.applyTheme(); // Apply saved theme on load
            this.startClock();
            this.initParticles(); // Initialize the background effect
        }

        bindEvents() {
            // ... (all previous event bindings) ...
            
            // Add new event binding for the theme toggle
            document.getElementById('themeToggle').addEventListener('change', (e) => this.toggleTheme(e.target.checked));
        }

        // --- NEW THEME & UI METHODS --- //

        toggleTheme(isDark) {
            if (isDark) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        }

        applyTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                document.getElementById('themeToggle').checked = true;
            } else {
                document.body.classList.remove('dark-mode');
                document.getElementById('themeToggle').checked = false;
            }
        }

        initParticles() {
            particlesJS('particles-js', {
              "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#888888" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": false }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#888888", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 4, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false } },
              "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } } },
              "retina_detect": true
            });
        }
        
        // --- OVERHAULED RENDER CALENDAR METHOD --- //

        renderCalendar() {
            const calEl = document.getElementById('calendar');
            calEl.innerHTML = ''; // Clear previous calendar

            // 1. Add day of the week headers
            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            daysOfWeek.forEach(day => {
                calEl.innerHTML += `<div class="calendar-day-header">${day}</div>`;
            });

            // 2. Generate calendar days
            const year = this.currentDate.getFullYear(), month = this.currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const startDay = (firstDay.getDay() + 6) % 7; // 0 = Monday

            for (let i = 0; i < startDay; i++) {
                calEl.innerHTML += `<div class="day-cell empty"></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateStr = date.toISOString().split('T')[0];
                const dayData = this.mealData[this.currentUser]?.[dateStr];
                
                let classes = 'day-cell';
                let dots = '';

                if (dayData) {
                    if (dayData.lunch) dots += '<div class="meal-dot lunch"></div>';
                    if (dayData.dinner) dots += '<div class="meal-dot dinner"></div>';
                }
                
                if (date.toDateString() === new Date().toDateString()) {
                    classes += ' today';
                }

                calEl.innerHTML += `
                    <div class="${classes}" data-date="${date.toISOString()}">
                        <div class="day-number">${day}</div>
                        <div class="meal-dots">${dots}</div>
                    </div>`;
            }
        }
        
        // ... (The rest of your app.js code remains the same)
    }

    window.app = new FoodServiceApp();
});
