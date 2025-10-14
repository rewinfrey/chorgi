/**
 * Main Application Entry Point
 *
 * Coordinates state management and visualization updates
 */

import { state } from './core/state-manager.js';
import { SCALES } from './core/music-theory.js';
import { drawStaff } from './visualizations/staff.js';
import { drawPiano } from './visualizations/piano.js';
import { drawGuitar } from './visualizations/guitar.js';

/**
 * Initialize the application
 */
function init() {
    setupScaleSelectors();
    createChordButtons();
    updateScaleTitle();
    updateAllVisualizations();

    // Listen for state changes
    state.on('scale-changed', handleScaleChange);
    state.on('chord-changed', handleChordChange);
}

/**
 * Setup scale selector event listeners
 */
function setupScaleSelectors() {
    const rootSelect = document.getElementById('rootSelect');
    const scaleSelect = document.getElementById('scaleSelect');

    rootSelect.addEventListener('change', () => {
        state.setScale(rootSelect.value, state.getCurrentScale().type);
        createChordButtons();
        updateScaleTitle();
    });

    scaleSelect.addEventListener('change', () => {
        state.setScale(state.getCurrentScale().root, scaleSelect.value);
        createChordButtons();
        updateScaleTitle();
    });
}


/**
 * Update the scale title
 */
function updateScaleTitle() {
    const scale = state.getCurrentScale();
    const title = document.getElementById('scaleTitle');
    if (title) {
        title.textContent = `${scale.root} ${scale.name} - Diatonic 7th Chords`;
    }
}

/**
 * Create chord selection buttons
 */
function createChordButtons() {
    const buttonsContainer = document.getElementById('chordButtons');
    buttonsContainer.innerHTML = ''; // Clear existing buttons

    const chords = state.getDiatonicChords();
    const currentChordKey = state.getCurrentChordKey();

    Object.keys(chords).forEach(chordKey => {
        const chord = chords[chordKey];
        const button = document.createElement('button');
        button.className = 'chord-btn';
        button.textContent = chord.name;
        button.dataset.chord = chordKey;

        if (chordKey === currentChordKey) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => selectChord(chordKey));
        buttonsContainer.appendChild(button);
    });
}

/**
 * Handle chord selection
 */
function selectChord(chordKey) {
    // Update active button
    document.querySelectorAll('.chord-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.chord === chordKey);
    });

    state.setChord(chordKey);
}

/**
 * Handle scale change event
 */
function handleScaleChange(data) {
    console.log('Scale changed:', data);
}

/**
 * Handle chord change event
 */
function handleChordChange(chord) {
    updateAllVisualizations();
}

/**
 * Update all visualizations
 */
function updateAllVisualizations() {
    const chord = state.getCurrentChord();
    drawStaff('staffCanvas', chord);
    drawPiano('pianoCanvas', chord);
    drawGuitar('guitarCanvas', chord);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
