document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        // Subtle reactive behavior logic could go here
    });
});

// Dynamic date in dashboard header
const now = new Date();
const hour = now.getHours();
const headerText = document.querySelector('h1.text-headline-lg');
if (hour < 12) headerText.innerText = "Good morning, Shreyas";
else if (hour < 18) headerText.innerText = "Good afternoon, Shreyas";
else headerText.innerText = "Good evening, Shreyas";
