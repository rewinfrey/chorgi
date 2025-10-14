/**
 * LocalStorage Wrapper for Progress Tracking
 *
 * Saves and loads practice statistics
 */

const STORAGE_KEY = 'chorgi_practice_stats';

/**
 * Get practice statistics from localStorage
 */
export function loadStats() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return getDefaultStats();
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading stats:', error);
        return getDefaultStats();
    }
}

/**
 * Save practice statistics to localStorage
 */
export function saveStats(stats) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error('Error saving stats:', error);
    }
}

/**
 * Get default statistics object
 */
function getDefaultStats() {
    return {
        totalScore: 0,
        totalAttempts: 0,
        totalCorrect: 0,
        bestStreak: 0,
        sessionHistory: [],
        difficultyStats: {
            beginner: { attempts: 0, correct: 0 },
            intermediate: { attempts: 0, correct: 0 },
            advanced: { attempts: 0, correct: 0 }
        }
    };
}

/**
 * Update stats with current session data
 */
export function updateStats(sessionData) {
    const stats = loadStats();

    stats.totalScore += sessionData.score;
    stats.totalAttempts += sessionData.attempts;
    stats.totalCorrect += sessionData.correctAnswers;
    stats.bestStreak = Math.max(stats.bestStreak, sessionData.bestStreak || 0);

    // Update difficulty-specific stats
    if (sessionData.difficulty) {
        stats.difficultyStats[sessionData.difficulty].attempts += sessionData.attempts;
        stats.difficultyStats[sessionData.difficulty].correct += sessionData.correctAnswers;
    }

    // Add session to history
    stats.sessionHistory.push({
        date: new Date().toISOString(),
        score: sessionData.score,
        attempts: sessionData.attempts,
        correct: sessionData.correctAnswers,
        accuracy: sessionData.attempts > 0
            ? Math.round((sessionData.correctAnswers / sessionData.attempts) * 100)
            : 0,
        difficulty: sessionData.difficulty
    });

    // Keep only last 50 sessions
    if (stats.sessionHistory.length > 50) {
        stats.sessionHistory = stats.sessionHistory.slice(-50);
    }

    saveStats(stats);
    return stats;
}

/**
 * Reset all statistics
 */
export function resetStats() {
    const stats = getDefaultStats();
    saveStats(stats);
    return stats;
}

/**
 * Get formatted statistics for display
 */
export function getFormattedStats() {
    const stats = loadStats();

    const overallAccuracy = stats.totalAttempts > 0
        ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
        : 0;

    const recentSessions = stats.sessionHistory.slice(-10);
    const recentAccuracy = recentSessions.length > 0
        ? Math.round(
            recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length
        )
        : 0;

    return {
        totalScore: stats.totalScore,
        totalAttempts: stats.totalAttempts,
        totalCorrect: stats.totalCorrect,
        overallAccuracy,
        bestStreak: stats.bestStreak,
        recentAccuracy,
        recentSessions,
        difficultyStats: stats.difficultyStats
    };
}
