# Chorgi 🎵

**Chorgi** is an interactive music theory learning and exploration tool designed to help musicians visualize, understand, and practice chords, scales, and key relationships across multiple instruments.

## Features

### Chord Explorer

Explore diatonic chords across different scales with real-time visualizations on three instruments:

- **Musical Staff (Treble Clef)** - See proper notation with accidentals and ledger lines
- **Piano Roll** - Two-octave keyboard with highlighted chord tones
- **Guitar Fretboard** - All chord positions across 12 frets with color-coded scale degrees

**Additional Features:**
- **Multi-Scale Overlay** - Compare multiple scales simultaneously with color blending
- Visualize where scales share notes and differ
- Customizable colors for each overlay scale
- Toggle visibility of individual scales

### Analysis

Deep dive into key relationships and modulation paths:

- **Related Keys Discovery** - Find all 15+ musically related keys
- **Pivot Chord Analysis** - Identify common chords between keys for smooth modulation
- **Quality Scoring** - Each pivot chord rated 0-10 for modulation effectiveness
- **Popularity Indicators** - Visual hierarchy (High/Medium/Low) for relationship commonality
- **Comprehensive Help Guide** - Built-in guide explaining:
  - Key relationships (relative, parallel, dominant, subdominant, etc.)
  - Distant modulation strategies (7 techniques with examples)
  - Famous song examples for each relationship
  - Music theory terminology reference

### Practice

Interactive chord recognition game to develop your skills:

- **Chord Recognition Challenge** - Click the correct notes on the piano
- **Real-time Feedback** - Immediate validation with detailed error messages
- **Scoring System** - Points, streaks, and accuracy tracking
- **Difficulty Levels:**
  - Beginner: Major & Minor Triads
  - Intermediate: 7th Chords
  - Advanced: Extended Chords
- **Progress Tracking** - Lifetime statistics saved to localStorage
- **Show Answer** - Visual reference with correct notes highlighted in green
- **Scale Selection** - Practice with different major and minor scales

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rewinfrey/chorgi
   cd chorgi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8000`

## Development

### Key Concepts

#### Music Theory Core (`js/core/music-theory.js`)

Pure functions for music theory calculations:
- Scale generation (Major, Natural Minor, Harmonic Minor, Melodic Minor)
- Diatonic chord construction (7th chords)
- Note/MIDI conversions
- Interval calculations

#### State Management (`js/core/state-manager.js`)

Singleton pattern with event-driven architecture:
- Centralized application state
- Event emission for state changes
- Supports primary and overlay scales

#### Visualizations (`js/visualizations/`)

Reusable rendering components:
- Accept data and configuration
- Render to HTML5 Canvas
- Support both normal and overlay modes

### Common Development Tasks

**Adding a new scale type:**
1. Add to `SCALES` constant in `js/core/music-theory.js`
2. Update scale selectors in HTML files

**Adding a new visualization:**
1. Create new file in `js/visualizations/`
2. Import and use in mode-specific JS files

**Adding practice exercises:**
1. Extend `js/practice.js` with new game logic
2. Update `practice.html` with new UI elements

## Roadmap

### Phase 4: Theory Lab (Planned)

- Negative harmony calculator
- Chord inversion visualizer
- Voicing library and comparisons
- Modal interchange explorer
- Circle of fifths interactive diagram

### Phase 5: Progression Builder (Planned)

- Drag-and-drop chord sequencer
- Audio playback with Web Audio API
- Save/share progressions
- Common progression library

### Future Enhancements

- Audio playback for chords and scales
- MIDI input/output support
- Additional instruments (bass, ukulele)
- Mobile responsive design
- Offline PWA support

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ES6+ features (modules, arrow functions, destructuring)
- Follow existing naming conventions
- Add JSDoc comments for functions
- Keep functions small and focused

## License

This project is open source and available under the [MIT License](LICENSE).
