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
import { getNextOverlayColor } from './utils/overlay-utils.js';

/**
 * Initialize the application
 */
function init() {
    setupScaleSelectors();
    setupOverlayControls();
    createChordButtons();
    updateScaleTitle();
    updateAllVisualizations();

    // Listen for state changes
    state.on('scale-changed', handleScaleChange);
    state.on('chord-changed', handleChordChange);
    state.on('overlay-changed', handleOverlayChange);
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
 * Setup overlay controls
 */
function setupOverlayControls() {
    const toggleBtn = document.getElementById('overlayToggleBtn');
    const content = document.getElementById('overlayContent');
    const addBtn = document.getElementById('addOverlayBtn');
    const clearBtn = document.getElementById('clearOverlaysBtn');

    // Toggle overlay panel visibility
    toggleBtn.addEventListener('click', () => {
        const isVisible = content.classList.contains('visible');
        if (isVisible) {
            content.classList.remove('visible');
            toggleBtn.textContent = 'Show';
        } else {
            content.classList.add('visible');
            toggleBtn.textContent = 'Hide';
        }
    });

    // Add overlay scale
    addBtn.addEventListener('click', () => {
        const rootSelect = document.getElementById('overlayRootSelect');
        const scaleSelect = document.getElementById('overlayScaleSelect');

        const root = rootSelect.value;
        const scaleType = scaleSelect.value;
        const color = getNextOverlayColor(state.getOverlayScales());

        state.addOverlayScale(root, scaleType, color);
    });

    // Clear all overlays
    clearBtn.addEventListener('click', () => {
        state.clearOverlayScales();
    });
}

/**
 * Handle overlay changes
 */
function handleOverlayChange(overlayScales) {
    renderOverlayList(overlayScales);
    updateAllVisualizations();
}

/**
 * Render the list of overlay scales
 */
function renderOverlayList(overlayScales) {
    const container = document.getElementById('overlayList');
    container.innerHTML = '';

    if (overlayScales.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'overlay-empty-message';
        emptyMessage.textContent = 'No overlay scales added yet. Add a scale above to compare with your primary scale.';
        container.appendChild(emptyMessage);
        return;
    }

    overlayScales.forEach(scale => {
        const item = document.createElement('div');
        item.className = 'overlay-item';

        // Color indicator
        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'overlay-color-indicator';
        colorIndicator.style.backgroundColor = scale.color;

        // Scale name
        const name = document.createElement('div');
        name.className = 'overlay-item-name';
        name.textContent = `${scale.root} ${scale.name}`;

        // Controls
        const controls = document.createElement('div');
        controls.className = 'overlay-item-controls';

        // Visibility toggle
        const visibilityBtn = document.createElement('button');
        visibilityBtn.className = `overlay-visibility-btn ${scale.visible ? 'visible' : ''}`;
        visibilityBtn.textContent = scale.visible ? '👁 Visible' : '👁 Hidden';
        visibilityBtn.addEventListener('click', () => {
            state.toggleOverlayScaleVisibility(scale.id);
        });

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'overlay-remove-btn';
        removeBtn.textContent = '✕ Remove';
        removeBtn.addEventListener('click', () => {
            state.removeOverlayScale(scale.id);
        });

        controls.appendChild(visibilityBtn);
        controls.appendChild(removeBtn);

        item.appendChild(colorIndicator);
        item.appendChild(name);
        item.appendChild(controls);

        container.appendChild(item);
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
    const overlayScales = state.getOverlayScales();
    const primaryScale = state.getCurrentScale();

    // Prepare options object for visualizations
    const options = overlayScales.length > 0
        ? { primaryScale, overlayScales }
        : {};

    drawStaff('staffCanvas', chord, options);
    drawPiano('pianoCanvas', chord, options);
    drawGuitar('guitarCanvas', chord, options);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
