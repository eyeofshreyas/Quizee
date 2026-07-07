// Micro-interaction: Smooth hover elevation for cards
document.querySelectorAll('.bg-surface-container-lowest.border').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});
