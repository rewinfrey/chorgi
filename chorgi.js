// Music Theory Data Structures

// Note to MIDI number mapping (C4 = middle C = 60)
const NOTE_TO_MIDI = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// C Major Scale Diatonic Chords (with 7ths)
const DIATONIC_CHORDS = {
    'Cmaj7': { name: 'C Major 7', notes: ['C4', 'E4', 'G4', 'B4'], type: 'maj7', roman: 'Imaj7' },
    'Dm7': { name: 'D Minor 7', notes: ['D4', 'F4', 'A4', 'C5'], type: 'min7', roman: 'iim7' },
    'Em7': { name: 'E Minor 7', notes: ['E4', 'G4', 'B4', 'D5'], type: 'min7', roman: 'iiim7' },
    'Fmaj7': { name: 'F Major 7', notes: ['F4', 'A4', 'C5', 'E5'], type: 'maj7', roman: 'IVmaj7' },
    'G7': { name: 'G Dominant 7', notes: ['G4', 'B4', 'D5', 'F5'], type: 'dom7', roman: 'V7' },
    'Am7': { name: 'A Minor 7', notes: ['A4', 'C5', 'E5', 'G5'], type: 'min7', roman: 'vim7' },
    'Bm7b5': { name: 'B Half-Diminished 7', notes: ['B4', 'D5', 'F5', 'A5'], type: 'm7b5', roman: 'viim7b5' }
};

// Guitar string tuning (standard tuning - high E to low E)
const GUITAR_TUNING = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];

// Convert note name with octave to MIDI number
function noteToMidi(noteName) {
    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return null;
    const [, note, octave] = match;
    return NOTE_TO_MIDI[note] + (parseInt(octave) + 1) * 12;
}

// Convert MIDI number to note name
function midiToNoteName(midi, useFlats = false) {
    const noteNames = useFlats
        ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
        : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return noteNames[noteIndex] + octave;
}

// Application State
let currentChord = 'Cmaj7';

// Initialize the application
function init() {
    createChordButtons();
    updateVisualizations();
}

// Create chord selection buttons
function createChordButtons() {
    const buttonsContainer = document.getElementById('chordButtons');

    Object.keys(DIATONIC_CHORDS).forEach(chordKey => {
        const chord = DIATONIC_CHORDS[chordKey];
        const button = document.createElement('button');
        button.className = 'chord-btn';
        button.textContent = chord.name;
        button.dataset.chord = chordKey;

        if (chordKey === currentChord) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => selectChord(chordKey));
        buttonsContainer.appendChild(button);
    });
}

// Handle chord selection
function selectChord(chordKey) {
    currentChord = chordKey;

    // Update active button
    document.querySelectorAll('.chord-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.chord === chordKey);
    });

    updateVisualizations();
}

// Update all visualizations
function updateVisualizations() {
    drawPiano();
    drawGuitar();
    drawStaff();
}

// ===== PIANO ROLL VISUALIZATION =====
function drawPiano() {
    const canvas = document.getElementById('pianoCanvas');
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
    const blackKeys = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

    const chord = DIATONIC_CHORDS[currentChord];
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
    document.getElementById('pianoInfo').textContent =
        `${chord.name} (${chord.roman}) - Notes: ${chord.notes.join(', ')}`;
}

// ===== GUITAR FRETBOARD VISUALIZATION =====
function drawGuitar() {
    const canvas = document.getElementById('guitarCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1050;
    canvas.height = 280;

    const fretWidth = 70;
    const stringSpacing = 35;
    const numFrets = 12;
    const startX = 50;
    const startY = 20;

    const chord = DIATONIC_CHORDS[currentChord];
    const chordMidiNotes = chord.notes.map(noteToMidi);

    // Find chord shape on guitar (simple algorithm - first position)
    const chordShape = findGuitarChordShape(chord.notes);

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
    chordShape.forEach(({ string, fret, degree }) => {
        const y = startY + string * stringSpacing;
        const color = getDegreeColor(degree);
        let x;

        if (fret === 0) {
            // Open string - draw at the nut
            x = startX - 20;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(degree, x, y);
        } else {
            // Fretted note - draw between frets
            x = startX + (fret - 0.5) * fretWidth;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(degree, x, y);
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

    document.getElementById('guitarInfo').textContent =
        `${chord.name} - All chord tones across the fretboard`;
}

// Get the scale degree of a note within a chord (1, 3, 5, etc.)
function getChordDegree(noteMidi, chordMidiNotes) {
    const rootMidi = chordMidiNotes[0];
    const noteClass = noteMidi % 12;
    const rootClass = rootMidi % 12;

    // Calculate interval in semitones
    let interval = (noteClass - rootClass + 12) % 12;

    // Map interval to chord degree
    const degreeMap = {
        0: '1',   // Root
        3: 'b3',  // Minor third
        4: '3',   // Major third
        6: 'b5',  // Diminished fifth
        7: '5',   // Perfect fifth
        9: '6',   // Major sixth
        10: 'b7', // Minor seventh
        11: '7'   // Major seventh
    };

    return degreeMap[interval] || '?';
}

// Find all chord tones across the fretboard
function findGuitarChordShape(noteNames) {
    const shape = [];
    const chordMidiNotes = noteNames.map(noteToMidi);
    const numFrets = 12;

    // For each string, find all frets that contain a chord note
    GUITAR_TUNING.forEach((stringNote, stringIndex) => {
        const openStringMidi = noteToMidi(stringNote);

        for (let fret = 0; fret <= numFrets; fret++) {
            const noteMidi = openStringMidi + fret;
            const noteInChord = chordMidiNotes.some(chordNote =>
                (noteMidi % 12) === (chordNote % 12)
            );

            if (noteInChord) {
                const degree = getChordDegree(noteMidi, chordMidiNotes);
                shape.push({ string: stringIndex, fret, degree });
            }
        }
    });

    return shape;
}

// Get color for chord degree
function getDegreeColor(degree) {
    const colorMap = {
        '1': '#667eea',    // Root - purple
        '3': '#f093fb',    // Major third - pink
        'b3': '#f093fb',   // Minor third - pink
        '5': '#4facfe',    // Perfect fifth - blue
        'b5': '#43e97b',   // Diminished fifth - green
        '6': '#fa709a',    // Sixth - coral
        'b7': '#fee140',   // Minor seventh - yellow
        '7': '#feca57'     // Major seventh - gold
    };
    return colorMap[degree] || '#999';
}

// ===== MUSIC STAFF VISUALIZATION =====
function drawStaff() {
    const canvas = document.getElementById('staffCanvas');
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

    const chord = DIATONIC_CHORDS[currentChord];

    // Draw notes
    const noteX = startX + 100;
    chord.notes.forEach((noteName, index) => {
        drawNote(ctx, noteX + index * 70, startY, noteName, lineSpacing);
    });

    document.getElementById('staffInfo').textContent =
        `${chord.name} - Treble clef notation`;
}

// Draw a simplified treble clef
function drawTrebleClef(ctx, x, y) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.font = 'bold 80px serif';
    ctx.fillStyle = '#333';
    ctx.fillText('𝄞', x, y + 55);
}

// Draw a note on the staff
function drawNote(ctx, x, baseY, noteName, lineSpacing) {
    // Note positions on treble clef (middle C is C4)
    // Lines from bottom to top: E4, G4, B4, D5, F5
    // Position 0 = top line (F5), position 4 = bottom line (E4)
    const notePositions = {
        'B3': 6, 'C4': 5, 'D4': 4.5, 'E4': 4, 'F4': 3.5, 'G4': 3, 'A4': 2.5, 'B4': 2,
        'C5': 1.5, 'D5': 1, 'E5': 0.5, 'F5': 0, 'G5': -0.5, 'A5': -1, 'B5': -1.5, 'C6': -2
    };

    const position = notePositions[noteName];
    if (position === undefined) return;

    const y = baseY + position * lineSpacing;

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

    // Draw note name below
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(noteName, x, baseY + 90);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
