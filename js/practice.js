/**
 * Practice Mode - Chord Recognition Game
 *
 * Interactive learning with clickable piano and scoring
 */

import { generateDiatonicChords, noteToMidi } from './core/music-theory.js';
import { loadStats, updateStats, getFormattedStats } from './utils/storage.js';

// Game state
const gameState = {
    currentChord: null,
    currentChordKey: null,
    userSelectedNotes: new Set(),
    score: 0,
    attempts: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    difficulty: 'intermediate',
    scale: 'C',
    scaleType: 'major',
    showingAnswer: false
};

// Piano rendering constants
const PIANO_CONFIG = {
    canvas: null,
    ctx: null,
    width: 700,  // 14 white keys * 50px
    height: 200,
    whiteKeyWidth: 50,
    whiteKeyHeight: 180,
    blackKeyWidth: 30,
    blackKeyHeight: 110,
    startNote: 60, // C4
    numOctaves: 2,
    startX: 0,
    startY: 10
};

// Answer piano config
const ANSWER_PIANO_CONFIG = {
    canvas: null,
    ctx: null,
    width: 700,  // 14 white keys * 50px
    height: 200,
    whiteKeyWidth: 50,
    whiteKeyHeight: 180,
    blackKeyWidth: 30,
    blackKeyHeight: 110,
    startNote: 60, // C4
    numOctaves: 2,
    startX: 0,
    startY: 10
};

/**
 * Initialize practice mode
 */
function init() {
    PIANO_CONFIG.canvas = document.getElementById('practiceCanvas');
    PIANO_CONFIG.ctx = PIANO_CONFIG.canvas.getContext('2d');
    PIANO_CONFIG.canvas.width = PIANO_CONFIG.width;
    PIANO_CONFIG.canvas.height = PIANO_CONFIG.height;

    ANSWER_PIANO_CONFIG.canvas = document.getElementById('answerCanvas');
    ANSWER_PIANO_CONFIG.ctx = ANSWER_PIANO_CONFIG.canvas.getContext('2d');
    ANSWER_PIANO_CONFIG.canvas.width = ANSWER_PIANO_CONFIG.width;
    ANSWER_PIANO_CONFIG.canvas.height = ANSWER_PIANO_CONFIG.height;

    setupEventListeners();
    loadNewChallenge();
    drawInteractivePiano();
    updateLifetimeStats();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Canvas click
    PIANO_CONFIG.canvas.addEventListener('click', handlePianoClick);

    // Buttons
    document.getElementById('checkBtn').addEventListener('click', checkAnswer);
    document.getElementById('clearBtn').addEventListener('click', clearSelection);
    document.getElementById('showAnswerBtn').addEventListener('click', showAnswer);
    document.getElementById('nextBtn').addEventListener('click', nextChallenge);

    // Settings
    document.getElementById('difficultySelect').addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
        loadNewChallenge();
    });

    document.getElementById('scaleSelect').addEventListener('change', (e) => {
        const value = e.target.value;
        if (value.includes('-minor')) {
            gameState.scale = value.split('-')[0].toUpperCase();
            gameState.scaleType = 'natural_minor';
        } else {
            gameState.scale = value;
            gameState.scaleType = 'major';
        }
        loadNewChallenge();
    });
}

/**
 * Load a new challenge chord
 */
function loadNewChallenge() {
    const chords = generateDiatonicChords(gameState.scale, gameState.scaleType);
    const chordKeys = Object.keys(chords);

    // Filter by difficulty
    let availableChords = chordKeys;
    if (gameState.difficulty === 'beginner') {
        // Only major and minor chords (simplified - just use all for now)
        availableChords = chordKeys;
    }

    // Avoid repeating the same chord twice in a row
    if (gameState.currentChordKey && availableChords.length > 1) {
        availableChords = availableChords.filter(key => key !== gameState.currentChordKey);
    }

    // Pick random chord from available pool
    const randomKey = availableChords[Math.floor(Math.random() * availableChords.length)];
    gameState.currentChord = chords[randomKey];
    gameState.currentChordKey = randomKey;

    // Reset state
    gameState.userSelectedNotes.clear();
    gameState.showingAnswer = false;

    // Update UI
    document.getElementById('challengeChord').textContent = gameState.currentChord.name;
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('checkBtn').disabled = false;
    document.getElementById('answerSection').style.display = 'none';

    // Clear border feedback
    const pianoSection = document.querySelector('.piano-section:not(#answerSection)');
    if (pianoSection) {
        pianoSection.classList.remove('correct', 'incorrect');
    }

    drawInteractivePiano();
}

/**
 * Draw interactive piano
 */
function drawInteractivePiano() {
    const { ctx, width, height, whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight, startNote, numOctaves, startX, startY } = PIANO_CONFIG;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
    const targetMidiNotes = gameState.currentChord.notes.map(noteToMidi);
    const targetPitchClasses = new Set(targetMidiNotes.map(midi => midi % 12));

    // Draw white keys
    let whiteKeyIndex = 0;
    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const midi = startNote + octave * 12 + whiteKeys[i];
            const pitchClass = midi % 12;
            const x = startX + whiteKeyIndex * whiteKeyWidth;

            const isSelected = gameState.userSelectedNotes.has(midi);
            const isCorrect = targetPitchClasses.has(pitchClass);
            const isShowingAnswer = gameState.showingAnswer;

            // Determine fill color
            let fillColor = 'white';
            if (isShowingAnswer && isCorrect) {
                fillColor = '#4CAF50'; // Green for correct answer
            } else if (isSelected) {
                fillColor = '#667eea'; // Purple for selected
            }

            // Draw white key
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, startY, whiteKeyWidth - 2, whiteKeyHeight);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, startY, whiteKeyWidth - 2, whiteKeyHeight);

            whiteKeyIndex++;
        }
    }

    // Draw black keys
    whiteKeyIndex = 0;
    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const nextWhiteKey = whiteKeys[(i + 1) % whiteKeys.length];
            const currentWhiteKey = whiteKeys[i];

            if (nextWhiteKey - currentWhiteKey === 2) {
                const blackKeyMidi = startNote + octave * 12 + currentWhiteKey + 1;
                const pitchClass = blackKeyMidi % 12;
                const isSelected = gameState.userSelectedNotes.has(blackKeyMidi);
                const isCorrect = targetPitchClasses.has(pitchClass);
                const isShowingAnswer = gameState.showingAnswer;

                const x = startX + (whiteKeyIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;

                // Determine fill color
                let fillColor = '#333';
                if (isShowingAnswer && isCorrect) {
                    fillColor = '#4CAF50'; // Green for correct answer
                } else if (isSelected) {
                    fillColor = '#667eea'; // Purple for selected
                }

                ctx.fillStyle = fillColor;
                ctx.fillRect(x, startY, blackKeyWidth, blackKeyHeight);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, startY, blackKeyWidth, blackKeyHeight);
            }

            whiteKeyIndex++;
        }
    }
}

/**
 * Handle piano click
 */
function handlePianoClick(event) {
    if (gameState.showingAnswer) return;

    const rect = PIANO_CONFIG.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight, startNote, numOctaves, startX, startY } = PIANO_CONFIG;

    // Check black keys first (they're on top)
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
    let whiteKeyIndex = 0;

    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const nextWhiteKey = whiteKeys[(i + 1) % whiteKeys.length];
            const currentWhiteKey = whiteKeys[i];

            if (nextWhiteKey - currentWhiteKey === 2) {
                const blackKeyMidi = startNote + octave * 12 + currentWhiteKey + 1;
                const keyX = startX + (whiteKeyIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;

                if (x >= keyX && x <= keyX + blackKeyWidth && y >= startY && y <= startY + blackKeyHeight) {
                    toggleNote(blackKeyMidi);
                    return;
                }
            }

            whiteKeyIndex++;
        }
    }

    // Check white keys
    whiteKeyIndex = 0;
    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const midi = startNote + octave * 12 + whiteKeys[i];
            const keyX = startX + whiteKeyIndex * whiteKeyWidth;

            if (x >= keyX && x <= keyX + whiteKeyWidth - 2 && y >= startY && y <= startY + whiteKeyHeight) {
                toggleNote(midi);
                return;
            }

            whiteKeyIndex++;
        }
    }
}

/**
 * Toggle note selection
 */
function toggleNote(midi) {
    if (gameState.userSelectedNotes.has(midi)) {
        gameState.userSelectedNotes.delete(midi);
    } else {
        gameState.userSelectedNotes.add(midi);
    }
    drawInteractivePiano();
}

/**
 * Clear all selections
 */
function clearSelection() {
    gameState.userSelectedNotes.clear();
    gameState.showingAnswer = false;
    document.getElementById('checkBtn').disabled = false;
    document.getElementById('answerSection').style.display = 'none';

    // Clear border feedback
    const pianoSection = document.querySelector('.piano-section:not(#answerSection)');
    if (pianoSection) {
        pianoSection.classList.remove('correct', 'incorrect');
    }

    drawInteractivePiano();
}

/**
 * Show the correct answer
 */
function showAnswer() {
    // Display answer section
    document.getElementById('answerSection').style.display = 'block';

    // Update scale and notes info
    const scaleName = gameState.scaleType === 'major'
        ? `${gameState.scale} Major`
        : `${gameState.scale} Natural Minor`;
    document.getElementById('answerScale').textContent = scaleName;
    document.getElementById('answerNotes').textContent = gameState.currentChord.notes.join(', ');

    // Draw answer piano with correct notes highlighted
    drawAnswerPiano();

    // Show next button
    document.getElementById('nextBtn').style.display = 'inline-block';

    // Scroll to answer
    document.getElementById('answerSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Draw answer piano with correct notes highlighted
 */
function drawAnswerPiano() {
    const { ctx, width, height, whiteKeyWidth, whiteKeyHeight, blackKeyWidth, blackKeyHeight, startNote, numOctaves, startX, startY } = ANSWER_PIANO_CONFIG;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
    const targetMidiNotes = gameState.currentChord.notes.map(noteToMidi);
    const targetPitchClasses = new Set(targetMidiNotes.map(midi => midi % 12));

    // Draw white keys
    let whiteKeyIndex = 0;
    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const midi = startNote + octave * 12 + whiteKeys[i];
            const pitchClass = midi % 12;
            const x = startX + whiteKeyIndex * whiteKeyWidth;

            const isCorrect = targetPitchClasses.has(pitchClass);
            const fillColor = isCorrect ? '#4CAF50' : 'white';

            // Draw white key
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, startY, whiteKeyWidth - 2, whiteKeyHeight);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, startY, whiteKeyWidth - 2, whiteKeyHeight);

            whiteKeyIndex++;
        }
    }

    // Draw black keys
    whiteKeyIndex = 0;
    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const nextWhiteKey = whiteKeys[(i + 1) % whiteKeys.length];
            const currentWhiteKey = whiteKeys[i];

            if (nextWhiteKey - currentWhiteKey === 2) {
                const blackKeyMidi = startNote + octave * 12 + currentWhiteKey + 1;
                const pitchClass = blackKeyMidi % 12;
                const isCorrect = targetPitchClasses.has(pitchClass);

                const x = startX + (whiteKeyIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;
                const fillColor = isCorrect ? '#4CAF50' : '#333';

                ctx.fillStyle = fillColor;
                ctx.fillRect(x, startY, blackKeyWidth, blackKeyHeight);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, startY, blackKeyWidth, blackKeyHeight);
            }

            whiteKeyIndex++;
        }
    }
}

/**
 * Check user's answer
 */
function checkAnswer() {
    const targetMidiNotes = gameState.currentChord.notes.map(noteToMidi);
    const targetPitchClasses = new Set(targetMidiNotes.map(midi => midi % 12));
    const userPitchClasses = new Set([...gameState.userSelectedNotes].map(midi => midi % 12));

    // Get note names for feedback
    const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const targetNotes = [...targetPitchClasses].map(pc => noteNames[pc]).sort();
    const userNotes = [...userPitchClasses].map(pc => noteNames[pc]).sort();

    // Check if sets are equal
    const isCorrect =
        targetPitchClasses.size === userPitchClasses.size &&
        [...targetPitchClasses].every(pc => userPitchClasses.has(pc));

    gameState.attempts++;

    const pianoSection = document.querySelector('.piano-section:not(#answerSection)');

    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.score += 10 + (gameState.streak * 2);
        gameState.streak++;
        gameState.bestStreak = Math.max(gameState.bestStreak, gameState.streak);

        const feedback = document.getElementById('feedback');
        feedback.textContent = `Correct! +${10 + ((gameState.streak - 1) * 2)} points`;
        feedback.className = 'feedback correct';

        // Add green border to piano
        pianoSection.classList.remove('incorrect');
        pianoSection.classList.add('correct');
    } else {
        gameState.streak = 0;

        const feedback = document.getElementById('feedback');

        // Show what they selected vs what was expected
        const missing = targetNotes.filter(n => !userNotes.includes(n));
        const extra = userNotes.filter(n => !targetNotes.includes(n));

        let message = 'Not quite right. ';
        if (missing.length > 0) {
            message += `Missing: ${missing.join(', ')}. `;
        }
        if (extra.length > 0) {
            message += `Extra notes: ${extra.join(', ')}. `;
        }
        message += 'Try again or show the answer!';

        feedback.textContent = message;
        feedback.className = 'feedback incorrect';

        // Add red border to piano
        pianoSection.classList.remove('correct');
        pianoSection.classList.add('incorrect');
    }

    if (isCorrect) {
        document.getElementById('checkBtn').disabled = true;
        document.getElementById('nextBtn').style.display = 'inline-block';

        // Save progress every correct answer
        saveProgress();
    }

    updateScoreDisplay();
}

/**
 * Save current session progress
 */
function saveProgress() {
    updateStats({
        score: gameState.score,
        attempts: gameState.attempts,
        correctAnswers: gameState.correctAnswers,
        bestStreak: gameState.bestStreak,
        difficulty: gameState.difficulty
    });
    updateLifetimeStats();
}

/**
 * Update lifetime statistics display
 */
function updateLifetimeStats() {
    const stats = getFormattedStats();

    document.getElementById('lifetimeScore').textContent = stats.totalScore;
    document.getElementById('lifetimeAttempts').textContent = stats.totalAttempts;
    document.getElementById('lifetimeAccuracy').textContent = `${stats.overallAccuracy}%`;
    document.getElementById('lifetimeBestStreak').textContent = stats.bestStreak;
}

/**
 * Move to next challenge
 */
function nextChallenge() {
    loadNewChallenge();
}

/**
 * Update score display
 */
function updateScoreDisplay() {
    document.getElementById('scoreValue').textContent = gameState.score;
    document.getElementById('streakValue').textContent = gameState.streak;

    const accuracy = gameState.attempts > 0
        ? Math.round((gameState.correctAnswers / gameState.attempts) * 100)
        : 0;
    document.getElementById('accuracyValue').textContent = `${accuracy}%`;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
