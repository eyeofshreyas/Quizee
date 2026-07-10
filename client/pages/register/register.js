function passwordsMatch(password, confirmPassword) {
    return password.length > 0 && password === confirmPassword;
}

function wireToggle(buttonId, inputId) {
    const toggle = document.getElementById(buttonId);
    const input = document.getElementById(inputId);
    if (!toggle || !input) return;
    toggle.addEventListener('click', function () {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        this.querySelector('.material-symbols-outlined').innerText = isPassword ? 'visibility_off' : 'visibility';
    });
}

if (typeof document !== 'undefined') {
document.addEventListener('DOMContentLoaded', () => {
    wireToggle('togglePassword', 'password');
    wireToggle('toggleConfirmPassword', 'confirmPassword');

    const form = document.getElementById('registerForm');
    const passwordError = document.getElementById('passwordError');
    const registerError = document.getElementById('registerError');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerError.classList.add('hidden');

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (!passwordsMatch(password, confirmPassword)) {
                passwordError.classList.remove('hidden');
                return;
            }
            passwordError.classList.add('hidden');

            try {
                const { user, token } = await apiRequest('/auth/register', { method: 'POST', body: { username, email, password } });
                saveSession(user, token);
                window.location.href = '../dashboard/dashboard.html';
            } catch (err) {
                registerError.textContent = err.message;
                registerError.classList.remove('hidden');
            }
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
}

if (typeof module !== 'undefined' && require.main === module) {
    const assert = require('assert');
    assert.strictEqual(passwordsMatch('secret1', 'secret1'), true);
    assert.strictEqual(passwordsMatch('secret1', 'secret2'), false);
    assert.strictEqual(passwordsMatch('', ''), false);
    console.log('register.js self-check passed');
}
