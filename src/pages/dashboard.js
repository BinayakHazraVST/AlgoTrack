import { initAuthObserver } from '../hooks/authObserver.js';
import { getProblems, addProblem, updateProblem, deleteProblem, logActivity, getActivityLogs } from '../utils/storage.js';
import { calculateNextReview } from '../utils/algoMath.js';
import { createProblemCard } from '../components/problemCard.js';

// Ensure auth observer validates session
initAuthObserver();

document.addEventListener('DOMContentLoaded', () => {
    // Layout and Logic DOM bindings
    const form = document.getElementById('add-problem-form');
    const titleInput = document.getElementById('problem-title');
    const urlInput = document.getElementById('problem-url');
    const tagsInput = document.getElementById('problem-tags');
    const formHeading = document.getElementById('form-heading');
    const submitProblemBtn = document.getElementById('submit-problem-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // Output Container
    const grid = document.getElementById('problems-grid');
    
    // Interactions
    const searchInput = document.getElementById('search-input');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Incomplete Feature Buttons & Modals
    const exportBtn = document.getElementById('export-btn');
    const activityBtn = document.getElementById('activity-btn');
    const activityModal = document.getElementById('activity-modal');
    const closeActivityBtn = document.getElementById('close-activity-btn');
    const activityList = document.getElementById('activity-list');

    let currentProblems = getProblems();
    let editingProblemId = null;

    /**
     * Re-renders the problem cards in the UI
     */
    const renderProblems = (problemsList = currentProblems) => {
        // Sort: Items with the lowest (oldest) review timestamp show first
        const sorted = [...problemsList].sort((a, b) => a.nextReview - b.nextReview);
        
        if (sorted.length === 0) {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const imgSrc = isDarkMode ? './src/assets/images/dashboard_empty_dark.png' : './src/assets/images/dashboard_empty.png';
            
            grid.innerHTML = `
                <div class="empty-state slide-up">
                    <img src="${imgSrc}" alt="No tasks pending" class="empty-state-img" id="empty-state-graphic">
                    <h3 style="margin-top: 1.5rem; color: var(--clr-primary);">All Caught Up!</h3>
                    <p style="margin-top: 0.5rem; color: var(--clr-text-light);">No problems tracking currently. Start adding to build your algorithm muscle.</p>
                </div>
            `;
            return;
        }

        // Generate actual cards wrapped in slight delay staggered animation
        grid.innerHTML = sorted.map((problem, index) => {
            const html = createProblemCard(problem);
            // Injecting inline animation delay purely for the entrance effect
            return html.replace('problem-card"', `problem-card slide-up" style="animation-delay: ${index * 0.05}s;"`);
        }).join('');
    };

    // Initialize layout
    renderProblems();

    const resetForm = () => {
        editingProblemId = null;
        form.reset();
        if (formHeading) formHeading.textContent = 'Add New Problem';
        if (submitProblemBtn) submitProblemBtn.textContent = 'Add Problem';
        if (cancelEditBtn) cancelEditBtn.style.display = 'none';
        titleInput.focus();
    };

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetForm);
    }

    // Problem Submission Event
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const url = urlInput.value.trim();
        const tagsRaw = tagsInput.value;
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        if (!title) return;

        if (editingProblemId) {
            const problem = currentProblems.find(p => p.id === editingProblemId);
            if (problem) {
                problem.title = title;
                problem.url = url;
                problem.tags = tags;
                updateProblem(problem);
                logActivity(`Updated details for problem: "${title}"`);
            }
            resetForm();
        } else {
            const newProblem = {
                title,
                url,
                tags,
                step: 0,
                nextReview: calculateNextReview(0), // Initial due date
                createdAt: Date.now()
            };

            // Write to local storage
            addProblem(newProblem);
            
            // Record activity
            logActivity(`Started tracking new problem: "${title}"`);
            
            // Reset inputs focusing back to title
            resetForm();
        }
        
        // Refresh local state and UI
        currentProblems = getProblems();
        renderProblems();
    });

    // Event Delegation for buttons within dynamic cards
    grid.addEventListener('click', (e) => {
        const target = e.target;
        
        // Delete Action
        if (target.dataset.action === 'delete') {
            const id = target.dataset.id;
            const problem = currentProblems.find(p => p.id === id);
            
            if (confirm('Are you certain you want to remove this problem from tracking?')) {
                deleteProblem(id);
                if (problem) logActivity(`Deleted problem: "${problem.title}"`);
                
                currentProblems = getProblems();
                renderProblems();
            }
        }

        // Edit Action
        if (target.dataset.action === 'edit') {
            const id = target.dataset.id;
            const problem = currentProblems.find(p => p.id === id);
            if (problem) {
                editingProblemId = id;
                if (formHeading) formHeading.textContent = 'Edit Problem';
                titleInput.value = problem.title || '';
                urlInput.value = problem.url || '';
                tagsInput.value = problem.tags ? problem.tags.join(', ') : '';
                if (submitProblemBtn) submitProblemBtn.textContent = 'Update Problem';
                if (cancelEditBtn) cancelEditBtn.style.display = 'inline-flex';
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        
        // Mark as Reviewed Action
        if (target.dataset.action === 'review') {
            if (target.disabled) return;
            
            const id = target.dataset.id;
            const problem = currentProblems.find(p => p.id === id);
            
            if (problem) {
                // Defensive check to ensure we protect against tampering or direct DOM calls
                const reviewDay = new Date(problem.nextReview);
                reviewDay.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (reviewDay > today) {
                    alert('This problem is not yet due for review! Wait until ' + reviewDay.toLocaleDateString());
                    return;
                }
                
                // Progress spaced-repetition step
                problem.step += 1;
                // Generate next due date mathematically
                problem.nextReview = calculateNextReview(problem.step);
                updateProblem(problem);
                
                logActivity(`Completed a review for "${problem.title}" (Step ${problem.step})`);
                
                // Refresh local state and UI
                currentProblems = getProblems();
                renderProblems();
            }
        }
    });

    // Search and Filter Input handling
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        const filtered = currentProblems.filter(p => {
            const titleMatch = p.title.toLowerCase().includes(query);
            const tagMatch = p.tags.some(tag => tag.toLowerCase().includes(query));
            return titleMatch || tagMatch;
        });
        
        renderProblems(filtered);
    });

    // Local Storage Logout Trigger
    logoutBtn.addEventListener('click', () => {
        logActivity('Logged out');
        localStorage.removeItem('algotrack_active_user');
        window.location.href = 'index.html';
    });

    // Dark Mode Local Persistence Setting
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('algotrack_theme', isDark ? 'dark' : 'light');
        
        // Ensure empty state graphic swaps correctly without needing refresh
        if (currentProblems.length === 0) {
            renderProblems();
        }
    });

    // Restore Dark Mode on initialization
    if (localStorage.getItem('algotrack_theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Graceful Fallback implementations for upcoming buttons
    const triggerComingSoonAlert = (e) => {
        e.preventDefault();
        alert('Feature coming soon');
    };
    
    exportBtn.addEventListener('click', triggerComingSoonAlert);

    // --- Activity Log Modal Logic ---
    const formatTimeAgo = (timestamp) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const renderActivityList = () => {
        const logs = getActivityLogs();
        if (logs.length === 0) {
            activityList.innerHTML = '<p class="empty-state" style="padding: 2rem; min-height: auto;">No recent activity.</p>';
            return;
        }
        
        activityList.innerHTML = logs.map(log => `
            <div class="activity-item">
                <span class="activity-message">${log.message}</span>
                <span class="activity-time">${formatTimeAgo(log.timestamp)}</span>
            </div>
        `).join('');
    };

    activityBtn.addEventListener('click', (e) => {
        e.preventDefault();
        renderActivityList();
        activityModal.style.display = 'flex';
    });

    closeActivityBtn.addEventListener('click', () => {
        activityModal.style.display = 'none';
    });

    // Close on outside click
    activityModal.addEventListener('click', (e) => {
        if (e.target === activityModal) {
            activityModal.style.display = 'none';
        }
    });

    // Listen for cross-tab or current session log events to auto-refresh if open
    window.addEventListener('activityLogged', () => {
        if (activityModal.style.display === 'flex') {
            renderActivityList();
        }
    });
});
