/**
 * Takes a problem object and returns an HTML string for the UI card.
 */
export const createProblemCard = (problem) => {
    const nextReviewDate = new Date(problem.nextReview);
    const today = new Date();
    // Normalize today to start of day for accurate 'isDue' calculation
    today.setHours(0, 0, 0, 0);
    const reviewDay = new Date(nextReviewDate);
    reviewDay.setHours(0, 0, 0, 0);

    const isDue = reviewDay <= today;
    
    // Formatting date as "MMM DD, YYYY"
    const dateStr = nextReviewDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Generate tags HTML securely
    const tagsHtml = problem.tags.map(tag => {
        // Escape basic HTML to prevent injection
        const safeTag = tag.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<span class="tag">${safeTag}</span>`;
    }).join('');

    // Handle title optionally as a link to LeetCode, etc.
    const safeTitle = problem.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeUrl = problem.url ? encodeURI(problem.url) : '#';

    const titleHtml = problem.url 
        ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="problem-card-title">${safeTitle}</a>`
        : `<span class="problem-card-title">${safeTitle}</span>`;

    return `
        <article class="card problem-card" data-id="${problem.id}">
            <div class="problem-card-header">
                ${titleHtml}
                <div>
                    <button class="delete-btn" aria-label="Edit problem" data-action="edit" data-id="${problem.id}" style="color: var(--clr-secondary); margin-right: 0.5rem;">Edit</button>
                    <button class="delete-btn" aria-label="Delete problem" data-action="delete" data-id="${problem.id}">Delete</button>
                </div>
            </div>
            
            <div class="problem-tags">
                ${tagsHtml.length ? tagsHtml : '<span class="tag">Uncategorized</span>'}
            </div>
            
            <div class="problem-card-footer">
                <span class="review-date ${isDue ? 'due' : ''}">
                    ${isDue ? 'Needs Review Now' : 'Next review: ' + dateStr}
                </span>
                <button class="btn btn-secondary ${!isDue ? 'disabled-btn' : ''}" style="width: auto; padding: 0.4rem 0.75rem;" data-action="review" data-id="${problem.id}" ${!isDue ? 'disabled title="Please wait until the review date to mark this as reviewed."' : ''}>
                    ${!isDue ? 'Pending Review' : `Mark Reviewed (Step ${problem.step + 1})`}
                </button>
            </div>
        </article>
    `;
};
