/**
 * Overlay Visualization
 *
 * Handles rendering multiple scales/chords simultaneously
 * for comparison and pivot chord analysis
 */

import { drawStaff } from './staff.js';
import { drawPiano } from './piano.js';
import { drawGuitar } from './guitar.js';

// Colors for primary and secondary scales
const PRIMARY_COLOR = '#667eea';    // Purple (existing)
const SECONDARY_COLOR = '#f59e42';  // Orange
const COMMON_COLOR = '#ffd700';     // Gold (for common notes/pivot notes)

/**
 * Find common notes between two chords
 */
function findCommonNotes(primaryChord, secondaryChord) {
    const primaryNotes = new Set(primaryChord.notes.map(n => n % 12));
    const secondaryNotes = new Set(secondaryChord.notes.map(n => n % 12));

    const common = [];
    for (const note of primaryNotes) {
        if (secondaryNotes.has(note)) {
            common.push(note);
        }
    }

    return common;
}

/**
 * Draw staff with overlay
 * Shows both chords with different colors
 */
export function drawStaffOverlay(canvasId, primaryChord, secondaryChord) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find common notes
    const commonNotes = findCommonNotes(primaryChord, secondaryChord);

    // Draw staff lines first
    drawStaffLines(ctx, width, height);

    // Draw treble clef
    drawTrebleClef(ctx);

    // Draw both chords with appropriate colors
    drawChordOnStaff(ctx, primaryChord, PRIMARY_COLOR, commonNotes, width, height, 0);
    drawChordOnStaff(ctx, secondaryChord, SECONDARY_COLOR, commonNotes, width, height, 1);
}

/**
 * Draw piano with overlay
 * Shows both chords with different colors
 */
export function drawPianoOverlay(canvasId, primaryChord, secondaryChord) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find common notes
    const commonNotes = findCommonNotes(primaryChord, secondaryChord);

    // Draw piano keys
    drawPianoKeys(ctx, width, height);

    // Highlight notes from both chords
    highlightPianoNotes(ctx, primaryChord, PRIMARY_COLOR, commonNotes, width, height);
    highlightPianoNotes(ctx, secondaryChord, SECONDARY_COLOR, commonNotes, width, height);
}

/**
 * Draw guitar with overlay
 * Shows both chords with different colors
 */
export function drawGuitarOverlay(canvasId, primaryChord, secondaryChord) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find common notes
    const commonNotes = findCommonNotes(primaryChord, secondaryChord);

    // Draw fretboard
    drawFretboard(ctx, width, height);

    // Draw notes from both chords
    drawGuitarChordNotes(ctx, primaryChord, PRIMARY_COLOR, commonNotes, width, height);
    drawGuitarChordNotes(ctx, secondaryChord, SECONDARY_COLOR, commonNotes, width, height);
}

// Helper functions (simplified versions - in production, these would use the actual drawing logic)

function drawStaffLines(ctx, width, height) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    const lineSpacing = 20;
    const startY = 50;

    for (let i = 0; i < 5; i++) {
        const y = startY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(width - 50, y);
        ctx.stroke();
    }
}

function drawTrebleClef(ctx) {
    ctx.font = '70px serif';
    ctx.fillStyle = '#333';
    ctx.fillText('𝄞', 55, 100);
}

function drawChordOnStaff(ctx, chord, color, commonNotes, width, height, offset) {
    // Simplified - actual implementation would position notes properly on staff
    // This is a placeholder for the overlay logic
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;

    const noteX = 150 + offset * 15;
    chord.notes.forEach((note, i) => {
        const pitchClass = note % 12;
        const isCommon = commonNotes.includes(pitchClass);

        if (isCommon) {
            ctx.fillStyle = COMMON_COLOR;
        } else {
            ctx.fillStyle = color;
        }

        // Draw note (simplified positioning)
        const y = 100 - (note - 60) * 5;
        ctx.beginPath();
        ctx.arc(noteX + i * 5, y, 8, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.globalAlpha = 1.0;
}

function drawPianoKeys(ctx, width, height) {
    // Simplified piano key drawing
    const whiteKeyWidth = width / 14;
    const whiteKeyHeight = height * 0.7;

    // Draw white keys
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    for (let i = 0; i < 14; i++) {
        const x = i * whiteKeyWidth;
        ctx.fillRect(x, 0, whiteKeyWidth, whiteKeyHeight);
        ctx.strokeRect(x, 0, whiteKeyWidth, whiteKeyHeight);
    }

    // Draw black keys (simplified)
    ctx.fillStyle = '#000';
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = height * 0.4;

    const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7, 7.7, 8.7, 10.7, 11.7, 12.7];
    blackKeyPositions.forEach(pos => {
        ctx.fillRect(pos * whiteKeyWidth - blackKeyWidth / 2, 0, blackKeyWidth, blackKeyHeight);
    });
}

function highlightPianoNotes(ctx, chord, color, commonNotes, width, height) {
    ctx.globalAlpha = 0.5;
    const whiteKeyWidth = width / 14;

    chord.notes.forEach(note => {
        const pitchClass = note % 12;
        const isCommon = commonNotes.includes(pitchClass);

        if (isCommon) {
            ctx.fillStyle = COMMON_COLOR;
        } else {
            ctx.fillStyle = color;
        }

        // Calculate key position (simplified)
        const keyIndex = (note - 60) % 12;
        const x = keyIndex * (whiteKeyWidth * 0.85);
        const y = height * 0.6;

        ctx.beginPath();
        ctx.arc(x + whiteKeyWidth, y, 10, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.globalAlpha = 1.0;
}

function drawFretboard(ctx, width, height) {
    // Simplified fretboard drawing
    const stringSpacing = height / 7;
    const fretWidth = width / 13;

    // Draw strings
    ctx.strokeStyle = '#666';
    for (let i = 1; i <= 6; i++) {
        ctx.lineWidth = i === 6 ? 3 : (7 - i) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, i * stringSpacing);
        ctx.lineTo(width, i * stringSpacing);
        ctx.stroke();
    }

    // Draw frets
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 12; i++) {
        ctx.beginPath();
        ctx.moveTo(i * fretWidth, stringSpacing);
        ctx.lineTo(i * fretWidth, 6 * stringSpacing);
        ctx.stroke();
    }
}

function drawGuitarChordNotes(ctx, chord, color, commonNotes, width, height) {
    ctx.globalAlpha = 0.6;
    const stringSpacing = height / 7;
    const fretWidth = width / 13;

    // Simplified - actual implementation would map notes to fret positions
    chord.notes.forEach((note, i) => {
        const pitchClass = note % 12;
        const isCommon = commonNotes.includes(pitchClass);

        if (isCommon) {
            ctx.fillStyle = COMMON_COLOR;
        } else {
            ctx.fillStyle = color;
        }

        // Draw note circle (simplified positioning)
        const x = (i + 1) * fretWidth;
        const y = ((i % 6) + 1) * stringSpacing;

        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.globalAlpha = 1.0;
}

/**
 * Create a legend showing color meanings
 */
export function createOverlayLegend() {
    return {
        primary: { color: PRIMARY_COLOR, label: 'Primary Scale' },
        secondary: { color: SECONDARY_COLOR, label: 'Secondary Scale' },
        common: { color: COMMON_COLOR, label: 'Common Notes (Pivot)' }
    };
}
