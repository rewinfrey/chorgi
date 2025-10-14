/**
 * Analysis Page Entry Point
 *
 * Handles the Key Analysis view with related keys and pivot chords
 */

import { state } from './core/state-manager.js';
import { SCALES } from './core/music-theory.js';
import { findRelatedKeys, getRelationshipDescription } from './utils/related-keys.js';
import { getSuggestedModulations } from './utils/pivot-chords.js';

/**
 * Initialize the analysis page
 */
function init() {
    setupScaleSelectors();
    updateAllComparisons();

    // Listen for state changes
    state.on('scale-changed', handleScaleChange);
}

/**
 * Setup scale selector event listeners
 */
function setupScaleSelectors() {
    const rootSelect = document.getElementById('rootSelect');
    const scaleSelect = document.getElementById('scaleSelect');

    rootSelect.addEventListener('change', () => {
        state.setScale(rootSelect.value, state.getCurrentScale().type);
    });

    scaleSelect.addEventListener('change', () => {
        state.setScale(state.getCurrentScale().root, scaleSelect.value);
    });
}

/**
 * Handle scale change event
 */
function handleScaleChange(data) {
    console.log('Scale changed:', data);
    updateAllComparisons();
}

/**
 * Update all comparisons - show all related keys with their pivot chords
 */
function updateAllComparisons() {
    const primaryScale = state.getCurrentScale();
    const relatedKeys = findRelatedKeys(primaryScale.root, primaryScale.type);
    const container = document.getElementById('allComparisonsContainer');

    container.innerHTML = '';

    relatedKeys.forEach(relatedKey => {
        // Get pivot chords for this relationship
        const pivotChords = getSuggestedModulations(
            primaryScale.root,
            primaryScale.type,
            relatedKey.root,
            relatedKey.scaleType
        );

        // Create comparison card
        const card = document.createElement('div');
        card.className = 'key-comparison-card';

        // Header with key info
        const header = document.createElement('div');
        header.className = 'key-comparison-header';

        const info = document.createElement('div');
        info.className = 'key-comparison-info';

        const name = document.createElement('div');
        name.className = 'key-comparison-name';
        name.textContent = `${relatedKey.root} ${SCALES[relatedKey.scaleType].name}`;

        const relationship = document.createElement('div');
        relationship.className = 'key-comparison-relationship';
        relationship.textContent = relatedKey.relationship;

        const description = document.createElement('div');
        description.className = 'key-comparison-description';
        description.textContent = getRelationshipDescription(relatedKey.relationship);

        info.appendChild(name);
        info.appendChild(relationship);
        info.appendChild(description);

        const pivotCount = document.createElement('div');
        pivotCount.className = 'pivot-count';
        pivotCount.textContent = `${pivotChords.length} Common ${pivotChords.length === 1 ? 'Chord' : 'Chords'}`;

        header.appendChild(info);
        header.appendChild(pivotCount);
        card.appendChild(header);

        // Pivot chords list
        if (pivotChords.length > 0) {
            const pivotsList = document.createElement('div');
            pivotsList.className = 'pivot-chords-list';

            pivotChords.forEach(pivot => {
                const pivotItem = document.createElement('div');
                pivotItem.className = 'pivot-chord-item';

                const pivotName = document.createElement('div');
                pivotName.className = 'pivot-chord-name';
                pivotName.textContent = pivot.chordName;

                const pivotFunctions = document.createElement('div');
                pivotFunctions.className = 'pivot-chord-functions';
                pivotFunctions.innerHTML = `
                    <div>In ${primaryScale.root} ${primaryScale.name}: ${pivot.primaryFunction}</div>
                    <div>In ${relatedKey.root} ${SCALES[relatedKey.scaleType].name}: ${pivot.secondaryFunction}</div>
                `;

                const pivotQuality = document.createElement('div');
                pivotQuality.className = 'pivot-chord-quality';
                pivotQuality.textContent = `Quality: ${pivot.quality}/10`;

                pivotItem.appendChild(pivotName);
                pivotItem.appendChild(pivotFunctions);
                pivotItem.appendChild(pivotQuality);
                pivotsList.appendChild(pivotItem);
            });

            card.appendChild(pivotsList);
        } else {
            const noMessage = document.createElement('div');
            noMessage.className = 'no-pivots-message';
            noMessage.textContent = 'No common chords between these scales';
            card.appendChild(noMessage);
        }

        container.appendChild(card);
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
