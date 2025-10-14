/**
 * Musical Staff Visualization
 *
 * Renders chords on a treble clef staff with proper notation
 */

// Note positions on treble clef - shared constant
const STAFF_NOTE_POSITIONS = {
    'B3': 6, 'C4': 5, 'Db4': 5, 'C#4': 5, 'D4': 4.5, 'Eb4': 4, 'D#4': 4, 'E4': 4,
    'F4': 3.5, 'Gb4': 3, 'F#4': 3, 'G4': 3, 'Ab4': 2.5, 'G#4': 2.5, 'A4': 2.5,
    'Bb4': 2, 'A#4': 2, 'B4': 2,
    'C5': 1.5, 'Db5': 1, 'C#5': 1, 'D5': 1, 'Eb5': 0.5, 'D#5': 0.5, 'E5': 0.5,
    'F5': 0, 'Gb5': -0.5, 'F#5': -0.5, 'G5': -0.5, 'Ab5': -1, 'G#5': -1, 'A5': -1,
    'Bb5': -1.5, 'A#5': -1.5, 'B5': -1.5, 'C6': -2
};

/**
 * Draw a complete staff with a chord
 */
export function drawStaff(canvasId, chord) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 200;

    const lineSpacing = 15;
    const startX = 80;
    const startY = 60;

    // Draw staff lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const y = startY + i * lineSpacing;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + 450, y);
        ctx.stroke();
    }

    // Draw treble clef
    drawTrebleClef(ctx, startX - 40, startY);

    // Calculate all note positions first to find the lowest text position
    const noteX = startX + 100;

    // Find the maximum textY (lowest visual position on canvas)
    let maxTextY = startY + 4 * lineSpacing + 40; // Start with minimum position
    chord.notes.forEach((noteName) => {
        const position = STAFF_NOTE_POSITIONS[noteName];
        if (position !== undefined) {
            const y = startY + position * lineSpacing;
            const textY = Math.max(y + 50, startY + 4 * lineSpacing + 40);
            maxTextY = Math.max(maxTextY, textY);
        }
    });

    // Draw notes with aligned text position
    chord.notes.forEach((noteName, index) => {
        drawNote(ctx, noteX + index * 70, startY, noteName, lineSpacing, maxTextY);
    });

    // Update info text
    const infoElement = document.getElementById(canvasId.replace('Canvas', 'Info'));
    if (infoElement) {
        infoElement.textContent = `${chord.name} - Treble clef notation`;
    }
}

/**
 * Draw a simplified treble clef
 */
function drawTrebleClef(ctx, x, y) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.font = 'bold 80px serif';
    ctx.fillStyle = '#333';
    ctx.fillText('𝄞', x, y + 55);
}

/**
 * Draw a note on the staff
 */
function drawNote(ctx, x, baseY, noteName, lineSpacing, alignedTextY = null) {
    // Note positions on treble clef (middle C is C4)
    // Lines from bottom to top: E4, G4, B4, D5, F5
    // Position 0 = top line (F5), position 4 = bottom line (E4)
    const position = STAFF_NOTE_POSITIONS[noteName];
    if (position === undefined) return;

    const y = baseY + position * lineSpacing;

    // Check for accidentals
    const hasFlat = noteName.includes('b') && noteName.length > 2;
    const hasSharp = noteName.includes('#');

    // Draw accidental if present
    if (hasFlat) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♭', x - 20, y);
    } else if (hasSharp) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 20px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♯', x - 20, y);
    }

    // Draw note head
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 8, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw stem
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 9, y);
    ctx.lineTo(x + 9, y - 40);
    ctx.stroke();

    // Draw ledger lines if needed (for notes outside staff)
    if (position > 4) {
        // Below staff (C4 and lower)
        for (let i = 5; i <= position; i += 1) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const ledgerY = baseY + i * lineSpacing;
            ctx.moveTo(x - 15, ledgerY);
            ctx.lineTo(x + 15, ledgerY);
            ctx.stroke();
        }
    }

    if (position < 0) {
        // Above staff (G5 and higher)
        for (let i = 0; i >= position; i -= 1) {
            if (i < 0) {
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.beginPath();
                const ledgerY = baseY + i * lineSpacing;
                ctx.moveTo(x - 15, ledgerY);
                ctx.lineTo(x + 15, ledgerY);
                ctx.stroke();
            }
        }
    }

    // Draw note name below with proper padding
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';  // Ensure consistent vertical alignment
    // Use aligned position if provided, otherwise calculate individual position
    const textY = alignedTextY !== null ? alignedTextY : Math.max(y + 50, baseY + 4 * lineSpacing + 40);
    ctx.fillText(noteName, x, textY);
}
