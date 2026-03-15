import { logActivity } from '../utils/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const authError = document.getElementById('auth-error');
    const demoLoginBtn = document.getElementById('demo-login-btn');
    const loginBtn = document.getElementById('login-btn');
    const toggleAuthMode = document.createElement('div');
    
    // Add toggle to UI
    toggleAuthMode.innerHTML = `<span id="toggle-auth-mode" style="cursor: pointer; color: var(--clr-secondary); font-size: 0.9rem; font-weight: 500; display: block; text-align: center; margin-top: 1rem;">Don't have an account? Sign up</span>`;
    loginForm.appendChild(toggleAuthMode);
    
    const toggleBtn = toggleAuthMode.querySelector('#toggle-auth-mode');
    let isSignupMode = false;

    // Simple hash function to encrypt the password minimally
    const hashPassword = (password) => {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; 
        }
        return btoa(hash.toString(16)); // minimal encoding
    };

    toggleBtn.addEventListener('click', () => {
        isSignupMode = !isSignupMode;
        if (isSignupMode) {
            loginBtn.textContent = 'Sign up';
            toggleBtn.textContent = 'Already have an account? Login';
        } else {
            loginBtn.textContent = 'Login';
            toggleBtn.textContent = "Don't have an account? Sign up";
        }
        authError.textContent = '';
        emailError.textContent = '';
    });

    // Email validation regex for better UX
    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleAuth = (e) => {
        if (e) e.preventDefault();
        
        // Clear old errors
        emailError.textContent = '';
        authError.textContent = '';
        
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        // Custom Error Handling Constraint: "Please enter a valid email address"
        if (!isValidEmail(email)) {
            emailError.textContent = "Please enter a valid email address";
            return;
        }

        const users = JSON.parse(localStorage.getItem('algotrack_users') || '[]');
        const hashedPassword = hashPassword(password);
        
        if (isSignupMode) {
            const userExists = users.find(u => u.email === email);
            if (userExists) {
                authError.textContent = 'Account with this email already exists';
                return;
            }
            
            const newUser = { email, password: hashedPassword };
            users.push(newUser);
            localStorage.setItem('algotrack_users', JSON.stringify(users));
            
            // Auto login after signup
            localStorage.setItem('algotrack_active_user', email);
            logActivity('Created a new account and logged in');
            window.location.href = 'dashboard.html';
        } else {
            const user = users.find(u => u.email === email && u.password === hashedPassword);
            if (user) {
                localStorage.setItem('algotrack_active_user', email);
                logActivity('Logged into the dashboard');
                window.location.href = 'dashboard.html';
            } else {
                authError.textContent = "Invalid email or password";
            }
        }
    };

    loginForm.addEventListener('submit', handleAuth);

    // Ensure Demo user exists
    const setupDemoUser = () => {
        const users = JSON.parse(localStorage.getItem('algotrack_users') || '[]');
        const demoEmail = 'demo@test.com';
        if (!users.find(u => u.email === demoEmail)) {
            users.push({ email: demoEmail, password: hashPassword('demo123') });
            localStorage.setItem('algotrack_users', JSON.stringify(users));
        }
    };
    setupDemoUser();

    // Quick-Fill Demo Setup button
    demoLoginBtn.addEventListener('click', () => {
        isSignupMode = false;
        loginBtn.textContent = 'Login';
        toggleBtn.textContent = "Don't have an account? Sign up";
        emailInput.value = 'demo@test.com';
        passwordInput.value = 'demo123';
        // Auto-trigger the login sequence
        handleAuth();
    });
});