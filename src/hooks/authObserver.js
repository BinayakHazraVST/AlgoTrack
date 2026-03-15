/**
 * Validates authentication state using Local Storage.
 * Redirects directly to the login interface if no user is found.
 */
export function initAuthObserver() {
    const activeUser = localStorage.getItem('algotrack_active_user');
    if (!activeUser) {
        // User is signed out, block access to Dashboard
        window.location.href = 'index.html';
    }
}
