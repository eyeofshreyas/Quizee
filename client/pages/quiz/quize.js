// Simple timer logic
let time = 45 * 60 + 12;
const timerElement = document.querySelector('[data-icon="timer"]').parentElement;

setInterval(() => {
    time--;
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    timerElement.innerHTML = `<span class="material-symbols-outlined text-sm" data-icon="timer">timer</span> ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} remaining`;
}, 1000);

// Choice selection logic
const choices = document.querySelectorAll('.choice-card');
choices.forEach(choice => {
    choice.addEventListener('click', () => {
        choices.forEach(c => {
            c.classList.remove('border-primary', 'bg-primary/5');
            c.querySelector('div').classList.remove('border-primary', 'bg-primary/5', 'text-primary');
        });
        choice.classList.add('border-primary', 'bg-primary/5');
        choice.querySelector('div').classList.add('border-primary', 'bg-primary/5', 'text-primary');
    });
});
