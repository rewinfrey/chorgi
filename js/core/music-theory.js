/**
 * Music Theory Core Library
 *
 * Pure functions for music theory calculations:
 * - Note/MIDI conversions
 * - Scale generation
 * - Chord construction
 * - Interval calculations
 */

// ===== CONSTANTS =====

// Note to MIDI number mapping (C4 = middle C = 60)
export const NOTE_TO_MIDI = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
    'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// Scale definitions (intervals in semitones from root)
export const SCALES = {
    'major': {
        name: 'Major',
        intervals: [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
        chordQualities: ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'm7b5']
    },
    'natural_minor': {
        name: 'Natural Minor',
        intervals: [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
        chordQualities: ['min7', 'm7b5', 'maj7', 'min7', 'min7', 'maj7', 'dom7']
    },
    'harmonic_minor': {
        name: 'Harmonic Minor',
        intervals: [0, 2, 3, 5, 7, 8, 11], // W-H-W-W-H-1.5-H
        chordQualities: ['minMaj7', 'm7b5', 'maj7#5', 'min7', 'dom7', 'maj7', 'dim7']
    },
    'melodic_minor': {
        name: 'Melodic Minor',
        intervals: [0, 2, 3, 5, 7, 9, 11], // W-H-W-W-W-W-H
        chordQualities: ['minMaj7', 'min7', 'maj7#5', 'dom7', 'dom7', 'm7b5', 'm7b5']
    }
};

// Chord quality definitions
export const CHORD_QUALITY_INTERVALS = {
    'maj7': [0, 4, 7, 11],      // Major 7th
    'min7': [0, 3, 7, 10],      // Minor 7th
    'dom7': [0, 4, 7, 10],      // Dominant 7th
    'm7b5': [0, 3, 6, 10],      // Half-diminished 7th
    'minMaj7': [0, 3, 7, 11],   // Minor-Major 7th
    'maj7#5': [0, 4, 8, 11],    // Major 7th #5
    'dim7': [0, 3, 6, 9]        // Diminished 7th
};

// Chord quality display names
export const CHORD_QUALITY_NAMES = {
    'maj7': 'Major 7',
    'min7': 'Minor 7',
    'dom7': 'Dominant 7',
    'm7b5': 'Half-Diminished 7',
    'minMaj7': 'Minor-Major 7',
    'maj7#5': 'Major 7 #5',
    'dim7': 'Diminished 7'
};

// Roman numeral notation
export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Guitar string tuning (standard tuning - high E to low E)
export const GUITAR_TUNING = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];

// ===== HELPER FUNCTIONS =====

/**
 * Get proper note name (prefers flats for minor scales)
 */
export function getNoteName(midiClass, preferFlats = false) {
    const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    return preferFlats ? flatNames[midiClass % 12] : sharpNames[midiClass % 12];
}

/**
 * Convert note name with octave to MIDI number
 */
export function noteToMidi(noteName) {
    const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
    if (!match) return null;
    const [, note, octave] = match;
    return NOTE_TO_MIDI[note] + (parseInt(octave) + 1) * 12;
}

/**
 * Convert MIDI number to note name
 */
export function midiToNoteName(midi, useFlats = false) {
    const noteNames = useFlats
        ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
        : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return noteNames[noteIndex] + octave;
}

// ===== CHORD GENERATION =====

/**
 * Generate diatonic chords for a scale
 */
export function generateDiatonicChords(rootNote, scaleType) {
    const scale = SCALES[scaleType];
    const chords = {};
    const rootMidi = NOTE_TO_MIDI[rootNote];

    // Use flats for minor scales
    const preferFlats = scaleType.includes('minor');

    scale.intervals.forEach((interval, degreeIndex) => {
        const chordRootMidi = rootMidi + interval;
        const chordRootNote = getNoteName(chordRootMidi % 12, preferFlats);

        const quality = scale.chordQualities[degreeIndex];
        const intervals = CHORD_QUALITY_INTERVALS[quality];

        // Generate chord notes (4 octave for root, adjust for higher notes)
        const notes = intervals.map((int, idx) => {
            const noteMidi = chordRootMidi + int;
            const octave = 4 + Math.floor((interval + int) / 12);
            const noteClass = noteMidi % 12;
            const noteName = getNoteName(noteClass, preferFlats);
            return `${noteName}${octave}`;
        });

        // Create chord key and roman numeral
        const roman = ROMAN_NUMERALS[degreeIndex];
        const romanNumeral = quality.includes('min') || quality.includes('dim') || quality === 'm7b5'
            ? roman.toLowerCase()
            : roman;

        const chordSymbol = quality === 'maj7' ? `${chordRootNote}maj7` :
                           quality === 'min7' ? `${chordRootNote}m7` :
                           quality === 'dom7' ? `${chordRootNote}7` :
                           quality === 'm7b5' ? `${chordRootNote}m7b5` :
                           quality === 'minMaj7' ? `${chordRootNote}mMaj7` :
                           quality === 'maj7#5' ? `${chordRootNote}maj7#5` :
                           quality === 'dim7' ? `${chordRootNote}dim7` :
                           chordRootNote;

        chords[chordSymbol] = {
            name: `${chordRootNote} ${CHORD_QUALITY_NAMES[quality]}`,
            notes: notes,
            type: quality,
            roman: romanNumeral + (quality === 'dom7' ? '7' :
                                   quality === 'maj7' ? 'maj7' :
                                   quality === 'm7b5' ? 'm7b5' :
                                   quality === 'minMaj7' ? 'mMaj7' :
                                   quality === 'maj7#5' ? 'maj7#5' :
                                   quality === 'dim7' ? 'dim7' : 'm7')
        };
    });

    return chords;
}

/**
 * Get the scale degree of a note within a chord (1, 3, 5, etc.)
 */
export function getChordDegree(noteMidi, chordMidiNotes) {
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
        8: '#5',  // Augmented fifth
        9: '6',   // Major sixth / Diminished seventh
        10: 'b7', // Minor seventh
        11: '7'   // Major seventh
    };

    return degreeMap[interval] || '?';
}

/**
 * Get color for chord degree (for visualizations)
 */
export function getDegreeColor(degree) {
    const colorMap = {
        '1': '#667eea',    // Root - purple
        '3': '#f093fb',    // Major third - pink
        'b3': '#f093fb',   // Minor third - pink
        '5': '#4facfe',    // Perfect fifth - blue
        'b5': '#43e97b',   // Diminished fifth - green
        '#5': '#38ada9',   // Augmented fifth - teal
        '6': '#fa709a',    // Sixth - coral
        'b7': '#fee140',   // Minor seventh - yellow
        '7': '#feca57'     // Major seventh - gold
    };
    return colorMap[degree] || '#999';
}
