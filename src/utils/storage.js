/**
 * Wrapper functions to Create, Read, Update, and Delete arrays of problem objects 
 * in localStorage strictly using JSON.stringify and JSON.parse.
 */

const getStorageKey = () => `algotrack_problems_${localStorage.getItem('algotrack_active_user') || 'guest'}`;

// Read
export const getProblems = () => {
    try {
        const data = localStorage.getItem(getStorageKey());
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to parse problems from local storage");
        return [];
    }
};

// Create
export const addProblem = (problem) => {
    const problems = getProblems();
    // Assign a unique ID using timestamp
    problem.id = Date.now().toString();
    problems.push(problem);
    localStorage.setItem(getStorageKey(), JSON.stringify(problems));
    return problem;
};

// Update
export const updateProblem = (updatedProblem) => {
    let problems = getProblems();
    problems = problems.map(prob => prob.id === updatedProblem.id ? updatedProblem : prob);
    localStorage.setItem(getStorageKey(), JSON.stringify(problems));
};

// Delete
export const deleteProblem = (id) => {
    let problems = getProblems();
    problems = problems.filter(prob => prob.id !== id);
    localStorage.setItem(getStorageKey(), JSON.stringify(problems));
};

// --- Activity Logging ---
const getActivityKey = () => `algotrack_activity_${localStorage.getItem('algotrack_active_user') || 'guest'}`;

export const getActivityLogs = () => {
    try {
        const data = localStorage.getItem(getActivityKey());
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

export const logActivity = (actionMessage) => {
    const logs = getActivityLogs();
    const newLog = {
        id: Date.now().toString(),
        message: actionMessage,
        timestamp: Date.now()
    };
    
    // Keep only the most recent 50 activities to prevent infinite growth
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    
    localStorage.setItem(getActivityKey(), JSON.stringify(logs));
    
    // Dispatch a custom event so UI can update immediately if needed
    window.dispatchEvent(new CustomEvent('activityLogged', { detail: newLog }));
};
