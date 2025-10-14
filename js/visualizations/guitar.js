/**
 * Guitar Fretboard Visualization
 *
 * Renders a guitar fretboard with chord tones highlighted and labeled
 * with support for multi-scale overlay
 */

import { noteToMidi, getChordDegree, getDegreeColor, GUITAR_TUNING } from '../core/music-theory.js';
import { getColorForPitch } from '../utils/overlay-utils.js';

/**
 * Draw guitar fretboard with chord highlighted or scale overlay
 */
export function drawGuitar(canvasId, chord, options = {}) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    canvas.width = 1050;
    canvas.height = 320;

    const fretWidth = 70;
    const stringSpacing = 35;
    const numFrets = 12;
    const startX = 50;
    const startY = 20;

    const chordMidiNotes = chord.notes.map(noteToMidi);

    // Check if we're in overlay mode
    const { primaryScale, overlayScales = [] } = options;
    const hasOverlays = overlayScales.length > 0;

    // Find chord shape on guitar (or scale notes if in overlay mode)
    const chordShape = hasOverlays
        ? findGuitarChordShape(chord.notes, primaryScale, overlayScales)
        : findGuitarChordShape(chord.notes);

    // Draw frets
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    for (let i = 0; i <= numFrets; i++) {
        const x = startX + i * fretWidth;
        const lineWidth = i === 0 ? 4 : 1;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + stringSpacing * 5);
        ctx.stroke();
    }

    // Draw strings
    ctx.strokeStyle = '#666';
    for (let i = 0; i < 6; i++) {
        const y = startY + i * stringSpacing;
        ctx.lineWidth = 1 + (5 - i) * 0.3;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + numFrets * fretWidth, y);
        ctx.stroke();

        // String names
        ctx.fillStyle = '#666';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(GUITAR_TUNING[i], startX - 10, y + 5);
    }

    // Draw fret markers
    const fretMarkers = [3, 5, 7, 9, 12];
    ctx.fillStyle = '#ddd';
    fretMarkers.forEach(fret => {
        const x = startX + (fret - 0.5) * fretWidth;
        const y = startY + stringSpacing * 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw chord shape
    chordShape.forEach(({ string, fret, degree, color: shapeColor }) => {
        const y = startY + string * stringSpacing;
        const color = shapeColor || getDegreeColor(degree); // Use shape color if provided (overlay mode)
        let x;

        if (fret === 0) {
            // Open string - draw at the nut
            x = startX - 20;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();

            // In overlay mode, don't show degree label
            if (!hasOverlays && degree) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(degree, x, y);
            }
        } else {
            // Fretted note - draw between frets
            x = startX + (fret - 0.5) * fretWidth;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();

            // In overlay mode, don't show degree label
            if (!hasOverlays && degree) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(degree, x, y);
            }
        }
    });

    // Draw legend
    const legendX = startX + numFrets * fretWidth + 50;
    const legendY = startY + 20;
    const legendSpacing = 30;

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText('Legend:', legendX, legendY);

    const legendItems = [
        { degree: '1', label: 'Root' },
        { degree: '3', label: '3rd' },
        { degree: 'b3', label: 'b3rd' },
        { degree: '5', label: '5th' },
        { degree: 'b5', label: 'b5th' },
        { degree: '#5', label: '#5th' },
        { degree: '6', label: '6th' },
        { degree: '7', label: 'Maj7' },
        { degree: 'b7', label: 'Min7' }
    ];

    legendItems.forEach((item, i) => {
        const y = legendY + 20 + i * legendSpacing;

        ctx.fillStyle = getDegreeColor(item.degree);
        ctx.beginPath();
        ctx.arc(legendX + 10, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#333';
        ctx.font = '13px sans-serif';
        ctx.fillText(item.label, legendX + 25, y + 4);
    });

    // Update info text
    const infoElement = document.getElementById(canvasId.replace('Canvas', 'Info'));
    if (infoElement) {
        if (hasOverlays) {
            const scaleCount = overlayScales.filter(s => s.visible).length + 1;
            infoElement.textContent = `Showing ${scaleCount} scale${scaleCount > 1 ? 's' : ''} across fretboard - Colors blend where scales overlap`;
        } else {
            infoElement.textContent = `${chord.name} - All chord tones across the fretboard`;
        }
    }
}

/**
 * Find all chord tones (or scale notes in overlay mode) across the fretboard
 */
function findGuitarChordShape(noteNames, primaryScale = null, overlayScales = []) {
    const shape = [];
    const chordMidiNotes = noteNames.map(noteToMidi);
    const numFrets = 12;

    const hasOverlays = overlayScales && overlayScales.length > 0;

    // For each string, find all frets that contain a chord note (or scale note in overlay mode)
    GUITAR_TUNING.forEach((stringNote, stringIndex) => {
        const openStringMidi = noteToMidi(stringNote);

        for (let fret = 0; fret <= numFrets; fret++) {
            const noteMidi = openStringMidi + fret;
            const pitchClass = noteMidi % 12;

            if (hasOverlays) {
                // In overlay mode, show all notes from all visible scales
                const color = getColorForPitch(pitchClass, primaryScale, overlayScales);

                // Only show if this pitch is in at least one scale (not gray)
                if (color !== '#EEEEEE') {
                    shape.push({ string: stringIndex, fret, degree: null, color });
                }
            } else {
                // Normal mode: only show chord tones
                const noteInChord = chordMidiNotes.some(chordNote =>
                    pitchClass === (chordNote % 12)
                );

                if (noteInChord) {
                    const degree = getChordDegree(noteMidi, chordMidiNotes);
                    shape.push({ string: stringIndex, fret, degree });
                }
            }
        }
    });

    return shape;
}
