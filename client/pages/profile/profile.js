requireAuth();
wireLogout('logoutLink');

// Simple Micro-interactions
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('scale-[1.01]');
    });
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('scale-[1.01]');
    });
});

// Toggle simulation for buttons
const tabs = document.querySelectorAll('nav button');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('bg-white', 'text-primary', 'shadow-sm');
            t.classList.add('text-secondary');
        });
        tab.classList.add('bg-white', 'text-primary', 'shadow-sm');
        tab.classList.remove('text-secondary');
    });
});
