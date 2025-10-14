/**
 * Overlay Utilities
 *
 * Helper functions for multi-scale overlay visualization
 */

import { generateScale, noteToMidi } from '../core/music-theory.js';

/**
 * Get all notes in a scale as MIDI pitch classes (0-11)
 */
export function getScalePitchClasses(root, scaleType) {
    const scale = generateScale(root, scaleType);
    return scale.map(note => {
        const midi = noteToMidi(note);
        return midi % 12;
    });
}

/**
 * Find common pitch classes between multiple scales
 * Returns Set of pitch classes (0-11) that appear in ALL provided scales
 */
export function findCommonPitchClasses(scales) {
    if (scales.length === 0) return new Set();

    // Get pitch classes for each scale
    const scalePitchSets = scales.map(scale =>
        new Set(getScalePitchClasses(scale.root, scale.type))
    );

    // Find intersection of all sets
    const firstSet = scalePitchSets[0];
    const commonPitches = new Set();

    for (const pitch of firstSet) {
        if (scalePitchSets.every(set => set.has(pitch))) {
            commonPitches.add(pitch);
        }
    }

    return commonPitches;
}

/**
 * Determine which scales contain a given pitch class
 * Returns array of scale objects that contain the pitch
 */
export function getScalesForPitch(pitch, primaryScale, overlayScales) {
    const allScales = [
        { ...primaryScale, color: '#667eea' } // Primary scale gets default purple
    ].concat(overlayScales.filter(s => s.visible));

    return allScales.filter(scale => {
        const pitchClasses = getScalePitchClasses(scale.root, scale.type);
        return pitchClasses.includes(pitch);
    });
}

/**
 * Blend multiple colors together using RGB averaging
 * @param {string[]} colors - Array of hex color strings (e.g., ['#FF0000', '#0000FF'])
 * @returns {string} Blended hex color
 */
export function blendColors(colors) {
    if (colors.length === 0) return '#CCCCCC';
    if (colors.length === 1) return colors[0];

    // Convert hex colors to RGB
    const rgbColors = colors.map(hexToRgb);

    // Average the RGB values
    const avgR = Math.round(rgbColors.reduce((sum, c) => sum + c.r, 0) / colors.length);
    const avgG = Math.round(rgbColors.reduce((sum, c) => sum + c.g, 0) / colors.length);
    const avgB = Math.round(rgbColors.reduce((sum, c) => sum + c.b, 0) / colors.length);

    // Convert back to hex
    return rgbToHex(avgR, avgG, avgB);
}

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Get color for a note based on which scales it appears in
 * @param {number} pitch - MIDI pitch class (0-11)
 * @param {object} primaryScale - Primary scale object
 * @param {array} overlayScales - Array of overlay scale objects
 * @returns {string} Hex color for this note
 */
export function getColorForPitch(pitch, primaryScale, overlayScales) {
    const scalesContainingPitch = getScalesForPitch(pitch, primaryScale, overlayScales);

    if (scalesContainingPitch.length === 0) {
        return '#EEEEEE'; // Gray for notes not in any scale
    }

    // Blend colors of all scales containing this pitch
    const colors = scalesContainingPitch.map(s => s.color);
    return blendColors(colors);
}

/**
 * Predefined color palette for overlay scales
 */
export const OVERLAY_COLORS = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FFEB3B', // Yellow
    '#795548', // Brown
];

/**
 * Get next available color from palette
 */
export function getNextOverlayColor(existingScales) {
    const usedColors = new Set(existingScales.map(s => s.color));

    for (const color of OVERLAY_COLORS) {
        if (!usedColors.has(color)) {
            return color;
        }
    }

    // If all colors used, cycle back through
    return OVERLAY_COLORS[existingScales.length % OVERLAY_COLORS.length];
}
