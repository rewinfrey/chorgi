/**
 * Related Keys Finder
 *
 * Finds musically related scales for comparison and modulation
 */

import { NOTE_TO_MIDI } from '../core/music-theory.js';

// Chromatic scale starting from C
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Get a note by semitone offset from a root note
 */
function getNoteByInterval(rootNote, semitones) {
    const rootIndex = NOTE_TO_MIDI[rootNote];
    // Handle negative intervals correctly (JavaScript modulo can return negative numbers)
    const targetIndex = ((rootIndex + semitones) % 12 + 12) % 12;
    return CHROMATIC_NOTES[targetIndex];
}

/**
 * Get the relative key (relative major/minor)
 * - For major scales, relative minor is 3 semitones down
 * - For minor scales, relative major is 3 semitones up
 */
function getRelativeKey(root, scaleType) {
    const isMajor = scaleType === 'major';
    const isMinor = scaleType.includes('minor');

    if (isMajor) {
        // Relative minor is a minor 3rd down (3 semitones)
        const relativeRoot = getNoteByInterval(root, -3);
        return { root: relativeRoot, scaleType: 'natural_minor', relationship: 'Relative Minor' };
    } else if (isMinor) {
        // Relative major is a minor 3rd up (3 semitones)
        const relativeRoot = getNoteByInterval(root, 3);
        return { root: relativeRoot, scaleType: 'major', relationship: 'Relative Major' };
    }

    return null;
}

/**
 * Get the parallel key (same root, different mode)
 * - For major scales, parallel minor is same root with minor scale
 * - For minor scales, parallel major is same root with major scale
 */
function getParallelKey(root, scaleType) {
    const isMajor = scaleType === 'major';
    const isMinor = scaleType.includes('minor');

    if (isMajor) {
        return { root, scaleType: 'natural_minor', relationship: 'Parallel Minor' };
    } else if (isMinor) {
        return { root, scaleType: 'major', relationship: 'Parallel Major' };
    }

    return null;
}

/**
 * Get the dominant key (5th degree up)
 * Key a perfect 5th above (7 semitones)
 */
function getDominantKey(root, scaleType) {
    const dominantRoot = getNoteByInterval(root, 7);
    return { root: dominantRoot, scaleType, relationship: 'Dominant (V)' };
}

/**
 * Get the subdominant key (4th degree up)
 * Key a perfect 4th above (5 semitones)
 */
function getSubdominantKey(root, scaleType) {
    const subdominantRoot = getNoteByInterval(root, 5);
    return { root: subdominantRoot, scaleType, relationship: 'Subdominant (IV)' };
}

/**
 * Find all related keys for a given scale
 * Returns an array of related key objects with relationship labels
 */
export function findRelatedKeys(root, scaleType) {
    const relatedKeys = [];

    // Relative key (shares key signature)
    const relative = getRelativeKey(root, scaleType);
    if (relative) relatedKeys.push(relative);

    // Parallel key (same root, different mode)
    const parallel = getParallelKey(root, scaleType);
    if (parallel) relatedKeys.push(parallel);

    // Dominant key (V)
    relatedKeys.push(getDominantKey(root, scaleType));

    // Subdominant key (IV)
    relatedKeys.push(getSubdominantKey(root, scaleType));

    // If major, also include dominant minor and subdominant minor
    if (scaleType === 'major') {
        const dominantMinor = getDominantKey(root, 'natural_minor');
        dominantMinor.relationship = 'Dominant Minor (v)';
        relatedKeys.push(dominantMinor);

        const subdominantMinor = getSubdominantKey(root, 'natural_minor');
        subdominantMinor.relationship = 'Subdominant Minor (iv)';
        relatedKeys.push(subdominantMinor);
    }

    return relatedKeys;
}

/**
 * Get a human-readable description of the relationship
 */
export function getRelationshipDescription(relationship) {
    const descriptions = {
        'Relative Minor': 'Shares the same key signature',
        'Relative Major': 'Shares the same key signature',
        'Parallel Minor': 'Same root note, different mode',
        'Parallel Major': 'Same root note, different mode',
        'Dominant (V)': 'Fifth degree - creates tension',
        'Subdominant (IV)': 'Fourth degree - pre-dominant function',
        'Dominant Minor (v)': 'Minor dominant - modal mixture',
        'Subdominant Minor (iv)': 'Minor subdominant - borrowed chord'
    };

    return descriptions[relationship] || '';
}
