/**
 * Piano Roll Visualization
 *
 * Renders a piano keyboard with highlighted chord notes
 */

import { noteToMidi, midiToNoteName } from '../core/music-theory.js';

/**
 * Draw piano keyboard with chord highlighted
 */
export function drawPiano(canvasId, chord) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 200;

    const whiteKeyWidth = 50;
    const whiteKeyHeight = 180;
    const blackKeyWidth = 30;
    const blackKeyHeight = 110;

    // Draw 2 octaves starting from C4
    const startNote = 60; // C4
    const numOctaves = 2;

    // White keys pattern (C, D, E, F, G, A, B)
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11];

    const chordMidiNotes = chord.notes.map(noteToMidi);

    // Draw white keys
    let whiteKeyIndex = 0;
    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            const midi = startNote + octave * 12 + whiteKeys[i];
            const x = whiteKeyIndex * whiteKeyWidth;

            const isActive = chordMidiNotes.includes(midi);

            // Draw white key
            ctx.fillStyle = isActive ? '#667eea' : 'white';
            ctx.fillRect(x, 10, whiteKeyWidth - 2, whiteKeyHeight);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, 10, whiteKeyWidth - 2, whiteKeyHeight);

            // Draw note name
            ctx.fillStyle = isActive ? 'white' : '#999';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            const noteName = midiToNoteName(midi).slice(0, -1); // Remove octave number
            ctx.fillText(noteName, x + whiteKeyWidth / 2, 175);

            whiteKeyIndex++;
        }
    }

    // Draw black keys
    whiteKeyIndex = 0;
    for (let octave = 0; octave < numOctaves; octave++) {
        for (let i = 0; i < whiteKeys.length; i++) {
            // Black keys appear between certain white keys
            const nextWhiteKey = whiteKeys[(i + 1) % whiteKeys.length];
            const currentWhiteKey = whiteKeys[i];

            // Check if there's a black key between current and next white key
            if (nextWhiteKey - currentWhiteKey === 2) {
                const blackKeyMidi = startNote + octave * 12 + currentWhiteKey + 1;
                const isActive = chordMidiNotes.includes(blackKeyMidi);

                const x = (whiteKeyIndex + 1) * whiteKeyWidth - blackKeyWidth / 2;

                ctx.fillStyle = isActive ? '#667eea' : '#333';
                ctx.fillRect(x, 10, blackKeyWidth, blackKeyHeight);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, 10, blackKeyWidth, blackKeyHeight);
            }

            whiteKeyIndex++;
        }
    }

    // Update info text
    const infoElement = document.getElementById(canvasId.replace('Canvas', 'Info'));
    if (infoElement) {
        infoElement.textContent = `${chord.name} (${chord.roman}) - Notes: ${chord.notes.join(', ')}`;
    }
}
