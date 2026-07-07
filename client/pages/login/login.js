document.addEventListener('DOMContentLoaded', () => {
    const passwordToggle = document.getElementById('togglePassword');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function () {
            const input = document.getElementById('password');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.querySelector('.material-symbols-outlined').innerText = isPassword ? 'visibility_off' : 'visibility';
        });
    }

    // Simple hover effect for illustration
    const illust = document.querySelector('.floating-element');
    if (illust) {
        illust.addEventListener('mousemove', (e) => {
            const rect = illust.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            illust.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-10px)`;
        });

        illust.addEventListener('mouseleave', () => {
            illust.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)`;
        });
    }
});
