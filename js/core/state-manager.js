/**
 * State Manager
 *
 * Centralized application state management
 */

import { generateDiatonicChords, SCALES } from './music-theory.js';

class StateManager {
    constructor() {
        this.state = {
            currentScale: 'major',
            currentRoot: 'C',
            currentChord: null,
            diatonicChords: null
        };

        // Initialize chords
        this.state.diatonicChords = generateDiatonicChords(this.state.currentRoot, this.state.currentScale);
        this.state.currentChord = Object.keys(this.state.diatonicChords)[0];

        // Listeners for state changes
        this.listeners = {
            'scale-changed': [],
            'chord-changed': []
        };
    }

    // Get current state
    getCurrentScale() {
        return {
            root: this.state.currentRoot,
            type: this.state.currentScale,
            name: SCALES[this.state.currentScale].name
        };
    }

    getCurrentChord() {
        return this.state.diatonicChords[this.state.currentChord];
    }

    getDiatonicChords() {
        return this.state.diatonicChords;
    }

    getCurrentChordKey() {
        return this.state.currentChord;
    }

    // Set state
    setScale(root, scaleType) {
        this.state.currentRoot = root;
        this.state.currentScale = scaleType;
        this.state.diatonicChords = generateDiatonicChords(root, scaleType);
        this.state.currentChord = Object.keys(this.state.diatonicChords)[0];

        this.emit('scale-changed', {
            root,
            scaleType,
            chords: this.state.diatonicChords
        });

        this.emit('chord-changed', this.getCurrentChord());
    }

    setChord(chordKey) {
        this.state.currentChord = chordKey;
        this.emit('chord-changed', this.getCurrentChord());
    }

    // Event system
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

// Export singleton instance
export const state = new StateManager();
