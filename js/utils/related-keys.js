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
 * Find all related keys for a given scale (complete list)
 * Returns an array of related key objects with relationship labels and popularity
 */
export function findRelatedKeys(root, scaleType) {
    const relatedKeys = [];
    const isMajor = scaleType === 'major';

    // VERY COMMON RELATIONSHIPS (popularity: high)

    // 1. Relative key (shares key signature)
    const relative = getRelativeKey(root, scaleType);
    if (relative) {
        relative.popularity = 'high';
        relatedKeys.push(relative);
    }

    // 2. Parallel key (same root, different mode)
    const parallel = getParallelKey(root, scaleType);
    if (parallel) {
        parallel.popularity = 'high';
        relatedKeys.push(parallel);
    }

    // 3. Dominant key (V)
    const dominant = getDominantKey(root, scaleType);
    dominant.popularity = 'high';
    relatedKeys.push(dominant);

    // 4. Subdominant key (IV)
    const subdominant = getSubdominantKey(root, scaleType);
    subdominant.popularity = 'high';
    relatedKeys.push(subdominant);

    // 5. Dominant minor (v) - for major keys only
    if (isMajor) {
        const dominantMinor = getDominantKey(root, 'natural_minor');
        dominantMinor.relationship = 'Dominant Minor (v)';
        dominantMinor.popularity = 'high';
        relatedKeys.push(dominantMinor);
    }

    // 6. Subdominant minor (iv) - for major keys only
    if (isMajor) {
        const subdominantMinor = getSubdominantKey(root, 'natural_minor');
        subdominantMinor.relationship = 'Subdominant Minor (iv)';
        subdominantMinor.popularity = 'high';
        relatedKeys.push(subdominantMinor);
    }

    // COMMON RELATIONSHIPS (popularity: medium)

    // Supertonic (II/ii)
    const supertonic = getNoteByInterval(root, 2);
    relatedKeys.push({
        root: supertonic,
        scaleType: isMajor ? 'major' : 'natural_minor',
        relationship: isMajor ? 'Supertonic (II)' : 'Supertonic (ii)',
        popularity: 'medium'
    });

    // Mediant (III/iii)
    const mediant = getNoteByInterval(root, isMajor ? 4 : 3);
    relatedKeys.push({
        root: mediant,
        scaleType: isMajor ? 'major' : 'natural_minor',
        relationship: isMajor ? 'Mediant (III)' : 'Mediant (III)',
        popularity: 'medium'
    });

    // Submediant (VI/vi)
    const submediant = getNoteByInterval(root, 9);
    relatedKeys.push({
        root: submediant,
        scaleType: isMajor ? 'major' : 'natural_minor',
        relationship: isMajor ? 'Submediant (VI)' : 'Submediant (VI)',
        popularity: 'medium'
    });

    // For major keys: add minor versions of diatonic degrees
    if (isMajor) {
        // Supertonic minor (ii)
        relatedKeys.push({
            root: supertonic,
            scaleType: 'natural_minor',
            relationship: 'Supertonic Minor (ii)',
            popularity: 'medium'
        });

        // Mediant minor (iii)
        const mediantMinor = getNoteByInterval(root, 4);
        relatedKeys.push({
            root: mediantMinor,
            scaleType: 'natural_minor',
            relationship: 'Mediant Minor (iii)',
            popularity: 'medium'
        });

        // Submediant minor (vi) - already covered as relative
    }

    // UNCOMMON RELATIONSHIPS (popularity: low)

    // Chromatic mediant (bIII/bVI for major)
    if (isMajor) {
        const flatMediant = getNoteByInterval(root, 3);
        relatedKeys.push({
            root: flatMediant,
            scaleType: 'major',
            relationship: 'Chromatic Mediant (♭III)',
            popularity: 'low'
        });

        const flatSubmediant = getNoteByInterval(root, 8);
        relatedKeys.push({
            root: flatSubmediant,
            scaleType: 'major',
            relationship: 'Chromatic Submediant (♭VI)',
            popularity: 'low'
        });

        const flatSupertonic = getNoteByInterval(root, 1);
        relatedKeys.push({
            root: flatSupertonic,
            scaleType: 'major',
            relationship: 'Neapolitan (♭II)',
            popularity: 'low'
        });

        const flatSeventh = getNoteByInterval(root, 10);
        relatedKeys.push({
            root: flatSeventh,
            scaleType: 'major',
            relationship: 'Subtonic (♭VII)',
            popularity: 'low'
        });
    }

    // Leading tone area (vii)
    const leadingTone = getNoteByInterval(root, isMajor ? 11 : 10);
    relatedKeys.push({
        root: leadingTone,
        scaleType: 'natural_minor',
        relationship: isMajor ? 'Leading Tone (vii)' : 'Subtonic (VII)',
        popularity: 'low'
    });

    // Tritone substitution (♭V for jazz/advanced)
    const tritone = getNoteByInterval(root, 6);
    relatedKeys.push({
        root: tritone,
        scaleType: scaleType,
        relationship: 'Tritone (Augmented Fourth)',
        popularity: 'low'
    });

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
        'Subdominant Minor (iv)': 'Minor subdominant - borrowed chord',
        'Supertonic (II)': 'Second degree - secondary dominant area',
        'Supertonic (ii)': 'Second degree - pre-dominant function',
        'Supertonic Minor (ii)': 'Minor second degree - borrowed chord',
        'Mediant (III)': 'Third degree - chromatic mediant',
        'Mediant Minor (iii)': 'Minor third degree - relative to dominant',
        'Submediant (VI)': 'Sixth degree - secondary dominant',
        'Chromatic Mediant (♭III)': 'Flat third - chromatic mediant relationship',
        'Chromatic Submediant (♭VI)': 'Flat sixth - chromatic mediant relationship',
        'Neapolitan (♭II)': 'Flat second - Neapolitan relationship',
        'Subtonic (♭VII)': 'Flat seventh - modal mixture from minor',
        'Leading Tone (vii)': 'Seventh degree - diminished function',
        'Subtonic (VII)': 'Seventh degree in minor - whole step to tonic',
        'Tritone (Augmented Fourth)': 'Tritone substitution - advanced jazz technique'
    };

    return descriptions[relationship] || '';
}
