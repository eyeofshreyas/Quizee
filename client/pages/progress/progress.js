requireAuth();

// Micro-interactions and data visualization animation
document.addEventListener('DOMContentLoaded', () => {
    const radarArea = document.querySelector('.radar-area');
    if (radarArea) {
        radarArea.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        radarArea.style.opacity = '0';
        radarArea.style.transform = 'scale(0.5)';
        radarArea.style.transformOrigin = 'center';

        setTimeout(() => {
            radarArea.style.opacity = '1';
            radarArea.style.transform = 'scale(1)';
        }, 300);
    }

    // Simple parallax on cards on mouse move
    const cards = document.querySelectorAll('.glass-effect');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });
});
