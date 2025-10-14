/**
 * Pivot Chord Finder
 *
 * Identifies common chords between two scales for smooth modulation
 */

import { generateDiatonicChords, noteToMidi } from '../core/music-theory.js';

/**
 * Normalize chord notes to a set of pitch classes (0-11)
 * This allows us to compare chords regardless of octave
 */
function normalizeChordNotes(chord) {
    return new Set(chord.notes.map(note => {
        const midi = noteToMidi(note);
        return midi % 12;
    }));
}

/**
 * Check if two chords have the same notes (enharmonically equivalent)
 */
function areChordsEquivalent(chord1, chord2) {
    const notes1 = normalizeChordNotes(chord1);
    const notes2 = normalizeChordNotes(chord2);

    if (notes1.size !== notes2.size) return false;

    for (const note of notes1) {
        if (!notes2.has(note)) return false;
    }

    return true;
}

/**
 * Get the Roman numeral analysis for a chord in a scale
 */
function getRomanNumeral(chordKey) {
    // Extract the degree number from chord keys like "I", "ii", "iii", etc.
    const romanNumerals = {
        'I': 'I',
        'ii': 'ii',
        'iii': 'iii',
        'IV': 'IV',
        'V': 'V',
        'vi': 'vi',
        'vii°': 'vii°'
    };

    // Find matching roman numeral (chord keys are like "Cmaj7", "Dm7", etc.)
    // We'll use the position in the diatonic sequence
    const degreeMap = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

    return chordKey;
}

/**
 * Find pivot chords between two scales
 * Returns an array of pivot chord objects with context in both keys
 */
export function findPivotChords(primaryRoot, primaryScale, secondaryRoot, secondaryScale) {
    const primaryChords = generateDiatonicChords(primaryRoot, primaryScale);
    const secondaryChords = generateDiatonicChords(secondaryRoot, secondaryScale);

    const pivotChords = [];

    // Compare each chord from primary scale with each chord from secondary scale
    Object.entries(primaryChords).forEach(([primaryKey, primaryChord]) => {
        Object.entries(secondaryChords).forEach(([secondaryKey, secondaryChord]) => {
            if (areChordsEquivalent(primaryChord, secondaryChord)) {
                pivotChords.push({
                    chordName: primaryKey,  // Use the actual chord name (like "Am7")
                    primaryKey: primaryKey,
                    secondaryKey: secondaryKey,
                    primaryFunction: getFunctionDescription(primaryKey, primaryRoot, primaryScale),
                    secondaryFunction: getFunctionDescription(secondaryKey, secondaryRoot, secondaryScale),
                    notes: primaryChord.notes,
                    intervals: primaryChord.intervals
                });
            }
        });
    });

    return pivotChords;
}

/**
 * Get a functional description of a chord based on its position
 */
function getFunctionDescription(chordKey, scaleRoot, scaleType) {
    const isMajor = scaleType === 'major';

    // Get all chords in this scale to find the position of our chord
    const chords = generateDiatonicChords(scaleRoot, scaleType);

    // Find which degree this chord is in the scale by matching the chord key
    const chordEntries = Object.entries(chords);
    let degreeIndex = -1;

    for (let i = 0; i < chordEntries.length; i++) {
        const [key, chord] = chordEntries[i];
        if (key === chordKey) {
            degreeIndex = i;
            break;
        }
    }

    if (degreeIndex === -1) {
        return chordKey; // Fallback if not found
    }

    // Map degree to functional description
    const degreeNames = {
        0: { major: 'Tonic (I)', minor: 'Tonic (i)' },
        1: { major: 'Supertonic (ii)', minor: 'Supertonic (ii°)' },
        2: { major: 'Mediant (iii)', minor: 'Mediant (III)' },
        3: { major: 'Subdominant (IV)', minor: 'Subdominant (iv)' },
        4: { major: 'Dominant (V)', minor: 'Dominant (v)' },
        5: { major: 'Submediant (vi)', minor: 'Submediant (VI)' },
        6: { major: 'Leading Tone (vii°)', minor: 'Subtonic (VII)' }
    };

    const mode = isMajor ? 'major' : 'minor';
    return degreeNames[degreeIndex]?.[mode] || chordKey;
}

/**
 * Analyze the quality of a pivot chord for modulation
 * Returns a score from 0-10 indicating how smooth the modulation would be
 */
export function analyzePivotQuality(pivotChord, primaryScale, secondaryScale) {
    let score = 5; // Base score

    const primaryFunc = pivotChord.primaryFunction;
    const secondaryFunc = pivotChord.secondaryFunction;

    // Check if it's a dominant function in either key (stronger pivot)
    // Look for "(V)" specifically to avoid matching "IV" or "VII"
    if (primaryFunc.includes('(V)') || secondaryFunc.includes('(V)')) {
        score += 3;
    }

    // Check if it's a subdominant function (also good for pivoting)
    if (primaryFunc.includes('(IV)') || secondaryFunc.includes('(IV)')) {
        score += 2;
    }

    // Check for supertonic function (pre-dominant)
    if (primaryFunc.includes('(ii)') || secondaryFunc.includes('(ii)')) {
        score += 1;
    }

    // Check if it's a tonic in either key (weaker pivot)
    // Look for "(I)" at the end to avoid matching other numerals
    if (primaryFunc.includes('(I)') || secondaryFunc.includes('(I)') ||
        primaryFunc.includes('(i)') || secondaryFunc.includes('(i)')) {
        score -= 1;
    }

    // Ensure score stays within 0-10 range
    return Math.max(0, Math.min(10, score));
}

/**
 * Get modulation suggestions with ranked pivot chords
 */
export function getSuggestedModulations(primaryRoot, primaryScale, secondaryRoot, secondaryScale) {
    const pivotChords = findPivotChords(primaryRoot, primaryScale, secondaryRoot, secondaryScale);

    // Analyze and rank each pivot chord
    const rankedPivots = pivotChords.map(pivot => ({
        ...pivot,
        quality: analyzePivotQuality(pivot, primaryScale, secondaryScale)
    }));

    // Sort by quality (highest first)
    rankedPivots.sort((a, b) => b.quality - a.quality);

    return rankedPivots;
}
