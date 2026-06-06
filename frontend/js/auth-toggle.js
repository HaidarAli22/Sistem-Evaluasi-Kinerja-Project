// Toggle password visibility for login form
export function initPasswordToggle() {
    const toggle = document.getElementById('togglePasswordLogin');
    const input = document.getElementById('password');
    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = '⊘';
            toggle.setAttribute('aria-pressed', 'true');
        } else {
            input.type = 'password';
            toggle.textContent = '◉';
            toggle.setAttribute('aria-pressed', 'false');
        }
    });
}

// Toggle password visibility for register form
export function initRegisterPasswordToggle() {
    const toggle = document.getElementById('togglePasswordRegister');
    const input = document.getElementById('regPassword');
    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = '⊘';
            toggle.setAttribute('aria-pressed', 'true');
        } else {
            input.type = 'password';
            toggle.textContent = '◉';
            toggle.setAttribute('aria-pressed', 'false');
        }
    });
}
