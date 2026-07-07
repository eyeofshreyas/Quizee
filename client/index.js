// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
    });
}, { threshold: 0.1 });

// Add initial states to elements
document.querySelectorAll('.glass-card').forEach(card => {
    card.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
    observer.observe(card);
});
