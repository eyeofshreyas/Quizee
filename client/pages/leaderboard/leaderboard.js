// Simple interactivity for demonstration
document.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', () => {
        // Future interaction: Open detailed stats
        console.log('Row clicked');
    });
});
