/**
 * State Manager
 *
 * Centralized application state management
 */

import { generateDiatonicChords, SCALES } from './music-theory.js';

class StateManager {
    constructor() {
        this.state = {
            // Primary scale
            currentScale: 'major',
            currentRoot: 'C',
            currentChord: null,
            diatonicChords: null,

            // Secondary scale for comparison (Phase 2)
            compareMode: false,
            secondaryScale: null,
            secondaryRoot: null,
            secondaryChords: null,

            // Multi-scale overlay (Phase 2 - Enhanced)
            overlayScales: [],
            nextOverlayId: 1
        };

        // Initialize chords
        this.state.diatonicChords = generateDiatonicChords(this.state.currentRoot, this.state.currentScale);
        this.state.currentChord = Object.keys(this.state.diatonicChords)[0];

        // Listeners for state changes
        this.listeners = {
            'scale-changed': [],
            'chord-changed': [],
            'compare-mode-changed': [],
            'overlay-changed': []
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

    // Compare mode methods (Phase 2)
    setCompareMode(enabled) {
        this.state.compareMode = enabled;
        this.emit('compare-mode-changed', {
            enabled,
            secondaryScale: this.getSecondaryScale(),
            secondaryChords: this.state.secondaryChords
        });
    }

    isCompareMode() {
        return this.state.compareMode;
    }

    setSecondaryScale(root, scaleType) {
        this.state.secondaryRoot = root;
        this.state.secondaryScale = scaleType;
        this.state.secondaryChords = generateDiatonicChords(root, scaleType);

        this.emit('compare-mode-changed', {
            enabled: this.state.compareMode,
            root,
            scaleType,
            chords: this.state.secondaryChords
        });
    }

    getSecondaryScale() {
        if (!this.state.secondaryRoot || !this.state.secondaryScale) {
            return null;
        }
        return {
            root: this.state.secondaryRoot,
            type: this.state.secondaryScale,
            name: SCALES[this.state.secondaryScale].name
        };
    }

    getSecondaryChords() {
        return this.state.secondaryChords;
    }

    // Multi-scale overlay methods
    addOverlayScale(root, scaleType, color) {
        const id = this.state.nextOverlayId++;
        const overlayScale = {
            id,
            root,
            type: scaleType,
            color,
            visible: true,
            name: SCALES[scaleType].name
        };

        this.state.overlayScales.push(overlayScale);
        this.emit('overlay-changed', this.state.overlayScales);
        return id;
    }

    removeOverlayScale(id) {
        this.state.overlayScales = this.state.overlayScales.filter(s => s.id !== id);
        this.emit('overlay-changed', this.state.overlayScales);
    }

    toggleOverlayScaleVisibility(id) {
        const scale = this.state.overlayScales.find(s => s.id === id);
        if (scale) {
            scale.visible = !scale.visible;
            this.emit('overlay-changed', this.state.overlayScales);
        }
    }

    updateOverlayScaleColor(id, color) {
        const scale = this.state.overlayScales.find(s => s.id === id);
        if (scale) {
            scale.color = color;
            this.emit('overlay-changed', this.state.overlayScales);
        }
    }

    clearOverlayScales() {
        this.state.overlayScales = [];
        this.emit('overlay-changed', this.state.overlayScales);
    }

    getOverlayScales() {
        return this.state.overlayScales;
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
