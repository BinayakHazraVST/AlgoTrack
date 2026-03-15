/**
 * Calculates a future timestamp based on spaced repetition.
 * Returns a future timestamp in milliseconds.
 * 
 * Step 0: New -> +1 day
 * Step 1: -> +3 days
 * Step 2: -> +7 days
 * Step 3: -> +14 days
 * Step 4+: -> +30 days
 */
export const calculateNextReview = (currentStep) => {
    // Spaced repetition interval mapping (in days)
    const intervals = [1, 3, 7, 14, 30];
    
    // Ensure index doesn't go out of bounds of the available intervals
    const daysToAdd = intervals[Math.min(currentStep, intervals.length - 1)];
    
    const now = new Date();
    // Add the specified number of days to current date
    now.setDate(now.getDate() + daysToAdd);
    
    // Return timestamp to easily store and compare
    return now.getTime();
};
