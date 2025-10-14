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
                    primaryFunction: getFunctionDescription(primaryKey, primaryScale),
                    secondaryFunction: getFunctionDescription(secondaryKey, secondaryScale),
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
function getFunctionDescription(chordKey, scaleType) {
    // Map chord positions to functional descriptions
    const isMajor = scaleType === 'major';

    // Get degree number from the chord name
    // This is a simplified approach - in a real implementation,
    // we'd parse the Roman numeral more carefully
    const degreeNames = {
        0: { major: 'Tonic (I)', minor: 'Tonic (i)' },
        1: { major: 'Supertonic (ii)', minor: 'Supertonic (ii°)' },
        2: { major: 'Mediant (iii)', minor: 'Mediant (III)' },
        3: { major: 'Subdominant (IV)', minor: 'Subdominant (iv)' },
        4: { major: 'Dominant (V)', minor: 'Dominant (v)' },
        5: { major: 'Submediant (vi)', minor: 'Submediant (VI)' },
        6: { major: 'Leading Tone (vii°)', minor: 'Subtonic (VII)' }
    };

    // For now, return the chord key itself as the function
    // In a more sophisticated version, we'd map this properly
    return chordKey;
}

/**
 * Analyze the quality of a pivot chord for modulation
 * Returns a score from 0-10 indicating how smooth the modulation would be
 */
export function analyzePivotQuality(pivotChord, primaryScale, secondaryScale) {
    let score = 5; // Base score

    // Check if it's a dominant function in either key (stronger pivot)
    if (pivotChord.primaryFunction.includes('V') ||
        pivotChord.secondaryFunction.includes('V')) {
        score += 2;
    }

    // Check if it's a subdominant function (also good for pivoting)
    if (pivotChord.primaryFunction.includes('IV') ||
        pivotChord.secondaryFunction.includes('IV')) {
        score += 1;
    }

    // Check if it's a tonic in either key (weaker pivot)
    if (pivotChord.primaryFunction.includes('I') ||
        pivotChord.secondaryFunction.includes('I')) {
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
